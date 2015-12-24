import edn from 'jsedn';

// (Datomic cardinality ident string constants)
export const ONE = ':db.cardinality/one';
export const MANY = ':db.cardinality/many';

// (Exhaustive map of [datomic cardinality constant name] -> [datomic cardinality ident string])
export const datomicCardinalityIdents = {
  ONE,
  MANY,
};

// (Exhaustive map of [datomic cardinality constant name] -> [datomic cardinality ident keyword]))
export const datomicCardinalityIdentKeywords = {
  [ONE]: edn.kw(ONE),
  [MANY]: edn.kw(MANY),
};
