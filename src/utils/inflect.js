import Inflect from 'i';
import edn from 'jsedn';

// Initialize inflector util
const inflect = new Inflect();

// - From Attribute Ident -
export function getTypeNameFromAttributeIdent(attributeIdent) {
  const attributeIdentEdn = edn.kw(attributeIdent);
  const attributeIdentNamespace = attributeIdentEdn.ns;
  const attributeTypeName = inflect.camelize(attributeIdentNamespace.replace(':', ''));

  return attributeTypeName;
}

export function getAttributeNameFromAttributeIdent(attributeIdent) {
  const attributeIdentEdn = edn.kw(attributeIdent);
  const attributeName = attributeIdentEdn.name;

  return attributeName;
}

// - From Type Name -
export function getTypeNamespaceFromTypeName(typeName) {
  const typeNamespace = `:${inflect.camelize(typeName, false)}`;

  return typeNamespace;
}

export function getInstanceQueryFieldNameFromTypeName(typeName) {
  const instanceQueryFieldName = inflect.camelize(typeName, false);

  return instanceQueryFieldName;
}

export function getCollectionQueryFieldNameFromTypeName(typeName) {
  const instanceQueryFieldName = getInstanceQueryFieldNameFromTypeName(typeName);
  const collectionQueryFieldName = inflect.pluralize(instanceQueryFieldName);

  return collectionQueryFieldName;
}
