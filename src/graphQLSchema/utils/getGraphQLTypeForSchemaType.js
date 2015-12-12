import { GraphQLObjectType } from 'graphql';
import { connectionArgs, globalIdField } from 'graphql-relay';
import getGraphQLTypeForAttribute from './getGraphQLTypeForAttribute';
import getQueryInputArgsForSchemaType from './getQueryInputArgsForSchemaType';
import { nodeInterface } from '../nodeDefinitions';
import { getConnectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import { connectionTypes } from './getGraphQLConnectionTypeForSchemaType';
import { reduce } from 'underscore';

export const types = {};

export default function _getGraphQLTypeForSchemaType(schemaType, schemaTypeName) {
  const initialFields = { id: globalIdField(schemaTypeName) };

  types[schemaTypeName] = types[schemaTypeName] || new GraphQLObjectType({
    name: schemaTypeName,
    description: schemaType.doc,
    fields: () => reduce(schemaType.attributes, (aggregateFields, attribute, attributeName) => {
      const attributeHasRefTarget = !!attribute.refTarget;
      const attributeFieldIsConnection = attribute.cardinality === 'many';
      const attributeQueryInputArgs = attributeHasRefTarget
                                    ? getQueryInputArgsForSchemaType(types[attribute.refTarget], attribute.refTarget)
                                    : {};
      const attributeFieldArgs = attributeHasRefTarget && attributeFieldIsConnection
                                ? { ...attributeQueryInputArgs, ...connectionArgs }
                                : null;

      return {
        ...aggregateFields,
        [attributeName]: {
          type: getGraphQLTypeForAttribute(attribute, attributeName),
          args: attributeFieldArgs,
          description: attribute.doc,
        },
        ...reduce(schemaType.reverseReferenceFields, (aggregateReverseReferenceFields, reverseReferenceField) => {
          const typeName = reverseReferenceField.type;
          const fieldName = getConnectionQueryFieldNameFromTypeName(typeName);
          const instanceType = types[typeName];
          const connectionType = connectionTypes[typeName];

          return {
            ...aggregateReverseReferenceFields,
            [fieldName]: {
              type: connectionType,
              args: {
                ...getQueryInputArgsForSchemaType(instanceType, typeName),
                ...connectionArgs,
              },
              description: `${reverseReferenceField.type}s that refer to the ${schemaTypeName} via their '${reverseReferenceField.field}' field`,
            },
          };
        }, {}),
      };
    }, initialFields),
    interfaces: [nodeInterface],
  });

  return types[schemaTypeName];
}
