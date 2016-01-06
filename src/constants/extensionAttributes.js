import edn from 'jsedn';
import {
  datomicValueTypeKeywords,
  KEYWORD,
  STRING,
  REF,
} from './datomicValueTypes';
import {
  datomicCardinalityIdentKeywords,
  ONE as CARDINALITY_ONE,
  MANY as CARDINALITY_MANY,
} from './datomicCardinalities';
import {
  datomicUniqueIdentKeywords,
  VALUE as UNIQUE_VALUE,
} from './datomicUniques';

// (Extension attribute ident string constants)
export const TYPE_NAME = ':extGraphQL.type/name';
export const TYPE_NAMESPACE = ':extGraphQL.type/namespace';
export const TYPE_DOC = ':extGraphQL.type/doc';
export const INTERFACE_NAME = ':extGraphQL.interface/name';
export const INTERFACE_IMPLEMENTATIONS = ':extGraphQL.interface/implementations';
export const INTERFACE_DOC = ':extGraphQL.interface/doc';
export const REF_TARGET = ':extGraphQL/refTarget';
export const ENUM_VALUES = ':extGraphQL/enumValues';
export const REVERSE_REF_FIELD = ':extGraphQL/reverseRefField';

// (Exhaustive map of [extension attribute constant] -> [extension attribute ident string])
export const extensionAttributeIdents = {
  TYPE_NAME,
  TYPE_NAMESPACE,
  TYPE_DOC,
  INTERFACE_NAME,
  INTERFACE_IMPLEMENTATIONS,
  INTERFACE_DOC,
  REF_TARGET,
  ENUM_VALUES,
  REVERSE_REF_FIELD,
};

// (Exhaustive map of [extension attribute constant] -> [extension attribute ident keyword])
export const extensionAttributeIdentKeywords = {
  [TYPE_NAME]: edn.kw(TYPE_NAME),
  [TYPE_NAMESPACE]: edn.kw(TYPE_NAMESPACE),
  [TYPE_DOC]: edn.kw(TYPE_DOC),
  [INTERFACE_NAME]: edn.kw(INTERFACE_NAME),
  [INTERFACE_IMPLEMENTATIONS]: edn.kw(INTERFACE_IMPLEMENTATIONS),
  [INTERFACE_DOC]: edn.kw(INTERFACE_DOC),
  [REF_TARGET]: edn.kw(REF_TARGET),
  [ENUM_VALUES]: edn.kw(ENUM_VALUES),
  [REVERSE_REF_FIELD]: edn.kw(REVERSE_REF_FIELD),
};

// (Exhaustive map of [extension attribute constant] -> [datomic value type keyword])
export const extensionAttributeValueTypeKeywords = {
  [TYPE_NAME]: datomicValueTypeKeywords[STRING],
  [TYPE_NAMESPACE]: datomicValueTypeKeywords[KEYWORD],
  [TYPE_DOC]: datomicValueTypeKeywords[STRING],
  [INTERFACE_NAME]: datomicValueTypeKeywords[STRING],
  [INTERFACE_IMPLEMENTATIONS]: datomicValueTypeKeywords[REF],
  [INTERFACE_DOC]: datomicValueTypeKeywords[STRING],
  [REF_TARGET]: datomicValueTypeKeywords[REF],
  [ENUM_VALUES]: datomicValueTypeKeywords[REF],
  [REVERSE_REF_FIELD]: datomicValueTypeKeywords[KEYWORD],
};

// (Exhaustive map of [extension attribute constant] -> [datomic cardinality keyword])
export const extensionAttributeCardinalityKeywords = {
  [TYPE_NAME]: datomicCardinalityIdentKeywords[CARDINALITY_ONE],
  [TYPE_NAMESPACE]: datomicCardinalityIdentKeywords[CARDINALITY_ONE],
  [TYPE_DOC]: datomicCardinalityIdentKeywords[CARDINALITY_ONE],
  [INTERFACE_NAME]: datomicCardinalityIdentKeywords[CARDINALITY_ONE],
  [INTERFACE_IMPLEMENTATIONS]: datomicCardinalityIdentKeywords[CARDINALITY_MANY],
  [INTERFACE_DOC]: datomicCardinalityIdentKeywords[CARDINALITY_ONE],
  [REF_TARGET]: datomicCardinalityIdentKeywords[CARDINALITY_ONE],
  [ENUM_VALUES]: datomicCardinalityIdentKeywords[CARDINALITY_MANY],
  [REVERSE_REF_FIELD]: datomicCardinalityIdentKeywords[CARDINALITY_ONE],
};

// (Exhaustive map of [extension attribute constant] -> [datomic unique keyword OR null])
export const extensionAttributeUniqueKeywords = {
  [TYPE_NAME]: datomicUniqueIdentKeywords[UNIQUE_VALUE],
  [TYPE_NAMESPACE]: datomicUniqueIdentKeywords[UNIQUE_VALUE],
  [TYPE_DOC]: null,
  [INTERFACE_NAME]: datomicUniqueIdentKeywords[UNIQUE_VALUE],
  [INTERFACE_IMPLEMENTATIONS]: null,
  [INTERFACE_DOC]: null,
  [REF_TARGET]: null,
  [ENUM_VALUES]: null,
  [REVERSE_REF_FIELD]: datomicUniqueIdentKeywords[UNIQUE_VALUE],
};

// (Exhaustive map of [extension attribute constant] -> [extension attribute doc string])
export const extensionAttributeDocStrings = {
  [TYPE_NAME]: 'A type\'s name in the GraphQL type system',
  [TYPE_NAMESPACE]: 'The namespace of a type\'s attribute idents in the db',
  [TYPE_DOC]: 'The description of a type',
  [INTERFACE_NAME]: 'An interface\'s name in the GraphQL type system',
  [INTERFACE_IMPLEMENTATIONS]: 'The types that implement an interface',
  [INTERFACE_DOC]: 'The description of an interface',
  [REF_TARGET]: 'The type or interface that a reference attribute targets',
  [ENUM_VALUES]: 'The possible values of an enumeration-type reference attribute',
  [REVERSE_REF_FIELD]: 'The reverse reference field on the type or interface a reference attribute targets',
};
