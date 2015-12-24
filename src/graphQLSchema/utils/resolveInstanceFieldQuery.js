import getQueryEdn from './getQueryEdn';
import getReferenceFieldClause from './getReferenceFieldClause';
import getObjectFromEntity from '../../utils/getObjectFromEntity';

export default function resolveInstanceFieldQuery({ parent, attributeIdent, isReverseRef, args, schemaTypeName, db }) {
  let referenceFieldClause;
  if (parent.__typeName) {
    referenceFieldClause = getReferenceFieldClause({ parentId: parent.id, attributeIdent, isReverseRef });
  }
  // TODO: Add limit 1...
  // console.log('resolveInstanceFieldQuery... TODO: Add limit 1...');
  const queryEdn = getQueryEdn({ args, schemaTypeName, referenceFieldClause });

  return db.query(queryEdn)
    .then(results => results.map(entity => getObjectFromEntity(entity, schemaTypeName)))
    .then(results => results[0] || null)
    .catch(error => console.error(error.stack || error));
}
