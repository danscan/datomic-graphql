import axios from 'axios';
import edn from 'jsedn';
import { isEmpty, keys, pluck, reduce, without } from 'underscore';
import Inflect from 'i';

// Instantiate inflector util
const inflect = new Inflect();

// (Value constants)
const SYSTEM_ATTRIBUTE_NAMESPACES = [':db', ':fressian', ':extGraphQL'];
const DB_ID_KEYWORD = ':db/id';
const DB_IDENT_KEYWORD = ':db/ident';
const DB_USER_PART_KEYWORD = ':db.part/user';
const TYPE_NAME_KEYWORD = ':extGraphQL.type/name';
const TYPE_NAMESPACE_KEYWORD = ':extGraphQL.type/namespace';
const INTERFACE_NAME_KEYWORD = ':extGraphQL.interface/name';
const EDN_MIME_TYPE = 'application/edn';

export const getSchemaData = (apiUrl, dbAlias) => {
  const queryApiUrl = `${apiUrl}/api/query`;

  return axios.get(queryApiUrl, {
    params: {
      q: `[:find
        [(pull ?e [
          :db/id
          :db/ident
          :db/doc
          :db/index
          :db/fullText
          {:db/valueType [${DB_IDENT_KEYWORD}]}
          {:db/cardinality [${DB_IDENT_KEYWORD}]}
          {:db/unique [${DB_IDENT_KEYWORD}]}
          :extGraphQL/required
          {:extGraphQL/refTarget [${TYPE_NAME_KEYWORD} ${INTERFACE_NAME_KEYWORD}]}
          {:extGraphQL/enumValues [${DB_IDENT_KEYWORD}]}
        ]) ...] :where [?e :db/valueType _]]`,
      args: `[{:db/alias "${dbAlias}"}]`,
    },
    headers: { Accept: EDN_MIME_TYPE },
  })
  .then(res => res.data)
  .then(schemaString => edn.parse(schemaString))
  .then(schemaData => edn.toJS(schemaData))
  .then(rawSchemaAttributes => rawSchemaAttributes.map(rawSchemaAttribute => parseSchemaAttribute(rawSchemaAttribute)))
  .then(schemaAttributes => schemaAttributes.reduce((aggregateSchema, schemaAttribute) => {
    const schemaAttributeIdentKeyword = edn.kw(schemaAttribute.ident);
    const schemaAttributeNamespace = schemaAttributeIdentKeyword.ns;
    const schemaAttributeType = inflect.camelize(schemaAttributeNamespace.replace(':', ''));
    const schemaAttributeName = schemaAttributeIdentKeyword.name;

    // Exclude system-namespaced attributes from schema data...
    if (SYSTEM_ATTRIBUTE_NAMESPACES.find(ns => schemaAttributeNamespace.indexOf(ns) >= 0)) {
      return aggregateSchema;
    }

    return {
      ...aggregateSchema,
      [schemaAttributeType]: {
        ...aggregateSchema[schemaAttributeType],
        [schemaAttributeName]: schemaAttribute,
      },
    };
  }, {}))
  .catch(error => console.error(error.stack || error));
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
      metaAttributeValue = edn.kw(metaAttribute[DB_IDENT_KEYWORD]).name;
      break;
    case 'refTarget':
      metaAttributeValue = edn.kw(metaAttribute[TYPE_NAME_KEYWORD] || metaAttribute[INTERFACE_NAME_KEYWORD]).name;
      break;
    case 'enumValues':
      metaAttributeValue = metaAttribute.map(enumValue => dn.kw(enumValue[DB_IDENT_KEYWORD]).name);
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

export const getSchemaArbitraryReferenceAttributes = schemaData => {
  return reduce(schemaData, (aggregatePartialSchema, schemaType, schemaTypeKey) => {
    const typeArbitraryReferenceAttributes = reduce(schemaType, (aggregatePartialType, attribute, attributeKey) => {
      const attributeIsRefType = attribute.valueType === 'ref';
      const attributeHasRefTarget = !!attribute.refTarget;
      const attributeHasEnumValues = !!attribute.enumValues;
      const attributeHasArbitraryReferenceType = attributeIsRefType && !attributeHasRefTarget && !attributeHasEnumValues;

      if (attributeHasArbitraryReferenceType) {
        return {
          ...aggregatePartialType,
          [attributeKey]: attribute,
        };
      }

      return aggregatePartialType;
    }, {});

    if (!isEmpty(typeArbitraryReferenceAttributes)) {
      return {
        ...aggregatePartialSchema,
        [schemaTypeKey]: typeArbitraryReferenceAttributes,
      };
    }

    return aggregatePartialSchema;
  }, {});
}

export const getSchemaTypes = schemaData => {
  return reduce(schemaData, (aggregateTypes, _, typeName) => {
    const typeNamespace = `:${inflect.camelize(typeName, false)}`;

    return [
      ...aggregateTypes,
      { name: typeName, namespace: typeNamespace },
    ];
  }, []);
}

export const getInstalledTypes = (apiUrl, dbAlias) => {
  const queryApiUrl = `${apiUrl}/api/query`;

  return axios.get(queryApiUrl, {
    params: {
      q: `[:find
        [(pull ?e [
          ${TYPE_NAME_KEYWORD}
          ${TYPE_NAMESPACE_KEYWORD}
        ]) ...] :where [?e ${TYPE_NAME_KEYWORD} _]]`,
      args: `[{:db/alias "${dbAlias}"}]`,
    },
    headers: { Accept: EDN_MIME_TYPE },
  })
  .then(res => res.data)
  .then(schemaString => edn.parse(schemaString))
  .then(schemaData => edn.toJS(schemaData))
  .then(schemaData => schemaData || []);
}

export const getInstalledInterfaces = (apiUrl, dbAlias) => {
  const queryApiUrl = `${apiUrl}/api/query`;

  return axios.get(queryApiUrl, {
    params: {
      q: `[:find
        [(pull ?e [
          ${INTERFACE_NAME_KEYWORD}
          {:extGraphQL.interface/implementations [${DB_IDENT_KEYWORD} ${TYPE_NAME_KEYWORD}]}
        ]) ...] :where [?e ${INTERFACE_NAME_KEYWORD} _]]`,
      args: `[{:db/alias "${dbAlias}"}]`,
    },
    headers: { Accept: EDN_MIME_TYPE },
  })
  .then(res => res.data)
  .then(schemaString => edn.parse(schemaString))
  .then(schemaData => edn.toJS(schemaData))
  .then(schemaData => schemaData || []);
}

export const applyTypes = (apiUrl, dbAlias) => {
  const transactionUrl = `${apiUrl}/data/${dbAlias}/`;

  return Promise.all([
    getSchemaData(apiUrl, dbAlias),
    getInstalledTypes(apiUrl, dbAlias),
  ])
  .then(([schemaData, installedTypes]) => {
    const schemaTypes = getSchemaTypes(schemaData);
    const schemaTypeNames = pluck(schemaTypes, 'name');
    const installedTypeNames = pluck(installedTypeNames, 'names');
    const typeNamesToApply = without(schemaTypeNames, installedTypeNames);
    const typesToApply = typeNamesToApply.map(typeName => schemaTypes.find(type => type.name === typeName));

    return typesToApply;
  })
  .then(typesToApply => {
    const ednTypes = typesToApply.reduce((aggregateEdnTypes, type) => {
      return [
        ...aggregateEdnTypes,
        new edn.Map([
          edn.kw(DB_ID_KEYWORD), new edn.Tagged(new edn.Tag('db/id'), [edn.kw(DB_USER_PART_KEYWORD)]),
          edn.kw(TYPE_NAME_KEYWORD), type.name,
          edn.kw(TYPE_NAMESPACE_KEYWORD), type.namespace,
        ]),
      ];
    }, []);

    return edn.encode(ednTypes);
  })
  .then(typesEdn => {
    return axios({
      method: 'post',
      url: transactionUrl,
      data: `{:tx-data ${typesEdn}}`,
      headers: { Accept: EDN_MIME_TYPE, 'Content-Type': 'EDN_MIME_TYPE' },
    })
  });
}
