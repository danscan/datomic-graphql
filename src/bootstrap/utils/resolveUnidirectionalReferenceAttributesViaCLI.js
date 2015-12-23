import consumer from '../../consumer';
import edn from 'jsedn';
import queryUnidirectionalReferenceAttributes from './queryUnidirectionalReferenceAttributes';
import queryInstalledTypes from '../../utils/queryInstalledTypes';
import queryInstalledInterfaces from '../../utils/queryInstalledInterfaces';
import { getAttributeIdentFromAttributeNameAndTypeName } from '../../utils/inflect';
import { prompt } from 'inquirer';
import { isEmpty } from 'underscore';

// (Configuration contants)
const SYSTEM_ATTRIBUTE_NAMESPACES = [':db', ':fressian', ':extGraphQL'];

export default function resolveUnidirectionalReferenceAttributesViaCLI(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);

  return Promise.all([
    queryUnidirectionalReferenceAttributes(apiUrl, dbAlias),
    queryInstalledTypes(apiUrl, dbAlias),
    queryInstalledInterfaces(apiUrl, dbAlias),
  ])
  .then(([unidirectionalReferenceAttributes, installedTypes, installedInterfaces]) => {
    return unidirectionalReferenceAttributes.reduce((promiseChain, [ident, doc, refTargetTypeName]) => {
      const attributeNamespace = edn.kw(ident).ns;

      // Exclude system-namespaced attributes from resolution...
      if (SYSTEM_ATTRIBUTE_NAMESPACES.find(ns => attributeNamespace.indexOf(ns) >= 0)) {
        return promiseChain;
      }

      return promiseChain
        .then(aggregateAnswers => {
          return promptForReverseRefFieldSelection({ ident, doc, refTargetTypeName }, installedTypes, installedInterfaces, aggregateAnswers);
        });
    }, Promise.resolve([]));
  })
  .then(answers => {
    return Promise.all(answers.reduce((aggregateTransactionsEdnArray, { ident, reverseRefField }) => {
      const transactionEdn = buildReverseRefFieldAttributeTransaction(ident, reverseRefField);

      return [
        ...aggregateTransactionsEdnArray,
        transactionEdn,
      ];
    }, []))
    .then(transactionsEdnArray => {
      const transactionsEdn = new edn.Vector(transactionsEdnArray);

      // Don't transact if there's nothing to transact...
      if (isEmpty(transactionsEdnArray)) {
        return null;
      }

      return db.transact(transactionsEdn);
    });
  });
}

// - Transaction builder helpers -
function buildReverseRefFieldAttributeTransaction(attributeIdent, reverseRefField) {
  return new edn.Map([
    edn.kw(':db/id'), edn.kw(attributeIdent),
    edn.kw(':extGraphQL/reverseRefField'), reverseRefField,
  ]);
}

// - CLI prompt helpers -
function promptForReverseRefFieldSelection({ ident, doc, refTargetTypeName }, installedTypes, installedInterfaces, aggregateAnswers) {
  return promptWithConfirm([{
    name: 'reverseRefField',
    type: 'input',
    message: `
      What field of type ${refTargetTypeName} should provide a reverse reference to ${ident}.
      [doc: "${doc}"]
    `,
  }], ({ reverseRefField }) => {
    const reverseRefFieldKeyword = getAttributeIdentFromAttributeNameAndTypeName(reverseRefField, refTargetTypeName);

    return [
      ...aggregateAnswers,
      { ident, reverseRefField: reverseRefFieldKeyword },
    ];
  }, aggregateAnswers);
}

function promptWithConfirm(questions, transformAnswers, aggregateAnswers) {
  return new Promise(resolve => {
    return prompt([...questions, {
      name: 'confirmed',
      type: 'confirm',
      message: 'Confirm?',
    }], (answers) => {
      if (!answers.confirmed) {
        return resolve(promptWithConfirm(questions, transformAnswers, aggregateAnswers));
      }

      return resolve(transformAnswers(answers));
    });
  });
}
