import consumer from '../consumer';
import edn from 'jsedn';
import { getTypeNameFromAttributeIdent, getAttributeNameFromAttributeIdent } from './inflect';
import { reduce } from 'underscore';

export default (apiUrl, dbAlias) => {
  const db = consumer(apiUrl, dbAlias);
  const installedTypesQueryEdn = new edn.Vector([
    edn.kw(':find'),
    new edn.Vector([
      new edn.List([
        edn.sym('pull'), edn.sym('?e'), new edn.Vector([
          edn.kw(':extGraphQL.type/name'),
          edn.kw(':extGraphQL.type/namespace'),
          edn.kw(':extGraphQL.type/doc'),
          new edn.Map([edn.kw(':extGraphQL/_refTarget'), new edn.Vector([edn.kw(':db/ident')])]),
        ]),
      ]),
      edn.sym('...'),
    ]),
    edn.kw(':where'),
    new edn.Vector([edn.sym('?e'), edn.kw(':extGraphQL.type/name'), edn.sym('_')]),
  ]);

  return db.query(installedTypesQueryEdn)
    .then(installedTypesData => reduce(installedTypesData, (aggregateInstalledTypes, typeData) => {
      const name = typeData[':extGraphQL.type/name'];
      const namespace = typeData[':extGraphQL.type/namespace'];
      const doc = typeData[':extGraphQL.type/doc'];
      const reverseReferenceAttributesData = typeData[':extGraphQL/_refTarget'] || [];
      const reverseReferenceFields = reverseReferenceAttributesData.map(reverseReferenceAttributeData => {
        const attributeIdent = reverseReferenceAttributeData[':db/ident'];
        const originTypeName = getTypeNameFromAttributeIdent(attributeIdent);
        const originAttributeName = getAttributeNameFromAttributeIdent(attributeIdent);

        return {
          type: originTypeName,
          field: originAttributeName,
        };
      });

      return {
        ...aggregateInstalledTypes,
        [name]: {
          namespace,
          doc,
          reverseReferenceFields,
        },
      };
    }, {}));
};
