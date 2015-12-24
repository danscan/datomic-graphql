import { connectionTypes } from './getGraphQLConnectionTypeForSchemaType';

export default function getGraphQLTypeForReverseReferenceAttribute(attributeReverseRefTypeName) {
  return connectionTypes[attributeReverseRefTypeName];
}
