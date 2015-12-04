import { GraphQLObjectType } from 'graphql';
import { nodeField } from './nodeDefinitions';
import { getInstanceQueryFieldNameFromTypeName, getCollectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import { getRegisteredTypeForTypeName, getRegisteredConnectionTypeForTypeName } from './typeRegistry';

export default (registeredTypes) => {
  return new GraphQLObjectType({
    name: 'Query',
    description: 'Root query type',
    fields: () => ({
      // Relay root query node field
      node: nodeField,

      ...generateQueryFieldsForRegisteredTypes(registeredTypes),
    }),
  });
};

function generateQueryFieldsForRegisteredTypes(registeredTypes) {
  return registeredTypes.reduce((aggregateFields, type) => {
    const instanceQueryFieldName = getInstanceQueryFieldNameFromTypeName(type.name);
    const collectionQueryFieldName = getCollectionQueryFieldNameFromTypeName(type.name);

    return {
      ...aggregateFields,
      [instanceQueryFieldName]: {
        type: getRegisteredTypeForTypeName(type.name),
      },
      [collectionQueryFieldName]: {
        type: getRegisteredConnectionTypeForTypeName(type.name),
      },
    };
  }, {});
}
