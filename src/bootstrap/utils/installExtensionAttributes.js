import consumer from '../../consumer';
import edn from 'jsedn';
import {
  extensionAttributeIdentKeywords,
  extensionAttributeValueTypeKeywords,
  extensionAttributeCardinalityKeywords,
  extensionAttributeUniqueKeywords,
  extensionAttributeDocStrings,
  TYPE_NAME,
  TYPE_NAMESPACE,
  TYPE_DOC,
  INTERFACE_NAME,
  INTERFACE_IMPLEMENTATIONS,
  INTERFACE_DOC,
  REF_TARGET,
  ENUM_VALUES,
  REVERSE_REF_FIELD,
} from '../../constants/extensionAttributes';

// (Extension attributes (partials))
const typeNameAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[TYPE_NAME],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[TYPE_NAME],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[TYPE_NAME],
  edn.kw(':db/unique'), extensionAttributeUniqueKeywords[TYPE_NAME],
  edn.kw(':db/doc'), extensionAttributeDocStrings[TYPE_NAME],
];
const typeNamespaceAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[TYPE_NAMESPACE],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[TYPE_NAMESPACE],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[TYPE_NAMESPACE],
  edn.kw(':db/unique'), extensionAttributeUniqueKeywords[TYPE_NAMESPACE],
  edn.kw(':db/doc'), extensionAttributeDocStrings[TYPE_NAMESPACE],
];
const typeDocAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[TYPE_DOC],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[TYPE_DOC],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[TYPE_DOC],
  edn.kw(':db/doc'), extensionAttributeDocStrings[TYPE_DOC],
];
const interfaceNameAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[INTERFACE_NAME],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[INTERFACE_NAME],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[INTERFACE_NAME],
  edn.kw(':db/unique'), extensionAttributeUniqueKeywords[INTERFACE_NAME],
  edn.kw(':db/doc'), extensionAttributeDocStrings[INTERFACE_NAME],
];
const interfaceImplementationsAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[INTERFACE_IMPLEMENTATIONS],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[INTERFACE_IMPLEMENTATIONS],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[INTERFACE_IMPLEMENTATIONS],
  edn.kw(':db/doc'), extensionAttributeDocStrings[INTERFACE_IMPLEMENTATIONS],
];
const interfaceDocAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[INTERFACE_DOC],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[INTERFACE_DOC],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[INTERFACE_DOC],
  edn.kw(':db/doc'), extensionAttributeDocStrings[INTERFACE_DOC],
];
const refTargetAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[REF_TARGET],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[REF_TARGET],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[REF_TARGET],
  edn.kw(':db/doc'), extensionAttributeDocStrings[REF_TARGET],
];
const enumValuesAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[ENUM_VALUES],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[ENUM_VALUES],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[ENUM_VALUES],
  edn.kw(':db/doc'), extensionAttributeDocStrings[ENUM_VALUES],
];
const reverseRefFieldAttributePartial = [
  edn.kw(':db/ident'), extensionAttributeIdentKeywords[REVERSE_REF_FIELD],
  edn.kw(':db/valueType'), extensionAttributeValueTypeKeywords[REVERSE_REF_FIELD],
  edn.kw(':db/cardinality'), extensionAttributeCardinalityKeywords[REVERSE_REF_FIELD],
  edn.kw(':db/unique'), extensionAttributeUniqueKeywords[REVERSE_REF_FIELD],
  edn.kw(':db/doc'), extensionAttributeDocStrings[REVERSE_REF_FIELD],
];

export default function installExtensionAttributes(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);
  const installExtensionAttributesTransactionEdn = new edn.Vector([
    installAttributePartial(typeNameAttributePartial),
    installAttributePartial(typeNamespaceAttributePartial),
    installAttributePartial(typeDocAttributePartial),
    installAttributePartial(interfaceNameAttributePartial),
    installAttributePartial(interfaceImplementationsAttributePartial),
    installAttributePartial(interfaceDocAttributePartial),
    installAttributePartial(refTargetAttributePartial),
    installAttributePartial(enumValuesAttributePartial),
    installAttributePartial(reverseRefFieldAttributePartial),
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
}

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
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[TYPE_NAME]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[TYPE_NAMESPACE]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[TYPE_DOC]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[INTERFACE_NAME]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[INTERFACE_IMPLEMENTATIONS]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[INTERFACE_DOC]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[REF_TARGET]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[ENUM_VALUES]]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), extensionAttributeIdentKeywords[REVERSE_REF_FIELD]]),
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
