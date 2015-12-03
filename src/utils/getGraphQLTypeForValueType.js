import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLString } from 'graphql';

// (Value constants)
export const ARBITRARY_REFERENCE_TYPE = 'ARBITRARY_REFERENCE_TYPE';

export default function getGraphQLTypeForValueType(valueType) {
  switch (valueType) {
  case 'boolean':
    return GraphQLBoolean;
  case 'float':
  case 'double':
  case 'bigdec':
    return GraphQLFloat;
  case 'long':
  case 'bigint':
    return GraphQLInt;
  case 'keyword':
  case 'instant':
  case 'string':
  case 'uuid':
  case 'uri':
  case 'bytes':
    return GraphQLString;
  case 'ref':
    // FIXME: This should resolve to the right target type or enum, or use node interface
    return ARBITRARY_REFERENCE_TYPE;
  default:
    return null;
  }
}
