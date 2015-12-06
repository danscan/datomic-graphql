import { GraphQLObjectType } from 'graphql';
import { connectionArgs, connectionFromArray } from 'graphql-relay';
import { getInstanceQueryFieldNameFromTypeName, getConnectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import getGraphQLTypeForSchemaType from './getGraphQLTypeForSchemaType';
import getGraphQLConnectionTypeForSchemaType from './getGraphQLConnectionTypeForSchemaType';
import getNodeDefinitions from './getNodeDefinitions';
import getSchemaTypesAndInterfaces from '../../utils/getSchemaTypesAndInterfaces';
import getQueryInputArgsForSchemaType from './getQueryInputArgsForSchemaType';
import { reduce } from 'underscore';

export default (apiUrl, dbAlias) => {
  const { nodeField } = getNodeDefinitions(apiUrl, dbAlias);

  return generateRootQueryFields(apiUrl, dbAlias)
    .then(rootQueryFields => {
      return new GraphQLObjectType({
        name: 'Query',
        description: 'Root query type',
        fields: () => ({
          // Relay root query node field
          node: nodeField,

          ...rootQueryFields,
        }),
      });
    });
};

function generateRootQueryFields(apiUrl, dbAlias) {
  return getSchemaTypesAndInterfaces(apiUrl, dbAlias)
    .then(({ schemaTypes, schemaInterfaces }) => {
      return reduce(schemaTypes, (aggregateFields, schemaType, schemaTypeName) => {
        // Field names
        const instanceQueryFieldName = getInstanceQueryFieldNameFromTypeName(schemaTypeName);
        const connectionQueryFieldName = getConnectionQueryFieldNameFromTypeName(schemaTypeName);

        // Field output types
        const instanceGraphQLType = getGraphQLTypeForSchemaType(schemaType, schemaTypeName);
        const connectionGraphQLType = getGraphQLConnectionTypeForSchemaType(schemaType, schemaTypeName);

        return {
          ...aggregateFields,
          [instanceQueryFieldName]: {
            type: instanceGraphQLType,
            args: getQueryInputArgsForSchemaType(schemaType, schemaTypeName),
            resolve: (query, args) => resolveInstanceFieldQuery(query, args),
          },
          [connectionQueryFieldName]: {
            type: connectionGraphQLType,
            args: { ...getQueryInputArgsForSchemaType(schemaType, schemaTypeName), ...connectionArgs },
            resolve: (query, args) => resolveConnectionFieldQuery(query, args),
          },
        };
      }, {});
    });
}

function resolveInstanceFieldQuery(query, args) {
  console.log('resolveInstanceFieldQuery... query:', query);
  console.log('resolveInstanceFieldQuery... args:', args);
  return {};
}

function resolveConnectionFieldQuery(query, args) {
  console.log('resolveConnectionFieldQuery... query:', query);
  console.log('resolveConnectionFieldQuery... args:', args);
  return connectionFromArray([], args);
}
