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

export function getConnectionQueryFieldNameFromTypeName(typeName) {
  const instanceQueryFieldName = getInstanceQueryFieldNameFromTypeName(typeName);
  const connectionQueryFieldName = inflect.pluralize(instanceQueryFieldName);

  return connectionQueryFieldName;
}

// - From Type Name and Attribute Name -
export function getAttributeIdentFromAttributeNameAndTypeName(attributeName, typeName) {
  const attributeIdentNamespace = `:${inflect.camelize(typeName, false)}`;
  const attributeIdentString = `${attributeIdentNamespace}/${attributeName}`;
  const attributeIdent = edn.kw(attributeIdentString);

  return attributeIdent;
}

// - From Reverse Ref Field -
export function getReverseRefTypeNameFromReverseRefField(reverseRefField) {
  const reverseRefFieldEdn = edn.kw(reverseRefField);
  const reverseRefFieldNamespace = reverseRefFieldEdn.ns;
  const reverseRefTypeName = inflect.camelize(reverseRefFieldNamespace.replace(':', ''));

  return reverseRefTypeName;
}

export function getReverseRefFieldNameFromReverseRefField(reverseRefField) {
  const reverseRefFieldEdn = edn.kw(reverseRefField);
  const reverseRefFieldName = reverseRefFieldEdn.name;

  return reverseRefFieldName;
}
