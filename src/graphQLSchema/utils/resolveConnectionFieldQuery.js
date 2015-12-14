import { connectionFromArray } from 'graphql-relay';
import getQueryEdn from './getQueryEdn';
import getObjectFromEntity from '../../utils/getObjectFromEntity';

export default function resolveConnectionFieldQuery({ parent, args, schemaTypeName, db }) {
  console.log('resolveInstanceFieldQuery... parent:', parent);
  const queryEdn = getQueryEdn({ args, schemaTypeName });
  console.log('queryEdn:', queryEdn);

  return db.query(queryEdn)
    .then(results => results.map(entity => getObjectFromEntity(entity)))
    .then(results => connectionFromArray(results, args));
}
