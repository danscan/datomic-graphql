import consumer from '../../consumer';
import edn from 'jsedn';

// Extension attribute idents
const typeNameAttributeIdent = edn.kw(':extGraphQL.type/name');
const typeNamespaceAttributeIdent = edn.kw(':extGraphQL.type/namespace');
const interfaceNameAttributeIdent = edn.kw(':extGraphQL.interface/name');
const interfaceImplementationsAttributeIdent = edn.kw(':extGraphQL.interface/implementations');
const refTargetAttributeIdent = edn.kw(':extGraphQL/refTarget');
const enumValuesAttributeIdent = edn.kw(':extGraphQL/enumValues');

// Extension attributes (partials)
const typeNameAttributePartial = [
  edn.kw(':db/ident'), typeNameAttributeIdent,
  edn.kw(':db/valueType'), edn.kw(':db.type/string'),
  edn.kw(':db/cardinality'), edn.kw(':db.cardinality/one'),
  edn.kw(':db/unique'), edn.kw(':db.unique/value'),
  edn.kw(':db/doc'), 'A type\'s name in the GraphQL type system',
];
const typeNamespaceAttributePartial = [
  edn.kw(':db/ident'), typeNamespaceAttributeIdent,
  edn.kw(':db/valueType'), edn.kw(':db.type/keyword'),
  edn.kw(':db/cardinality'), edn.kw(':db.cardinality/one'),
  edn.kw(':db/unique'), edn.kw(':db.unique/value'),
  edn.kw(':db/doc'), 'The namespace of a type\'s attribute idents in the db',
];
const interfaceNameAttributePartial = [
  edn.kw(':db/ident'), interfaceNameAttributeIdent,
  edn.kw(':db/valueType'), edn.kw(':db.type/string'),
  edn.kw(':db/cardinality'), edn.kw(':db.cardinality/one'),
  edn.kw(':db/unique'), edn.kw(':db.unique/value'),
  edn.kw(':db/doc'), 'An interface\'s name in the GraphQL type system',
];
const interfaceImplementationsAttributePartial = [
  edn.kw(':db/ident'), interfaceImplementationsAttributeIdent,
  edn.kw(':db/valueType'), edn.kw(':db.type/ref'),
  edn.kw(':db/cardinality'), edn.kw(':db.cardinality/many'),
  edn.kw(':db/doc'), 'The types that implement an interface',
];
const refTargetAttributePartial = [
  edn.kw(':db/ident'), refTargetAttributeIdent,
  edn.kw(':db/valueType'), edn.kw(':db.type/ref'),
  edn.kw(':db/cardinality'), edn.kw(':db.cardinality/one'),
  edn.kw(':db/doc'), 'The type or interface that a reference attribute targets',
];
const enumValuesAttributePartial = [
  edn.kw(':db/ident'), enumValuesAttributeIdent,
  edn.kw(':db/valueType'), edn.kw(':db.type/ref'),
  edn.kw(':db/cardinality'), edn.kw(':db.cardinality/many'),
  edn.kw(':db/doc'), 'The possible values of an enumeration-type reference attribute',
];

export default (apiUrl, dbAlias) => {
  const db = consumer(apiUrl, dbAlias);
  const installExtensionAttributesTransactionEdn = new edn.Vector([
    installAttributePartial(typeNameAttributePartial),
    installAttributePartial(typeNamespaceAttributePartial),
    installAttributePartial(interfaceNameAttributePartial),
    installAttributePartial(interfaceImplementationsAttributePartial),
    installAttributePartial(refTargetAttributePartial),
    installAttributePartial(enumValuesAttributePartial),
  ]);

  // Install extesnion attributes if they are not yet installed
  return queryWhetherExtensionAttributesAreInstalled(apiUrl, dbAlias)
    .then(installed => {
      if (!installed) {
        return db.transact(installExtensionAttributesTransactionEdn);
      }
    })
    .catch(error => {
      console.error('Error installing extension attributes... This can happen if some, but not all of the extesnion attributes are installed...');
      throw error;
    });
};

function installAttributePartial(attributePartial) {
  return new edn.Map([
    edn.kw(':db/id'), new edn.Tagged(new edn.Tag('db/id'), new edn.Vector([edn.kw(':db.part/db')])),
    ...attributePartial,
    edn.kw(':db.install/_attribute'), edn.kw(':db.part/db'),
  ]);
}

function queryWhetherExtensionAttributesAreInstalled(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);
  const extensionAttributesQueryPartial = [
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), typeNameAttributeIdent]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), typeNamespaceAttributeIdent]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), interfaceNameAttributeIdent]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), interfaceImplementationsAttributeIdent]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), refTargetAttributeIdent]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), enumValuesAttributeIdent]),
  ];
  const installedAttributesQueryEdn = new edn.Vector([
    edn.kw(':find'), edn.sym('?attr'),
    edn.kw(':where'), new edn.List([edn.sym('or'),
      ...extensionAttributesQueryPartial,
    ]),
  ]);

  return db.query(installedAttributesQueryEdn)
    .then(installedAttributes => !(installedAttributes.length < extensionAttributesQueryPartial.length));
}
