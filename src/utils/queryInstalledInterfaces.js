import consumer from '../consumer';
import edn from 'jsedn';
import { getAttributeNameFromAttributeIdent, getTypeNameFromAttributeIdent } from './inflect';
import { reduce } from 'underscore';

export default (apiUrl, dbAlias) => {
  const db = consumer(apiUrl, dbAlias);
  const installedInterfacesQueryEdn = new edn.Vector([
    edn.kw(':find'),
    new edn.Vector([
      new edn.List([
        edn.sym('pull'), edn.sym('?e'), new edn.Vector([
          edn.kw(':extGraphQL.interface/name'),
          new edn.Map([edn.kw(':extGraphQL.interface/implementations'), new edn.Vector([edn.kw(':db/ident'), edn.kw(':extGraphQL.type/name')])]),
          edn.kw(':extGraphQL.interface/doc'),
          new edn.Map([edn.kw(':extGraphQL/_refTarget'), new edn.Vector([edn.kw(':db/ident')])]),
        ]),
      ]),
      edn.sym('...'),
    ]),
    edn.kw(':where'),
    new edn.Vector([edn.sym('?e'), edn.kw(':extGraphQL.interface/name'), edn.sym('_')]),
  ]);

  return db.query(installedInterfacesQueryEdn)
    .then(installedInterfacesData => reduce(installedInterfacesData, (aggregateInstalledInterfaces, typeData) => {
      const name = typeData[':extGraphQL.interface/name'];
      const doc = typeData[':extGraphQL.interface/doc'];
      const implementationsData = typeData[':extGraphQL.interface/implementations'] || [];
      const implementations = implementationsData.map(implementationData => {
        const implementationIdent = implementationData[':db/ident'];
        const implementationTypeName = implementationData[':extGraphQL.type/name'];

        return {
          ident: implementationIdent,
          type: implementationTypeName,
        };
      });
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
        ...aggregateInstalledInterfaces,
        [name]: {
          implementations,
          doc,
          reverseReferenceFields,
        },
      };
    }, {}));
};
