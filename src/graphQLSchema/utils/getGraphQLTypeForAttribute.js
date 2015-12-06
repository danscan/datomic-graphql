import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLString } from 'graphql';
import { types } from './getGraphQLTypeForSchemaType';
import { connectionTypes } from './getGraphQLConnectionTypeForSchemaType';
import getGraphQLEnumTypeForAttribute from './getGraphQLEnumTypeForAttribute';

// (Value constants)
const CARDINALITY_ONE = 'one';

export default function getGraphQLTypeForAttribute(attribute, attributeName) {
  const typeIsEnumType = attribute.valueType === 'ref' && !!attribute.enumValues;
  const typeIsReferenceType = !typeIsEnumType && attribute.valueType === 'ref';
  const typeIsArbitraryReferenceType = typeIsReferenceType && !attribute.refTarget;
  const typeIsScalarType = !typeIsEnumType && !typeIsReferenceType;
  const typeIsScalarListType = typeIsScalarType && attribute.cardinality !== CARDINALITY_ONE;
  let scalarType;

  switch (attribute.valueType) {
  case 'boolean':
    scalarType = GraphQLBoolean;
    break;
  case 'float':
  case 'double':
  case 'bigdec':
    scalarType = GraphQLFloat;
    break;
  case 'long':
  case 'bigint':
    scalarType = GraphQLInt;
    break;
  case 'keyword':
  case 'instant':
  case 'string':
  case 'uuid':
  case 'uri':
  case 'bytes':
  default:
    scalarType = GraphQLString;
  }

  if (typeIsEnumType) {
    return getGraphQLEnumTypeForAttribute(attribute, attributeName);
  }

  if (typeIsReferenceType) {
    // Resolve to target type or connection depending on attribute cardinality
    return attribute.cardinality === CARDINALITY_ONE
            ? types[attribute.refTarget]
            : connectionTypes[attribute.refTarget];
  } else if (typeIsArbitraryReferenceType) {
    // FIXME: Resolve to node interface for arbitrary references
    return GraphQLString;
  }

  if (typeIsScalarListType) {
    return new GraphQLList(scalarType);
  }

  return scalarType;
}
