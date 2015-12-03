import consumer from '../../consumer';
import edn from 'jsedn';

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
        ]),
      ]),
      edn.sym('...'),
    ]),
    edn.kw(':where'),
    new edn.Vector([edn.sym('?e'), edn.kw(':extGraphQL.type/name'), edn.sym('_')]),
  ]);

  return db.query(installedTypesQueryEdn);
};
