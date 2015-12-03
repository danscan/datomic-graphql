import installExtensionAttributes from './utils/installExtensionAttributes';
import applySchemaImpliedTypes from './utils/applySchemaImpliedTypes';
import resolveArbitraryReferenceAttributesViaCLI from './utils/resolveArbitraryReferenceAttributesViaCLI';
import querySchemaImpliedTypes from './utils/querySchemaImpliedTypes';

export default (apiUrl, dbAlias) => {
  return installExtensionAttributes(apiUrl, dbAlias)
    .then(() => applySchemaImpliedTypes(apiUrl, dbAlias))
    .then(() => resolveArbitraryReferenceAttributesViaCLI(apiUrl, dbAlias))
    .then(() => querySchemaImpliedTypes(apiUrl, dbAlias));
};
