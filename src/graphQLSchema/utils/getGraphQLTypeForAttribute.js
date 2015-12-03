import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLString } from 'graphql';
import { nodeInterface } from './nodeDefinitions';

export default function getGraphQLTypeForAttribute(attribute) {
  switch (attribute.valueType) {
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
  default:
    // FIXME: This should resolve to the right target type or enum, or use node interface
    if (attribute.enumValues) {
      console.log('FIXME: attribute should resolve to enum with values:', attribute.enumValues);
      return GraphQLString;
    } else if (attribute.refTarget) {
      console.log('FIXME: attribute should resolve to ref target type (OR interface):', attribute.refTarget);
      return GraphQLString;
    }

    // Resolve to node interface for arbitrary references
    return nodeInterface;
  }
}
