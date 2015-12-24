import edn from 'jsedn';

export default function getReferenceFieldClause({ parentId, attributeIdent, isReverseRef }) {
  if (!isReverseRef) {
    return new edn.Vector([
      parentId,
      attributeIdent,
      edn.sym('?e'),
    ]);
  }

  return new edn.Vector([
    edn.sym('?e'),
    attributeIdent,
    parentId,
  ]);
}
