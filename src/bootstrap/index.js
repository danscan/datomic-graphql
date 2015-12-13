import installExtensionAttributes from './utils/installExtensionAttributes';
import applySchemaImpliedTypes from './utils/applySchemaImpliedTypes';
import resolveArbitraryReferenceAttributesViaCLI from './utils/resolveArbitraryReferenceAttributesViaCLI';

export default function bootstrap(apiUrl, dbAlias) {
  return installExtensionAttributes(apiUrl, dbAlias)
    .then(() => applySchemaImpliedTypes(apiUrl, dbAlias))
    .then(() => resolveArbitraryReferenceAttributesViaCLI(apiUrl, dbAlias));
}
