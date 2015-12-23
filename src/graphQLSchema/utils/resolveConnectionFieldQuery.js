import { connectionFromArray } from 'graphql-relay';
import getQueryEdn from './getQueryEdn';
import getReferenceFieldClause from './getReferenceFieldClause';
import getObjectFromEntity from '../../utils/getObjectFromEntity';

export default function resolveConnectionFieldQuery({ parent, fieldName, args, schemaTypeName, db }) {
  let referenceFieldClause;
  if (parent.__typeName) {
    referenceFieldClause = getReferenceFieldClause(parent.id, parent.__typeName, fieldName);
  }
  const queryEdn = getQueryEdn({ args, schemaTypeName, referenceFieldClause });

  return db.query(queryEdn)
    .then(results => results.map(entity => getObjectFromEntity(entity, schemaTypeName)))
    .then(results => connectionFromArray(results, args))
    .catch(error => console.error(error.stack || error));
}
