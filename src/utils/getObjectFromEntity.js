import { getAttributeNameFromAttributeIdent } from './inflect';
import { reduce } from 'underscore';

export default function getObjectFromEntity(entity, schemaTypeName) {
  const initialObject = { __typeName: schemaTypeName };
  const object = reduce(entity, (aggregateObject, attributeValue, attributeIdent) => {
    const attributeName = getAttributeNameFromAttributeIdent(attributeIdent);

    return {
      ...aggregateObject,
      [attributeName]: attributeValue,
    };
  }, initialObject);

  return object;
}
