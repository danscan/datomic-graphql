import { connectionDefinitions } from 'graphql-relay';
import getGraphQLTypeForSchemaType from './getGraphQLTypeForSchemaType';

export const connectionTypes = {};

export default function getGraphQLConnectionTypeForSchemaType(schemaType, schemaTypeName) {
  connectionTypes[schemaTypeName] = connectionTypes[schemaTypeName] || connectionDefinitions({
    name: schemaTypeName,
    nodeType: getGraphQLTypeForSchemaType(schemaType, schemaTypeName),
  }).connectionType;

  return connectionTypes[schemaTypeName];
}
