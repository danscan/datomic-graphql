// import consumer from '../../consumer';
import { GraphQLObjectType } from 'graphql';
import getSchemaTypesAndInterfaces from '../../utils/getSchemaTypesAndInterfaces';
import { reduce } from 'underscore';

export default function getRootMutationType(apiUrl, dbAlias) {
  return generateRootMutationFields(apiUrl, dbAlias)
    .then(rootMutationFields => {
      return new GraphQLObjectType({
        name: 'Mutation',
        description: 'Root mutation type',
        fields: () => rootMutationFields,
      });
    });
}

function generateRootMutationFields(apiUrl, dbAlias) {
  // const db = consumer(apiUrl, dbAlias);

  return getSchemaTypesAndInterfaces(apiUrl, dbAlias)
    .then(({ schemaTypes }) => {
      return reduce(schemaTypes, (aggregateFields, schemaType, schemaTypeName) => {
        // TODO: Get real field names...
        // Field names
        const createFieldName = `create${schemaTypeName}`;
        const patchFieldName = `patch${schemaTypeName}s`;
        const replaceFieldName = `replace${schemaTypeName}`;
        const deleteFieldName = `delete${schemaTypeName}s`;

        // TODO: Create real mutation fields...
        return {
          ...aggregateFields,
          [createFieldName]: true,
          [patchFieldName]: true,
          [replaceFieldName]: true,
          [deleteFieldName]: true,
        };
      }, {});
    });
}
