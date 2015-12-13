import { GraphQLSchema } from 'graphql';
import getRootQueryType from './getRootQueryType';

export default function getGraphQLSchema(apiUrl, dbAlias) {
  return Promise.all([
    getRootQueryType(apiUrl, dbAlias),
  ])
  .then(([rootQueryType]) => {
    return new GraphQLSchema({
      query: rootQueryType,
    });
  });
}
