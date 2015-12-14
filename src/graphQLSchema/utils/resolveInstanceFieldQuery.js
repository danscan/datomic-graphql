import getQueryEdn from './getQueryEdn';
import getObjectFromEntity from '../../utils/getObjectFromEntity';

export default function resolveInstanceFieldQuery({ parent, args, schemaTypeName, db }) {
  console.log('resolveInstanceFieldQuery... parent:', parent);
  // TODO: Add limit 1...
  console.log('resolveInstanceFieldQuery... TODO: Add limit 1...');
  const queryEdn = getQueryEdn({ args, schemaTypeName });
  console.log('queryEdn:', queryEdn);

  return db.query(queryEdn)
    .then(results => results.map(entity => getObjectFromEntity(entity)))
    .then(results => results[0] || null);
}
