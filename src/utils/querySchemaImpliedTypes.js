import consumer from '../consumer';
import edn from 'jsedn';
import { getAttributeNameFromAttributeIdent, getTypeNameFromAttributeIdent } from './inflect';
import { reduce } from 'underscore';

// (Value constants)
const SYSTEM_ATTRIBUTE_NAMESPACES = [':db', ':fressian', ':extGraphQL'];

export default (apiUrl, dbAlias) => {
  const db = consumer(apiUrl, dbAlias);
  const schemaImpliedTypesQueryEdn = new edn.Vector([
    edn.kw(':find'),
    new edn.Vector([
      new edn.List([
        edn.sym('pull'), edn.sym('?e'), new edn.Vector([
          edn.kw(':db/id'),
          edn.kw(':db/ident'),
          edn.kw(':db/doc'),
          edn.kw(':db/index'),
          edn.kw(':db/fullText'),
          new edn.Map([edn.kw(':db/valueType'), new edn.Vector([edn.kw(':db/ident')])]),
          new edn.Map([edn.kw(':db/cardinality'), new edn.Vector([edn.kw(':db/ident')])]),
          new edn.Map([edn.kw(':db/unique'), new edn.Vector([edn.kw(':db/ident')])]),
          edn.kw(':extGraphQL/required'),
          new edn.Map([edn.kw(':extGraphQL/refTarget'), new edn.Vector([edn.kw(':db/ident'), edn.kw(':extGraphQL.type/name'), edn.kw(':extGraphQL.interface/name')])]),
          new edn.Map([edn.kw(':extGraphQL/enumValues'), new edn.Vector([edn.kw(':db/ident')])]),
        ]),
      ]),
      edn.sym('...'),
    ]),
    edn.kw(':where'),
    new edn.Vector([edn.sym('?e'), edn.kw(':db/valueType'), edn.sym('_')]),
  ]);

  return db.query(schemaImpliedTypesQueryEdn)
  .then(rawSchemaAttributes => rawSchemaAttributes.map(rawSchemaAttribute => parseSchemaAttribute(rawSchemaAttribute)))
  .then(schemaAttributes => schemaAttributes.reduce((aggregateSchema, schemaAttribute) => {
    const schemaAttributeType = getTypeNameFromAttributeIdent(schemaAttribute.ident);
    const schemaAttributeName = getAttributeNameFromAttributeIdent(schemaAttribute.ident);

    // Exclude system-namespaced attributes from schema data...
    if (SYSTEM_ATTRIBUTE_NAMESPACES.find(ns => schemaAttribute.ident.indexOf(ns) >= 0)) {
      return aggregateSchema;
    }

    return {
      ...aggregateSchema,
      [schemaAttributeType]: {
        ...aggregateSchema[schemaAttributeType],
        [schemaAttributeName]: schemaAttribute,
      },
    };
  }, {}));
};

function parseSchemaAttribute(rawSchemaAttribute) {
  return reduce(rawSchemaAttribute, (aggregateAttribute, metaAttribute, metaAttributeKey) => {
    const metaAttributeKeyKeyword = edn.kw(metaAttributeKey);
    const metaAttributeKeyName = metaAttributeKeyKeyword.name;
    let metaAttributeValue;

    switch (metaAttributeKeyName) {
    case 'unique':
    case 'valueType':
    case 'cardinality':
      metaAttributeValue = edn.kw(metaAttribute[':db/ident']).name;
      break;
    case 'refTarget':
      metaAttributeValue = metaAttribute[':extGraphQL.type/name'] || metaAttribute[':extGraphQL.interface/name'];
      break;
    case 'enumValues':
      metaAttributeValue = metaAttribute.map(enumValue => edn.kw(enumValue[':db/ident']).name);
      break;
    default:
      metaAttributeValue = metaAttribute;
    }

    return {
      ...aggregateAttribute,
      [metaAttributeKeyName]: metaAttributeValue,
    };
  }, {});
}