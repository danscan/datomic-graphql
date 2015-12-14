import { getAttributeNameFromAttributeIdent } from './inflect';
import { reduce } from 'underscore';

export default function getObjectFromEntity(entity) {
  const object = reduce(entity, (aggregateObject, attributeValue, attributeIdent) => {
    const attributeName = getAttributeNameFromAttributeIdent(attributeIdent);

    return {
      ...aggregateObject,
      [attributeName]: attributeValue,
    };
  }, {});

  return object;
}
