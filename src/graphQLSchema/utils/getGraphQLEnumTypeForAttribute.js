import { GraphQLEnumType } from 'graphql';

const enumTypes = {};

export default function getGraphQLEnumTypeForAttribute(attribute, attributeName) {
  return enumTypes[attributeName] = enumTypes[attributeName] || new GraphQLEnumType({
    name: attributeName,
    values: attribute.enumValues.reduce((aggregateValues, enumValue) => {
      return {
        ...aggregateValues,
        enumValue: { value: enumValue },
      };
    }, {}),
  });

  return enumTypes[attributeName];
}
