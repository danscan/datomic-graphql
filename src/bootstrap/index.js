import installExtensionAttributes from './utils/installExtensionAttributes';
import applySchemaImpliedTypes from './utils/applySchemaImpliedTypes';
import resolveArbitraryReferenceAttributesViaCLI from './utils/resolveArbitraryReferenceAttributesViaCLI';
import resolveUnidirectionalReferenceAttributesViaCLI from './utils/resolveUnidirectionalReferenceAttributesViaCLI';

export default function bootstrap(apiUrl, dbAlias) {
  return installExtensionAttributes(apiUrl, dbAlias)
    .then(() => applySchemaImpliedTypes(apiUrl, dbAlias))
    .then(() => resolveArbitraryReferenceAttributesViaCLI(apiUrl, dbAlias))
    .then(() => resolveUnidirectionalReferenceAttributesViaCLI(apiUrl, dbAlias));
}
