import { fromGlobalId, nodeDefinitions } from 'graphql-relay';
import { getRegisteredTypeForValueType } from './typeRegistry';

const { nodeField, nodeInterface } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    // TODO: Return entity by id...
    console.log(`TODO: return entity (type "${type}") with id:`, id);
  },
  (object) => {
    const registeredType = getRegisteredTypeForValueType(object.__type);

    return registeredType;
  }
);

export { nodeField, nodeInterface };
