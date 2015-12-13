import consumer from '../../consumer';
import edn from 'jsedn';
import querySchemaImpliedTypes from '../../utils/querySchemaImpliedTypes';
import queryInstalledTypes from '../../utils/queryInstalledTypes';
import { getTypeNamespaceFromTypeName } from '../../utils/inflect';
import { difference, isEmpty, keys } from 'underscore';

export default function applySchemaImpliedTypes(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);

  return Promise.all([
    querySchemaImpliedTypes(apiUrl, dbAlias),
    queryInstalledTypes(apiUrl, dbAlias),
  ])
  .then(([schemaImpliedTypes, installedTypes]) => {
    const schemaImpliedTypeNames = keys(schemaImpliedTypes);
    const installedTypeNames = keys(installedTypes);
    const typesNamesToInstall = difference(schemaImpliedTypeNames, installedTypeNames);
    const typesNamesToRetract = difference(installedTypeNames, schemaImpliedTypeNames);

    // If there are no types to install or retract, bail...
    if (isEmpty(typesNamesToInstall) && isEmpty(typesNamesToRetract)) {
      return null;
    }

    console.log('typesNamesToInstall:', typesNamesToInstall);
    console.log('typesNamesToRetract:', typesNamesToRetract);
    const installTypeTransactionsEdn = typesNamesToInstall.map(typeName => getInstallTypeTransactionEdn(typeName));
    const retractTypeTransactionsEdn = typesNamesToRetract.map(typeName => getRetractTypeTransactionEdn(typeName));

    const applyTypesTransactionEdn = new edn.Vector([
      ...installTypeTransactionsEdn,
      ...retractTypeTransactionsEdn,
    ]);

    return db.transact(applyTypesTransactionEdn);
  });
}

function getInstallTypeTransactionEdn(typeName) {
  const typeNamespace = getTypeNamespaceFromTypeName(typeName);

  return new edn.Map([
    edn.kw(':db/id'), new edn.Tagged(new edn.Tag('db/id'), new edn.Vector([edn.kw(':db.part/user')])),
    edn.kw(':extGraphQL.type/name'), typeName,
    edn.kw(':extGraphQL.type/namespace'), edn.kw(typeNamespace),
  ]);
}

function getRetractTypeTransactionEdn(typeName) {
  return new edn.Vector([
    edn.kw(':db.fn/retractEntity'),
    new edn.Vector([edn.kw(':extGraphQL.type/name'), typeName]),
  ]);
}
