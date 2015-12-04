import { GraphQLObjectType } from 'graphql';
import { connectionDefinitions, globalIdField } from 'graphql-relay';
import getGraphQLTypeForAttribute from './getGraphQLTypeForAttribute';
import { nodeInterface } from './nodeDefinitions';
import { mapObject } from 'underscore';

// Shared mutable namespace for circular type dependency resolution
const types = {};

export function registerEntityType(entityType, entityTypeName) {
  const type = _createType(entityType, entityTypeName);
  const registeredType = _registerType(type, entityTypeName);

  return registeredType;
}

export function getRegisteredTypeForTypeName(typeName) {
  return types[_getRegisteredTypeName(typeName)];
}

export function getRegisteredConnectionTypeForTypeName(typeName) {
  return types[_getRegisteredConnectionTypeName(typeName)];
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

function _registerType(type, typeName) {
  const registeredTypeName = _getRegisteredTypeName(typeName);
  const registeredType = types[registeredTypeName] = type;

  // Register connection type for registered type
  _registerConnectionType(registeredType, typeName);

  return registeredType;
}

function _registerConnectionType(registeredType, connectionTypeName) {
  const registeredConnectionTypeName = _getRegisteredConnectionTypeName(connectionTypeName);
  const registeredConnectionType = types[registeredConnectionTypeName] = connectionDefinitions({ name: connectionTypeName, nodeType: registeredType }).connectionType;

  return registeredConnectionType;
}

export function _getRegisteredTypeName(typeName) {
  const registeredTypeName = `${typeName}`;

  return registeredTypeName;
}

export function _getRegisteredConnectionTypeName(typeName) {
  const registeredTypeName = `${typeName}Connection`;

  return registeredTypeName;
}
