import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLString } from 'graphql';
import { nodeInterface } from './nodeDefinitions';
import { getRegisteredTypeForTypeName, getRegisteredConnectionTypeForTypeName } from './typeRegistry';

// (Value constants)
const CARDINALITY_ONE = 'one';

export default function getGraphQLTypeForAttribute(attribute) {
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
    // FIXME: This should resolve to the right enum
    console.log('FIXME: attribute should resolve to enum... attribute:', attribute);
    return GraphQLString;
  }

  if (typeIsReferenceType) {
    // Resolve to target type or connection depending on attribute cardinality
    return attribute.cardinality === CARDINALITY_ONE
            ? getRegisteredTypeForTypeName(attribute.refTarget)
            : getRegisteredConnectionTypeForTypeName(attribute.refTarget);
  } else if (typeIsArbitraryReferenceType) {
    // Resolve to node interface for arbitrary references
    return nodeInterface;
  }

  if (typeIsScalarListType) {
    return new GraphQLList(scalarType);
  }

  return scalarType;
}
