import consumer from '../../consumer';
import { fromGlobalId, nodeDefinitions } from 'graphql-relay';
import { types } from '../utils/getGraphQLTypeForSchemaType';
import { getAttributeNameFromAttributeIdent } from '../../utils/inflect';
import { reduce } from 'underscore';

// (Configuration constants)
const DATOMIC_REST_API_URL = process.env.DATOMIC_REST_API_URL || 'http://localhost:8080';
const DATOMIC_DB_ALIAS = process.env.DATOMIC_DB_ALIAS || 'dev/mbrainz-1968-1973';

// Create db consumer
const db = consumer(DATOMIC_REST_API_URL, DATOMIC_DB_ALIAS);

// Create node field and interface
const { nodeField, nodeInterface } = nodeDefinitions(
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

export { nodeField, nodeInterface };
