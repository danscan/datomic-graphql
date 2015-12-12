import { GraphQLEnumType } from 'graphql';

const enumTypes = {};

export default function getGraphQLEnumTypeForAttribute(attribute, attributeName) {
  enumTypes[attributeName] = enumTypes[attributeName] || new GraphQLEnumType({
    name: attributeName,
    description: attribute.doc,
    values: attribute.enumValues.reduce((aggregateValues, enumValue) => {
      return {
        ...aggregateValues,
        [enumValue]: { value: enumValue },
      };
    }, {}),
  });

  return enumTypes[attributeName];
}
