import { GraphQLObjectType } from 'graphql';
import { connectionDefinitions, globalIdField } from 'graphql-relay';
import { getGraphQLTypeForAttribute } from './getGraphQLTypeForAttribute';
import { nodeInterface } from './nodeDefinitions';
import { mapObject } from 'underscore';

// Shared mutable namespace for circular type dependency resolution
const types = {};

export function registerEntityType(entityType, entityTypeName) {
  const type = _createType(entityType, entityTypeName);
  const registeredType = _registerType(type, entityTypeName);

  return registeredType;
}

export function getRegisteredTypeForValueType(valueType) {
  return types[_getRegisteredTypeName(valueType)];
}

export function getRegisteredConnectionTypeForValueType(valueType) {
  return types[_getRegisteredConnectionTypeName(valueType)];
}

// Private helpers
function _createType(entityType, entityTypeName) {
  return new GraphQLObjectType({
    name: entityTypeName,
    description: entityType.doc,
    fields: () => ({
      id: globalIdField(entityTypeName),
      ...(mapObject(entityType, attribute => ({
        type: getGraphQLTypeForAttribute(attribute),
        description: attribute.doc,
      }))),
    }),
    interfaces: [nodeInterface],
  });
}

function _registerType(type, valueType) {
  const registeredTypeName = _getRegisteredTypeName(valueType);
  const registeredType = types[registeredTypeName] = type;

  // Register connection type for registered type
  _registerConnectionType(registeredType, valueType);

  return registeredType;
}

function _registerConnectionType(registeredType, connectionTypeName) {
  const registeredConnectionTypeName = _getRegisteredConnectionTypeName(connectionTypeName);
  const registeredConnectionType = types[registeredConnectionTypeName] = connectionDefinitions({ name: connectionTypeName, nodeType: registeredType }).connectionType;

  return registeredConnectionType;
}

export function _getRegisteredTypeName(valueType) {
  const registeredTypeName = `${valueType}Type`;

  return registeredTypeName;
}

export function _getRegisteredConnectionTypeName(valueType) {
  const registeredTypeName = `${valueType}ConnectionType`;

  return registeredTypeName;
}
