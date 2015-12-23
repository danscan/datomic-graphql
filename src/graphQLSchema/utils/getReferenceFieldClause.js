import edn from 'jsedn';
import { getAttributeIdentFromAttributeNameAndTypeName } from '../../utils/inflect';

export default function getReferenceFieldClause(parentId, parentTypeName, fieldName) {
  const referenceAttributeIdent = getAttributeIdentFromAttributeNameAndTypeName(fieldName, parentTypeName);

  // FIXME: Doesn't work for reverse attributes...
  console.log('getReferenceFieldClause... FIXME: Doesn\'t work for reverse attributes...');
  console.log('getReferenceFieldClause... parentId:', parentId);
  console.log('getReferenceFieldClause... parentTypeName:', parentTypeName);
  console.log('getReferenceFieldClause... fieldName:', fieldName);
  return new edn.Vector([
    parentId,
    referenceAttributeIdent,
    edn.sym('?e'),
  ]);
}
