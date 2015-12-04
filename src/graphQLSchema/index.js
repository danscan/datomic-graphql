import { GraphQLSchema } from 'graphql';
import { registerEntityType } from './utils/typeRegistry';
import createRootQueryType from './utils/createRootQueryType';
import { map } from 'underscore';

export default (apiUrl, dbAlias, schemaImpliedTypes) => {
  const registeredTypes = map(schemaImpliedTypes, (entityType, entityTypeName) => registerEntityType(entityType, entityTypeName));

  return new GraphQLSchema({
    query: createRootQueryType(registeredTypes),
  });
};
