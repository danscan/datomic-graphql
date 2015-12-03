import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { registerEntityType, getRegisteredTypeForValueType, getRegisteredConnectionTypeForValueType } from './utils/typeRegistry';
import { map } from 'underscore';

export default (apiUrl, dbAlias, schemaImpliedTypes) => {
  const registeredTypes = map(schemaImpliedTypes, (entityType, entityTypeName) => registerEntityType(entityType, entityTypeName));

  return registeredTypes;
};
