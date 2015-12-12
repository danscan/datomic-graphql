import { GraphQLBoolean, GraphQLInputObjectType, GraphQLList } from 'graphql';
import getGraphQLTypeForAttribute from './getGraphQLTypeForAttribute';
import { schemaTypes } from './getGraphQLTypeForSchemaType';
import { getInstanceQueryFieldNameFromTypeName, getConnectionQueryFieldNameFromTypeName } from '../../utils/inflect';
import { reduce } from 'underscore';

export const schemaTypePredicateTypes = {};
export const attributePredicateTypes = {};

export default function getQueryInputArgsForSchemaType(schemaType, schemaTypeName) {
  const schemaTypePredicateFields = reduce(schemaType.attributes, (aggregateSchemaTypePredicateFields, attribute, attributeName) => {
    const attributePredicateType = getAttributePredicateType(attribute, attributeName, schemaTypeName);

    // Bail if attributePredicateType is falsy
    if (!attributePredicateType) {
      return aggregateSchemaTypePredicateFields;
    }

    return {
      ...aggregateSchemaTypePredicateFields,
      [attributeName]: { type: attributePredicateType },
    };
  }, {});
  const schemaTypePredicateTypeName = `${schemaTypeName}Predicate`;
  schemaTypePredicateTypes[schemaTypePredicateTypeName] = schemaTypePredicateTypes[schemaTypePredicateTypeName] || new GraphQLInputObjectType({
    name: schemaTypePredicateTypeName,
    fields: schemaTypePredicateFields,
  });
  const schemaTypePredicateInputObject = schemaTypePredicateTypes[schemaTypePredicateTypeName];

  // Get predicate fields for reverse reference attributes
  // console.log(`schemaTypeName "${schemaTypeName}"... schemaType:`, schemaType);
  const reverseReferencePredicateFields = reduce(schemaType.reverseReferenceFields, (aggregateReverseReferencePredicateFields, reverseReferenceField) => {
    const reverseReferencePredicateFieldName = getConnectionQueryFieldNameFromTypeName(reverseReferenceField.type);
    const reverseReferencePredicateFieldType = schemaTypePredicateTypes[`${reverseReferenceField.type}Predicate`];
    // console.log('reverseReferencePredicateFieldType:', reverseReferencePredicateFieldType);

    // TODO: Resolve via a function...?
    // NOTE: This workaround causes some reverse reference predicate field types to be omitted :/
    if (!reverseReferencePredicateFieldType) {
      return aggregateReverseReferencePredicateFields;
    }

    return {
      ...aggregateReverseReferencePredicateFields,
      [reverseReferencePredicateFieldName]: { type: reverseReferencePredicateFieldType },
    };
  }, {});
  // console.log('schemaTypePredicateFields:', schemaTypePredicateFields);
  // console.log('reverseReferencePredicateFields:', reverseReferencePredicateFields);

  return {
    ...schemaTypePredicateFields,

    ...reverseReferencePredicateFields,

    not: { type: schemaTypePredicateInputObject },
    or: { type: new GraphQLList(schemaTypePredicateInputObject) },
    and: { type: new GraphQLList(schemaTypePredicateInputObject) },
  };
}

function getAttributePredicateType(attribute, attributeName, schemaTypeName) {
  const attributeGraphQLType = getGraphQLTypeForAttribute(attribute, attributeName);

  // Bail / recurse if attribute GraphQL type isn't a valid input type
  if (attribute.valueType === 'ref' && attribute.refTarget) {
    // FIXME: Returns undefined if predicate for refTarget isn't in schemaTypePredicateTypes yet...
    return schemaTypePredicateTypes[`${attribute.refTarget}Predicate`];
  } else if (attribute.valueType === 'ref' && !attribute.enumValues) {
    return null;
  }

  const schemaTypePredicateName = getInstanceQueryFieldNameFromTypeName(`${schemaTypeName}_${attributeName}`);
  const attributePredicateTypeName = `${schemaTypePredicateName}Predicate`;
  attributePredicateTypes[attributePredicateTypeName] = attributePredicateTypes[attributePredicateTypeName] || new GraphQLInputObjectType({
    name: attributePredicateTypeName,
    fields: () => ({
      is: { type: attributeGraphQLType },
      isNot: { type: attributeGraphQLType },
      greaterThan: { type: attributeGraphQLType },
      greaterThanOrEqualTo: { type: attributeGraphQLType },
      lessThan: { type: attributeGraphQLType },
      lessThanOrEqualTo: { type: attributeGraphQLType },

      isMissing: { type: GraphQLBoolean },

      not: { type: attributePredicateTypes[attributePredicateTypeName] },
      or: { type: new GraphQLList(attributePredicateTypes[attributePredicateTypeName]) },
      and: { type: new GraphQLList(attributePredicateTypes[attributePredicateTypeName]) },
    }),
  });

  return attributePredicateTypes[attributePredicateTypeName];
}
