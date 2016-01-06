import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLString } from 'graphql';
import edn from 'jsedn';

// (Boolean type ident string constants)
export const BOOLEAN = ':db.type/boolean';
// (Float-type ident string constants)
export const FLOAT = ':db.type/float';
export const DOUBLE = ':db.type/double';
export const BIG_DEC = ':db.type/bigdec';
// (Integer-type ident string constants)
export const LONG = ':db.type/long';
export const BIG_INT = ':db.type/bigint';
// (String-type ident string constants)
export const KEYWORD = ':db.type/keyword';
export const INSTANT = ':db.type/instant';
export const STRING = ':db.type/string';
export const UUID = ':db.type/uuid';
export const URI = ':db.type/uri';
export const BYTES = ':db.type/bytes';
// (Ref-type ident string constants)
export const REF = ':db.type/ref';

// (Exhaustive map of [Datomic value type constant] -> [Datomic value type ident string])
export const datomicValueTypeIdents = {
  BOOLEAN,
  FLOAT,
  DOUBLE,
  BIG_DEC,
  LONG,
  BIG_INT,
  KEYWORD,
  INSTANT,
  STRING,
  UUID,
  URI,
  BYTES,
  REF,
};

// (Exhaustive map of [extension attribute constant] -> [extension attribute ident keyword])
export const datomicValueTypeKeywords = {
  [BOOLEAN]: edn.kw(BOOLEAN),
  [FLOAT]: edn.kw(FLOAT),
  [DOUBLE]: edn.kw(DOUBLE),
  [BIG_DEC]: edn.kw(BIG_DEC),
  [LONG]: edn.kw(LONG),
  [BIG_INT]: edn.kw(BIG_INT),
  [KEYWORD]: edn.kw(KEYWORD),
  [INSTANT]: edn.kw(INSTANT),
  [STRING]: edn.kw(STRING),
  [UUID]: edn.kw(UUID),
  [URI]: edn.kw(URI),
  [BYTES]: edn.kw(BYTES),
  [REF]: undefined,
};

// (Exhaustive map of [Datomic value type constant] -> [GraphQL type])
export const datomicValueTypeGraphQLTypes = {
  [BOOLEAN]: GraphQLBoolean,

  [FLOAT]: GraphQLFloat,
  [DOUBLE]: GraphQLFloat,
  [BIG_DEC]: GraphQLFloat,

  [LONG]: GraphQLInt,
  [BIG_INT]: GraphQLInt,

  [KEYWORD]: GraphQLString,
  [INSTANT]: GraphQLString,
  [STRING]: GraphQLString,
  [UUID]: GraphQLString,
  [URI]: GraphQLString,
  [BYTES]: GraphQLString,

  [REF]: undefined,
};
