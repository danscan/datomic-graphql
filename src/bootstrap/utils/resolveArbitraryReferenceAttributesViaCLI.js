import consumer from '../../consumer';
import edn from 'jsedn';
import queryArbitraryReferenceAttributes from './queryArbitraryReferenceAttributes';
import queryInstalledTypes from '../../utils/queryInstalledTypes';
import queryInstalledInterfaces from '../../utils/queryInstalledInterfaces';
import { prompt, Separator } from 'inquirer';
import { isEmpty, keys } from 'underscore';

// (Configuration contants)
const SYSTEM_ATTRIBUTE_NAMESPACES = [':db', ':fressian', ':extGraphQL'];

// (Value constants)
const ENUM = 'ENUM';
const INTERFACE = 'INTERFACE';
const NEW_INTERFACE = 'NEW_INTERFACE';
const SKIP = 'SKIP';

export default function resolveArbitraryReferenceAttributesViaCLI(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);

  return Promise.all([
    queryArbitraryReferenceAttributes(apiUrl, dbAlias),
    queryInstalledTypes(apiUrl, dbAlias),
    queryInstalledInterfaces(apiUrl, dbAlias),
  ])
  .then(([arbitraryReferenceAttributes, installedTypes, installedInterfaces]) => {
    return arbitraryReferenceAttributes.reduce((promiseChain, [ident, doc]) => {
      const attributeNamespace = edn.kw(ident).ns;

      // Exclude system-namespaced attributes from resolution...
      if (SYSTEM_ATTRIBUTE_NAMESPACES.find(ns => attributeNamespace.indexOf(ns) >= 0)) {
        return promiseChain;
      }

      return promiseChain
        .then(aggregateAnswers => {
          return promptForArbitraryReferenceTypeSpecification({ ident, doc }, installedTypes, installedInterfaces, aggregateAnswers);
        });
    }, Promise.resolve([]));
  })
  .then(answers => {
    return Promise.all(answers.reduce((aggregateTransactionsEdnArray, { ident, spec }) => {
      let transactionEdn;

      if (spec.typeName || spec.interfaceName) {
        transactionEdn = buildRefTargetAttributeTransaction(ident, spec);
      }

      if (spec.enumNamespace) {
        transactionEdn = buildEnumValuesAttributeTransaction(ident, spec, db);
      }

      if (spec.newInterface) {
        transactionEdn = buildNewInterfaceAttributeTransaction(ident, spec, db);
      }

      if (transactionEdn) {
        return [
          ...aggregateTransactionsEdnArray,
          transactionEdn,
        ];
      }

      return aggregateTransactionsEdnArray;
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
function buildRefTargetAttributeTransaction(attributeIdent, spec) {
  const targetLookupRef = spec.typeName
                  ? new edn.Vector([edn.kw(':extGraphQL.type/name'), spec.typeName])
                  : new edn.Vector([edn.kw(':extGraphQL.interface/name'), spec.interfaceName]);

  return new edn.Map([
    edn.kw(':db/id'), edn.kw(attributeIdent),
    edn.kw(':extGraphQL/refTarget'), targetLookupRef,
  ]);
}

function buildEnumValuesAttributeTransaction(attributeIdent, spec, db) {
  const { enumNamespace } = spec;

  return db.query(new edn.Vector([
    edn.kw(':find'), edn.sym('?ident'), edn.kw(':where'),
    new edn.Vector([
      edn.sym('?e'), edn.kw(':db/ident'), edn.sym('?ident'),
    ]),
  ]))
  .then(idents => idents.filter(ident => edn.kw(ident).ns === enumNamespace))
  .then(enumValues => enumValues.map(enumValue => edn.kw(enumValue)))
  .then(enumValueKeywords => {
    return new edn.Map([
      edn.kw(':db/id'), edn.kw(attributeIdent),
      edn.kw(':extGraphQL/enumValues'), new edn.Vector(enumValueKeywords),
    ]);
  });
}

function buildNewInterfaceAttributeTransaction(attributeIdent, spec, db) {
  const { newInterface: { name, types } } = spec;
  const newInterfaceLookupRef = new edn.Vector([edn.kw(':extGraphQL.interface/name'), name]);

  return db.query(new edn.Vector([
    edn.kw(':find'), edn.sym('?e'), edn.kw(':where'),
    new edn.List([edn.sym('or'),
      ...types.map(type => new edn.Vector([edn.sym('?e'), edn.kw(':extGraphQL.type/name'), type])),
    ]),
  ]))
  .then(typeVectors => typeVectors.map(vector => vector[0]))
  .then(typeEntities => db.transact(new edn.Vector([new edn.Map([
    edn.kw(':db/id'), new edn.Tagged(new edn.Tag('db/id'), new edn.Vector([edn.kw(':db.part/user')])),
    edn.kw(':extGraphQL.interface/name'), name,
    edn.kw(':extGraphQL.interface/implementations'), new edn.Vector(typeEntities),
  ])])))
  .then(() => {
    return new edn.Map([
      edn.kw(':db/id'), edn.kw(attributeIdent),
      edn.kw(':extGraphQL/refTarget'), newInterfaceLookupRef,
    ]);
  });
}

// - CLI prompt helpers -
function promptForArbitraryReferenceTypeSpecification({ ident, doc }, installedTypes, installedInterfaces, aggregateAnswers) {
  return promptWithConfirm([{
    name: 'refTarget',
    type: 'list',
    message: `
      What type/enum/interface does the attribute "${ident}" target?
      [doc: "${doc}"]
    `,
    choices: [
      ENUM,
      INTERFACE,
      SKIP,
      new Separator(),
      ...keys(installedTypes),
    ],
  }], ({ refTarget }) => {
    // if user selected enum for, prompt for prefix
    if (refTarget === ENUM) {
      return promptForEnumNamespace({ ident, doc }, aggregateAnswers);
    }

    // if user selected interface, prompt for types
    if (refTarget === INTERFACE) {
      return promptForInterfaceSpecification({ ident, doc }, installedTypes, installedInterfaces, aggregateAnswers);
    }

    // If user selected to skip, skip...
    if (refTarget === SKIP) {
      return aggregateAnswers;
    }

    return [
      ...aggregateAnswers,
      { ident, spec: { typeName: refTarget } },
    ];
  }, aggregateAnswers);
}

function promptForEnumNamespace({ ident, doc }, aggregateAnswers) {
  return promptWithConfirm([{
    name: 'enumNamespace',
    type: 'input',
    message: `
      Enter the namespace for enum values for the attribute "${ident}"
      [doc: "${doc}"]
    `,
  }], ({ enumNamespace }) => {
    return [
      ...aggregateAnswers,
      { ident, spec: { enumNamespace } },
    ];
  }, aggregateAnswers);
}

function promptForInterfaceSpecification({ ident, doc }, installedTypes, installedInterfaces, aggregateAnswers) {
  return promptWithConfirm([{
    name: 'interfaceChoice',
    type: 'list',
    message: `What interface does the attribute "${ident}" target?`,
    choices: [
      NEW_INTERFACE,
      new Separator(),
      ...keys(installedInterfaces),
    ],
  }], ({ interfaceChoice }) => {
    // if user selected enum for, prompt for prefix
    if (interfaceChoice === NEW_INTERFACE) {
      return promptForNewInterfaceSpecification({ ident, doc }, installedTypes, aggregateAnswers);
    }

    return [
      ...aggregateAnswers,
      { ident, spec: { interfaceName: interfaceChoice } },
    ];
  }, aggregateAnswers);
}

function promptForNewInterfaceSpecification({ ident, doc }, installedTypes, aggregateAnswers) {
  return promptWithConfirm([{
    name: 'name',
    type: 'input',
    message: 'Enter the name of the new interface (should be PascalCased):',
  }, {
    name: 'types',
    type: 'checkbox',
    message: 'Choose the types that should implement the interface',
    choices: [
      ...keys(installedTypes),
    ],
  }], ({ name, types }) => {
    return [
      ...aggregateAnswers,
      { ident, spec: { newInterface: { name, types } } },
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
