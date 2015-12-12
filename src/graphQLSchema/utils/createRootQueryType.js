import { GraphQLObjectType } from 'graphql';
import { connectionArgs, connectionFromArray } from 'graphql-relay';
import { getInstanceQueryFieldNameFromTypeName, getConnectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import getGraphQLTypeForSchemaType from './getGraphQLTypeForSchemaType';
import getGraphQLConnectionTypeForSchemaType from './getGraphQLConnectionTypeForSchemaType';
import getNodeDefinitions from './getNodeDefinitions';
import getSchemaTypesAndInterfaces from '../../utils/getSchemaTypesAndInterfaces';
import getQueryEdnFromArgsAndContext from './getQueryEdnFromArgsAndContext';
import getQueryInputArgsForSchemaType from './getQueryInputArgsForSchemaType';
import consumer from '../../consumer';
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
  const db = consumer(apiUrl, dbAlias);

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
            resolve: (query, args, context) => resolveInstanceFieldQuery({ query, args, context, db }),
          },
          [connectionQueryFieldName]: {
            type: connectionGraphQLType,
            args: { ...getQueryInputArgsForSchemaType(schemaType, schemaTypeName), ...connectionArgs },
            resolve: (query, args, context) => resolveConnectionFieldQuery({ query, args, context, db }),
          },
        };
      }, {});
    });
}

function resolveInstanceFieldQuery({ query, args, context, db }) {
  console.log('resolveInstanceFieldQuery... query:', query);
  const queryEdn = getQueryEdnFromArgsAndContext(args, context);

  return db.query(queryEdn)
    .then(results => results[0] || null);
}

function resolveConnectionFieldQuery({ query, args, context, db }) {
  console.log('resolveConnectionFieldQuery... query:', query);
  const queryEdn = getQueryEdnFromArgsAndContext(args, context, true);

  return db.query(queryEdn)
    .then(results => connectionFromArray(results, args));
}
