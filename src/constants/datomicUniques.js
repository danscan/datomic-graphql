import edn from 'jsedn';

// (Datomic unique ident string constants)
export const VALUE = ':db.unique/value';
export const IDENTITY = ':db.unique/identity';

// (Exhaustive map of [datomic unique constant name] -> [datomic unique ident string])
export const datomicUniqueIdents = {
  VALUE,
  IDENTITY,
};

// (Exhaustive map of [datomic unique constant name] -> [datomic unique ident keyword]))
export const datomicUniqueIdentKeywords = {
  [VALUE]: edn.kw(VALUE),
  [IDENTITY]: edn.kw(IDENTITY),
};
