import bootstrap from './bootstrap';
import getGraphQLSchema from './graphQLSchema';

export default (apiUrl, dbAlias) => {
  return bootstrap(apiUrl, dbAlias)
    .then(() => getGraphQLSchema(apiUrl, dbAlias));
};
