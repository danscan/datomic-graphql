import consumer from '../../consumer';
import edn from 'jsedn';

export default function queryUnidirectionalReferenceAttributes(apiUrl, dbAlias) {
  const db = consumer(apiUrl, dbAlias);
  const unidirectionalReferenceAttributes = new edn.Vector([
    edn.kw(':find'), edn.sym('?ident'), edn.sym('?doc'), edn.sym('?refTargetTypeName'),
    edn.kw(':where'),
    new edn.Vector([
      new edn.List([edn.sym('missing?'), edn.sym('$'), edn.sym('?attr'), edn.kw(':extGraphQL/enumValues')]),
    ]),
    new edn.Vector([
      new edn.List([edn.sym('missing?'), edn.sym('$'), edn.sym('?attr'), edn.kw(':extGraphQL/reverseRefField')]),
    ]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':extGraphQL/refTarget'), edn.sym('?refTarget')]),
    new edn.Vector([edn.sym('?refTarget'), edn.kw(':extGraphQL.type/name'), edn.sym('?refTargetTypeName')]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/ident'), edn.sym('?ident')]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/doc'), edn.sym('?doc')]),
    new edn.Vector([edn.sym('?attr'), edn.kw(':db/valueType'), edn.kw(':db.type/ref')]),
  ]);

  return db.query(unidirectionalReferenceAttributes);
}
