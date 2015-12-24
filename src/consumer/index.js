import axios from 'axios';
import edn from 'jsedn';

// (Value constants)
const EDN_MIME_TYPE = 'application/edn';

export default function consumer(apiUrl, dbAlias) {
  return {
    query(queryEdn) {
      const queryUrl = `${apiUrl}/api/query`;

      // Build params
      const argsEdn = new edn.Vector([
        new edn.Map([edn.kw(':db/alias'), dbAlias]),
      ]);
      const queryString = edn.encode(queryEdn);
      const argsString = edn.encode(argsEdn);

      return axios({
        method: 'get',
        url: queryUrl,
        params: {
          q: queryString,
          args: argsString,
        },
        headers: {
          'Accept': EDN_MIME_TYPE,
        },
      })
      .then(response => parseEdnResponse(response));
    },

    transact(txEdn) {
      const transactionUrl = `${apiUrl}/data/${dbAlias}/`;

      // Build request body
      const ednBody = new edn.Map([edn.kw(':tx-data'), txEdn]);
      const stringBody = edn.encode(ednBody);

      return axios({
        method: 'post',
        url: transactionUrl,
        data: stringBody,
        headers: {
          'Accept': EDN_MIME_TYPE,
          'Content-Type': EDN_MIME_TYPE,
        },
      })
      .then(response => parseEdnResponse(response));
    },

    getEntity(e, { basisT = '-', asOf, since } = {}) {
      const getEntityUrl = `${apiUrl}/data/${dbAlias}/${basisT}/entity`;

      return axios({
        method: 'get',
        url: getEntityUrl,
        params: {
          e,
          asOf,
          since,
        },
        headers: {
          'Accept': EDN_MIME_TYPE,
        },
      })
      .then(response => parseEdnResponse(response));
    },
  };
}

function parseEdnResponse(response, responseDefault = []) {
  return Promise.resolve(response)
    .then(res => res.data)
    .then(responseBodyString => edn.parse(responseBodyString))
    .then(responseBodyEdn => edn.toJS(responseBodyEdn))
    .then(parsedResponse => parsedResponse || responseDefault);
}
