import consumer from '../../consumer';
import { fromGlobalId, nodeDefinitions } from 'graphql-relay';
import { types } from '../utils/getGraphQLTypeForSchemaType';
import { getAttributeNameFromAttributeIdent } from '../../utils/inflect';
import { reduce, memoize } from 'underscore';

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
        .then(entity => {
          const initialObject = { __type: type };
          const object = reduce(entity, (aggregateObject, attributeValue, attributeIdent) => {
            const attributeName = getAttributeNameFromAttributeIdent(attributeIdent);

            return {
              ...aggregateObject,
              [attributeName]: attributeValue,
            };
          }, initialObject);

          return object;
        });
    },
    (object) => {
      const type = types[object.__type];

      return type;
    }
  );
}, function getHashKey(...args) {
  // Use both apiUrl & dbAlias in hash key...
  return args.join('__');
});
