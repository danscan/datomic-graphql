import { connectionDefinitions } from 'graphql-relay';
import getGraphQLTypeForSchemaType from './getGraphQLTypeForSchemaType';

export const connectionTypes = {};

export default function getGraphQLConnectionTypeForSchemaType({ schemaType, schemaTypeName }, apiUrl, dbAlias) {
  connectionTypes[schemaTypeName] = connectionTypes[schemaTypeName] || connectionDefinitions({
    name: schemaTypeName,
    nodeType: getGraphQLTypeForSchemaType({ schemaType, schemaTypeName }, apiUrl, dbAlias),
  }).connectionType;

  return connectionTypes[schemaTypeName];
}
