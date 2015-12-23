import consumer from '../../consumer';
import { GraphQLObjectType } from 'graphql';
import { connectionArgs, globalIdField } from 'graphql-relay';
import getGraphQLTypeForAttribute from './getGraphQLTypeForAttribute';
import getQueryInputArgsForSchemaType from './getQueryInputArgsForSchemaType';
import getNodeDefinitions from '../getNodeDefinitions';
import { getConnectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import { connectionTypes } from './getGraphQLConnectionTypeForSchemaType';
import resolveInstanceFieldQuery from './resolveInstanceFieldQuery';
import resolveConnectionFieldQuery from './resolveConnectionFieldQuery';
import { reduce } from 'underscore';

export const types = {};

export default function getGraphQLTypeForSchemaType({ schemaType, schemaTypeName }, apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);
  const { nodeInterface } = getNodeDefinitions(apiUrl, dbAlias);

  // Initial value for fields reduction should have globalIdField (for node interface implementation)
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
      let resolveAttribute;

      if (attributeHasRefTarget && attributeFieldIsConnection) {
        resolveAttribute = (parent, args) => resolveConnectionFieldQuery({
          parent,
          fieldName: attributeName,
          args,
          schemaTypeName: attribute.refTarget,
          db,
        });
      } else if (attributeHasRefTarget) {
        resolveAttribute = (parent, args) => resolveInstanceFieldQuery({
          parent,
          fieldName: attributeName,
          args,
          schemaTypeName: attribute.refTarget,
          db,
        });
      } else {
        // TODO: Implement better resolveScalarFieldQuery
        resolveAttribute = (parent) => parent[attributeName];
      }

      return {
        ...aggregateFields,
        [attributeName]: {
          type: getGraphQLTypeForAttribute(attribute, attributeName),
          args: attributeFieldArgs,
          description: attribute.doc,
          resolve: resolveAttribute,
        },
        ...reduce(schemaType.reverseReferenceFields, (aggregateReverseReferenceFields, reverseReferenceField) => {
          const typeName = reverseReferenceField.type;
          const fieldName = getConnectionQueryFieldNameFromTypeName(typeName);
          const instanceType = types[typeName];
          const connectionType = connectionTypes[typeName];

          // TODO: Use attribute reverseReferenceField attribute, cardinality & uniqueness to properly create & resolve this field
          return {
            ...aggregateReverseReferenceFields,
            [fieldName]: {
              type: connectionType,
              args: {
                ...getQueryInputArgsForSchemaType(instanceType, typeName),
                ...connectionArgs,
              },
              description: `${reverseReferenceField.type}s that refer to the ${schemaTypeName} via their '${reverseReferenceField.field}' field`,
              resolve: (query, args) => resolveConnectionFieldQuery({ parent: query, args, fieldName, schemaTypeName: typeName, db }),
            },
          };
        }, {}),
      };
    }, initialFields),
    interfaces: [nodeInterface],
  });

  return types[schemaTypeName];
}
