import querySchemaImpliedTypes from '../utils/querySchemaImpliedTypes';
import queryInstalledTypes from '../utils/queryInstalledTypes';
import queryInstalledInterfaces from '../utils/queryInstalledInterfaces';
import { mapObject } from 'underscore';

export default (apiUrl, dbAlias) => {
  return Promise.all([
    querySchemaImpliedTypes(apiUrl, dbAlias),
    queryInstalledTypes(apiUrl, dbAlias),
    queryInstalledInterfaces(apiUrl, dbAlias),
  ])
  .then(([schemaImpliedTypes, installedTypes, installedInterfaces]) => {
    return {
      schemaInterfaces: installedInterfaces,
      schemaTypes: mapObject(schemaImpliedTypes, (type, typeName) => {
        return {
          attributes: type,
          ...installedTypes[typeName],
        };
      }),
    };
  });
};
