import bootstrap from './bootstrap';
import getGraphQLSchema from './graphQLSchema';

export default (apiUrl, dbAlias) => {
  return bootstrap(apiUrl, dbAlias)
    .then((schemaImpliedTypes) => getGraphQLSchema(apiUrl, dbAlias, schemaImpliedTypes));
};
