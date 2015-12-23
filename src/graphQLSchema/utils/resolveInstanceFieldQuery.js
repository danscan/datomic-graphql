import getQueryEdn from './getQueryEdn';
import getReferenceFieldClause from './getReferenceFieldClause';
import getObjectFromEntity from '../../utils/getObjectFromEntity';

export default function resolveInstanceFieldQuery({ parent, fieldName, args, schemaTypeName, db }) {
  let referenceFieldClause;
  if (parent.__typeName) {
    referenceFieldClause = getReferenceFieldClause(parent.id, parent.__typeName, fieldName);
  }
  // TODO: Add limit 1...
  // console.log('resolveInstanceFieldQuery... TODO: Add limit 1...');
  const queryEdn = getQueryEdn({ args, schemaTypeName, referenceFieldClause });

  return db.query(queryEdn)
    .then(results => results.map(entity => getObjectFromEntity(entity, schemaTypeName)))
    .then(results => results[0] || null)
    .catch(error => console.error(error.stack || error));
}
