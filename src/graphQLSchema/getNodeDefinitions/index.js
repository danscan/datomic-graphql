import consumer from '../../consumer';
import { fromGlobalId, nodeDefinitions } from 'graphql-relay';
import { types } from '../utils/getGraphQLTypeForSchemaType';
import getObjectFromEntity from '../../utils/getObjectFromEntity';
import { memoize } from 'underscore';

// Export memoized function to avoid creating multiple types with name "Node"
// on schema...
// NOTE: This should *never* return more than one unique value during runtime...
// maybe the memoize is inappropriate...
export default memoize(function getNodeDefinitions(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);

  return nodeDefinitions(
    (globalId) => {
      const { type, id } = fromGlobalId(globalId);

      return db.getEntity(id)
        .then(entity => getObjectFromEntity(entity, type));
    },
    (object) => {
      const type = types[object.__typeName];

      return type;
    }
  );
}, function getHashKey(...args) {
  // Use both apiUrl & dbAlias in hash key...
  return args.join('__');
});
