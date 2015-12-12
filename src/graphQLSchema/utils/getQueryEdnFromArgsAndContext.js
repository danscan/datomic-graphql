import edn from 'jsedn';
import { connectionArgs } from 'graphql-relay';
import { isArray, first, keys, omit, reduce, values } from 'underscore';

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
export const excludeFields = keys(connectionArgs);

export default (args, context, connection = false) => {
  const queryFields = !connection
                    ? getQueryFields(context)
                    : getQueryEdgeNodeFields(context);
  console.log('queryFields:', queryFields);
  const filteredArgs = omit(args, excludeFields);
  const transformedArgs = reduce(args, (aggregateArgs, argValue, argKey) => {
    const mappedOperator = operatorMap[argKey] || argKey;

    return {
      ...aggregateArgs,
      [mappedOperator]: argValue,
    };
  }, {});
  console.log('filteredArgs:', filteredArgs);
  console.log('transformedArgs:', transformedArgs);
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
};

function getQueryFields(context, fieldASTs = context.fieldASTs) {
  const selections = fieldASTs.reduce(reduceBranch, {});

  return keys(first(values(selections)));
}

function getQueryEdgeNodeFields(context, fieldASTs = context.fieldASTs) {
  const selections = fieldASTs.reduce(reduceBranch, {});

  return keys(first(values(selections)).edges.node);
}

function reduceBranch(tree, branch) {
  // console.log('tree:', tree);
  // console.log('branch:', branch);
  if (branch.selectionSet && isArray(branch.selectionSet.selections)) {
    return {
      ...tree,
      [branch.name.value]: branch.selectionSet.selections.reduce(reduceBranch, {}),
    };
  }

  return {
    ...tree,
    [branch.name.value]: true,
  };
}
