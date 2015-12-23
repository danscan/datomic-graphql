import consumer from '../../consumer';
import { GraphQLObjectType } from 'graphql';
import { connectionArgs } from 'graphql-relay';
import { getInstanceQueryFieldNameFromTypeName, getConnectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import getNodeDefinitions from '../getNodeDefinitions';
import getGraphQLTypeForSchemaType from '../utils/getGraphQLTypeForSchemaType';
import getGraphQLConnectionTypeForSchemaType from '../utils/getGraphQLConnectionTypeForSchemaType';
import getSchemaTypesAndInterfaces from '../../utils/getSchemaTypesAndInterfaces';
import getQueryInputArgsForSchemaType from '../utils/getQueryInputArgsForSchemaType';
import resolveInstanceFieldQuery from '../utils/resolveInstanceFieldQuery';
import resolveConnectionFieldQuery from '../utils/resolveConnectionFieldQuery';
import { reduce } from 'underscore';

export default function getRootQueryType(apiUrl, dbAlias) {
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
}

function generateRootQueryFields(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);

  return getSchemaTypesAndInterfaces(apiUrl, dbAlias)
    .then(({ schemaTypes, schemaInterfaces }) => {
      return reduce(schemaTypes, (aggregateFields, schemaType, schemaTypeName) => {
        // Field names
        const instanceQueryFieldName = getInstanceQueryFieldNameFromTypeName(schemaTypeName);
        const connectionQueryFieldName = getConnectionQueryFieldNameFromTypeName(schemaTypeName);

        // Field output types
        const instanceGraphQLType = getGraphQLTypeForSchemaType({ schemaType, schemaTypeName }, apiUrl, dbAlias);
        const connectionGraphQLType = getGraphQLConnectionTypeForSchemaType({ schemaType, schemaTypeName }, apiUrl, dbAlias);

        return {
          ...aggregateFields,
          [instanceQueryFieldName]: {
            type: instanceGraphQLType,
            args: getQueryInputArgsForSchemaType(schemaType, schemaTypeName),
            resolve: (query, args) => resolveInstanceFieldQuery({
              parent: query,
              fieldName: instanceQueryFieldName,
              args,
              schemaTypeName,
              db,
            }),
          },
          [connectionQueryFieldName]: {
            type: connectionGraphQLType,
            args: { ...getQueryInputArgsForSchemaType(schemaType, schemaTypeName), ...connectionArgs },
            resolve: (query, args) => resolveConnectionFieldQuery({
              parent: query,
              fieldName: connectionQueryFieldName,
              args,
              schemaTypeName,
              db,
            }),
          },
        };
      }, {});
    });
}
