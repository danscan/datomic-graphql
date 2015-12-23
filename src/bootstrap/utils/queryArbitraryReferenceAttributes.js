import consumer from '../../consumer';
import edn from 'jsedn';

export default function queryArbitraryReferenceAttributes(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);
  const arbitraryReferenceAttributesQuery = new edn.Vector([
    edn.kw(':find'), edn.sym('?ident'), edn.sym('?doc'),
    edn.kw(':where'),
    new edn.Vector([
      new edn.List([edn.sym('missing?'), edn.sym('$'), edn.sym('?attr'), edn.kw(':extGraphQL/refTarget')]),
    ]),
    new edn.Vector([
      new edn.List([edn.sym('missing?'), edn.sym('$'), edn.sym('?attr'), edn.kw(':extGraphQL/enumValues')]),
    ]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), edn.sym('?ident')]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/doc'), edn.sym('?doc')]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/valueType'), edn.kw(':db.type/ref')]),
  ]);

  return db.query(arbitraryReferenceAttributesQuery);
}
