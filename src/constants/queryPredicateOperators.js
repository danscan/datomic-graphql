// (Predicate operator input field key constants)
// (Comparison-type predicate operators)
export const IS = 'is';
export const IS_NOT = 'isNot';
export const GREATER_THAN = 'greaterThan';
export const GREATER_THAN_OR_EQUAL_TO = 'greaterThanOrEqualTo';
export const LESS_THAN = 'lessThan';
export const LESS_THAN_OR_EQUAL_TO = 'lessThanOrEqualTo';
// (Existential-type predicate operators)
export const IS_MISSING = 'isMissing';
// (Predicate composition-type prediate operators)
export const NOT = 'not';
export const OR = 'or';
export const AND = 'and';

// (Exhaustive map of [predicate operator constant name] -> [predicate operator input field key])
export const predicateOperators = {
  IS,
  IS_NOT,
  GREATER_THAN,
  GREATER_THAN_OR_EQUAL_TO,
  LESS_THAN,
  LESS_THAN_OR_EQUAL_TO,
  IS_MISSING,
  NOT,
  OR,
  AND,
};

// (Exhaustive map of [predicate operator constant name] -> [datomic query operator])
export const datomicQueryOperators = {
  [IS]: '=',
  [IS_NOT]: '!=',
  [GREATER_THAN]: '>',
  [GREATER_THAN_OR_EQUAL_TO]: '>=',
  [LESS_THAN]: '<',
  [LESS_THAN_OR_EQUAL_TO]: '<=',
  [IS_MISSING]: 'missing?',
  [NOT]: 'not',
  [OR]: 'or',
  [AND]: 'and',
};
