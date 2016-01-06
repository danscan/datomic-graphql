import edn from 'jsedn';
import { connectionArgs } from 'graphql-relay';
import { getAttributeIdentFromAttributeNameAndTypeName } from '../../utils/inflect';
import { isArray, isObject, keys, map, omit, reduce } from 'underscore';

export const operators = {
  is: 'is',
  isNot: 'isNot',
  greaterThan: 'greaterThan',
  greaterThanOrEqualTo: 'greaterThanOrEqualTo',
  lessThan: 'lessThan',
  lessThanOrEqualTo: 'lessThanOrEqualTo',

  isMissing: 'isMissing',

  not: 'not',
  or: 'or',
  and: 'and',
};

// Query input field -> expression operator
export const operatorMap = {
  is: '=',
  isNot: '!=',
  greaterThan: '>',
  greaterThanOrEqualTo: '>=',
  lessThan: '<',
  lessThanOrEqualTo: '<=',

  isMissing: 'missing?',

  not: 'not',
  or: 'or',
  and: 'and',
};

// Array of fields to exclude from query edn
export const excludeFields = keys(connectionArgs);

export default function getQueryEdn({ args, schemaTypeName, referenceFieldClause }) {
  const filteredArgs = omit(args, excludeFields);
  const predicateVectorArray = map(filteredArgs, (argValue, argKey) => {
    const argPredicateExpression = getArgPredicateExpressionEdn({ key: argKey, value: argValue }, schemaTypeName);
    console.log('edn.encode(argPredicateExpression):', edn.encode(argPredicateExpression));
    return argPredicateExpression;
  });
  const queryClauseArray = referenceFieldClause
                          ? [referenceFieldClause, ...predicateVectorArray]
                          : predicateVectorArray;

  const queryEdn = new edn.Vector([
    edn.kw(':find'),
    new edn.Vector([
      new edn.List([
        edn.sym('pull'), edn.sym('?e'), new edn.Vector(['*']),
      ]),
      edn.sym('...'),
    ]),
    edn.kw(':where'), ...queryClauseArray,
  ]);
  console.log('edn.encode(queryEdn):', edn.encode(queryEdn));

  return queryEdn;
}

function getArgPredicateExpressionEdn({ key, value }, schemaTypeName) {
  const mappedOperator = key ? operatorMap[key] : undefined;
  const attributeIdent = getAttributeIdentFromAttributeNameAndTypeName(key, schemaTypeName);
  console.log('attributeIdent:', attributeIdent);
  console.log('key:', key);
  console.log('mappedOperator:', mappedOperator);
  console.log('value:', value);
  console.log('schemaTypeName:', schemaTypeName);
  switch (key) {
  case operators.isNot:
  case operators.greaterThan:
  case operators.greaterThanOrEqualTo:
  case operators.lessThan:
  case operators.lessThanOrEqualTo:
    console.log('return null...');
    return null;
  case operators.isMissing:
  case operators.or:
  case operators.and:
    console.log('prediate composition... value:', value);
    const operandsArray = isArray(value) ? value : [value];
    return new edn.List([
      edn.sym(mappedOperator),
      ...operandsArray.map(operand => getArgPredicateExpressionEdn({ value: operand }, schemaTypeName)),
    ]);
  case operators.is:
    return [value];
  default:
    return reduce(value, (memo, attributePredicate, attributeName) => {
      if (isObject(attributePredicate)) {
        return getArgPredicateExpressionEdn({ key: attributeName, value: attributePredicate }, schemaTypeName);
      }

      return new edn.Vector([edn.sym('?e'),
        attributeIdent,
        ...getArgPredicateExpressionEdn({ key: attributeName, value: attributePredicate }, schemaTypeName),
      ]);
    }, {});
  }
}
