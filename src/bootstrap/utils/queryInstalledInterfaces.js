import consumer from '../../consumer';
import edn from 'jsedn';

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
        ]),
      ]),
      edn.sym('...'),
    ]),
    edn.kw(':where'),
    new edn.Vector([edn.sym('?e'), edn.kw(':extGraphQL.interface/name'), edn.sym('_')]),
  ]);

  return db.query(installedInterfacesQueryEdn);
};
