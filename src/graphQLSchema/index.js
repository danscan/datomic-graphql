import { GraphQLSchema } from 'graphql';
import createRootQueryType from './utils/createRootQueryType';

export default (apiUrl, dbAlias) => {
  return Promise.all([
    createRootQueryType(apiUrl, dbAlias),
  ])
  .then(([rootQueryType]) => {
    return new GraphQLSchema({
      query: rootQueryType,
    });
  });
};
