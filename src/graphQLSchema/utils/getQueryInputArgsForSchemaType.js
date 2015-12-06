import { mapObject } from 'underscore';

export default function getQueryInputArgsForSchemaType(schemaType, schemaTypeName) {
  // console.log('getQueryInputArgsForSchemaType... schemaTypeName:', schemaTypeName, 'schemaType:', schemaType);
}

// AttributePredicateType {
//   '=': AttributeValueType,
//   '!=': AttributeValueType,
//   '>': AttributeValueType,
//   '>=': AttributeValueType,
//   '<': AttributeValueType,
//   '<=': AttributeValueType,
//
//   missing: true,
//
//   not: AttributePredicateType
//   or: GraphQLList(AttributePredicateType),
//   and: GraphQLList(AttributePredicateType),
// }
function createAttributePredicateType(attribute) {
  console.log('createAttributePredicateType... attribute:', attribute);
}
