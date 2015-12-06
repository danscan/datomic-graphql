import { fromGlobalId, nodeDefinitions } from 'graphql-relay';
import consumer from '../../consumer';

export default function getNodeDefinitions(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);

  return nodeDefinitions(
    (globalId) => {
      const { type, id } = fromGlobalId(globalId);

      return db.getEntity(id)
        .then(entity => {
          console.log(`type "${type}" entity:`, entity);
          return entity;
        });
    },
    (object) => {
      console.log('get GraphQL type of object:', object);
      // const registeredType = getRegisteredTypeForValueType(object.__type);

      // FIXME: Return object type from node interface...
      return null;
    }
  );
};
