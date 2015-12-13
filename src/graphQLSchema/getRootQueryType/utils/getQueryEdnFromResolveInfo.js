// import edn from 'jsedn';
// import { connectionArgs } from 'graphql-relay';
import { FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT } from 'graphql/language/kinds';
import { contains, isArray, first, keys, omit, reduce, values } from 'underscore';

// Query input field -> expression operator
export const operatorMap = {
  is: '=',
  isNot: '!=',
  greaterThan: '>',
  greaterThanOrEqualTo: '>=',
  lessThan: '<',
  lessThanOrEqualTo: '<=',

  isMissing: 'missing?',

  not: 'not',
  or: 'or',
  and: 'and',
};

// Array of fields to exclude from query edn
// export const excludeFields = keys(connectionArgs);

export default function getQueryEdnFromResolveInfo(resolveInfo) {
  const { operation = {} } = resolveInfo;
  const { selectionSet: { selections: operationSelections = [] } } = operation;
  // console.log('getQueryEdnFromResolveInfo... resolveInfo:', resolveInfo);
  // console.log('getQueryEdnFromResolveInfo... operationSelections:', operationSelections);
  const queryFields = getQueryFields(resolveInfo);
  console.log('queryFields:', queryFields);

  // const filteredArgs = omit(args, excludeFields);
  // const transformedArgs = reduce(args, (aggregateArgs, argValue, argKey) => {
  //   const mappedOperator = operatorMap[argKey] || argKey;
  //
  //   return {
  //     ...aggregateArgs,
  //     [mappedOperator]: argValue,
  //   };
  // }, {});
  // console.log('filteredArgs:', filteredArgs);
  // console.log('transformedArgs:', transformedArgs);
  // TODO: Get datomic attribute name from arg name and type (what about reverse?)...
  // const argVectors = reduce(transformedArgs, (aggregateArgVectors, argOperand, argOperator) => {
  //   return [
  //     ...aggregateArgVectors,
  //     new edn.Vector([
  //       edn.sym(argOperator),
  //     ]),
  //   ]
  // }, []);
  //
  // return new edn.Vector([
  //   edn.kw(':find'), new edn.Vector([
  //     new edn.List([edn.sym('pull'), edn.sym('?e'), new edn.Vector(['*'])]), edn.sym('...')]),
  //     edn.kw(':where'), new edn.Vector([edn.sym('?e'), edn.kw(':extGraphQL.type/name'), edn.sym('_')]),
  // ]);
}

function getQueryFields(resolveInfo) {
  const { fieldName, fieldASTs, schema } = resolveInfo;
  const { _queryType: { _fields: schemaQueryFields = {} } } = schema;
  const queryFieldType = schemaQueryFields[fieldName].type;
  // console.log('queryFieldType:', queryFieldType);

  const selectionsTree = fieldASTs.reduce(reduceFieldASTsToSelectionsTree, { tree: {}, resolveInfo }).tree;
  const fieldSelectionsTree = selectionsTree[fieldName];

  return fieldSelectionsTree;
}

function reduceFieldASTsToSelectionsTree({ tree, resolveInfo }, branch) {
  const branchHasSelectionSet = branch.selectionSet && isArray(branch.selectionSet.selections);

  // Skip branch if it's not a FRAGMENT_SPREAD, INLINE_FRAGMENT or FIELD kind
  if (!contains([FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT], branch.kind)) {
    return { tree, resolveInfo };
  }

  // FRAGMENT_SPREAD with selectionSet...
  if (branch.kind === FRAGMENT_SPREAD && branchHasSelectionSet) {
    const fragmentName = branch.name.value;
    const fragment = resolveInfo.fragments[fragmentName];

    return {
      tree: {
        ...tree,
        ...fragment.selectionSet.selections.reduce(reduceFieldASTsToSelectionsTree, { tree: {}, resolveInfo }).tree,
      },
      resolveInfo,
    };
  }

  // FIELD with selectionSet...
  if (branch.kind === FIELD && branchHasSelectionSet) {
    return {
      tree: {
        ...tree,
        [branch.name.value]: branch.selectionSet.selections.reduce(reduceFieldASTsToSelectionsTree, { tree: {}, resolveInfo }).tree,
      },
      resolveInfo,
    };
  }

  // INLINE_FRAGMENT with selectionSet...
  if (branch.kind === INLINE_FRAGMENT && branchHasSelectionSet) {
    return {
      tree: {
        ...tree,
        ...branch.selectionSet.selections.reduce(reduceFieldASTsToSelectionsTree, { tree: {}, resolveInfo }).tree,
      },
      resolveInfo,
    };
  }

  // Scalar field
  return {
    tree: {
      ...tree,
      [branch.name.value]: true,
    },
    resolveInfo,
  };
}
