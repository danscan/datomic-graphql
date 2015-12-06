import { GraphQLObjectType } from 'graphql';
import getGraphQLTypeForAttribute from './getGraphQLTypeForAttribute';
import { getConnectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import { reduce } from 'underscore';

export const types = {};

export default function _getGraphQLTypeForSchemaType(schemaType, schemaTypeName) {
  types[schemaTypeName] = types[schemaTypeName] || new GraphQLObjectType({
    name: schemaTypeName,
    description: schemaType.doc,
    fields: () => reduce(schemaType.attributes, (aggregateFields, attribute, attributeName) => {
      return {
        ...aggregateFields,
        [attributeName]: {
          type: getGraphQLTypeForAttribute(attribute, attributeName),
          description: attribute.doc,
        },
        ...reduce(schemaType.reverseReferenceFields, (aggregateReverseReferenceFields, reverseReferenceField) => {
          const fieldName = getConnectionQueryFieldNameFromTypeName(reverseReferenceField.type);

          return {
            ...aggregateReverseReferenceFields,
            [fieldName]: {
              type: types[reverseReferenceField.type],
              description: `${reverseReferenceField.type}s that refer to the ${schemaTypeName} via their '${reverseReferenceField.field}' field`,
            },
          };
        }, {}),
      };
    }, {}),
  });

  return types[schemaTypeName];
};
