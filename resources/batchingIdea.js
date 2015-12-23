/*eslint-disable */
// # Notes
// - parent field (optionally resolved w/ args)
//   - scalar field
//     - resolve field's attribute where e = parent field's id
//   - referece (singular) field
//     - query reference from parent field?
//     - resolve fields like scalar fields (above)
//   - connection field
//     - query reference from parent field
//     - return connectionFromArray... resolve array
//
//
// unify predicates via union
// unify fields for each predicate via union?

// # Types
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Someone who uses the app',
  fields: () => ({
    id: globalIdField('User'),

    username: {
      type: GraphQLString,
      description: 'The user\'s username',
      resolve: (parent, args) => {
        return resolveScalarField({ type: UserType, fieldName: 'username', parent, args }); // returns promise for username
      },
    },

    email: {
      type: GraphQLString,
      description: 'The user\'s email',
      resolve: (parent, args) => {
        return resolveScalarField({ type: UserType, fieldName: 'email', parent, args }); // returns promise for email
      },
    },

    posts: {
      type: PostsConnection,
      description: 'The posts that reference the user via their "creator" field',
      args: { ...postPredicate, ...connectionArgs },
      resolve: (parent, args) => {
        return resolveConnectionField({ type: UserType, fieldName: 'posts', parent, args }); // returns promise for posts (how?)
      },
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'A post created by a user',
  fields: () => ({
    id: globalIdField('Post'),

    creator: {
      type: User,
      description: 'The user who created the post',
      resolve: (parent, args) => {
        return resolveReferenceField({ type: PostType, fieldName: 'creator', parent, args }); // returns promise for creator (how?)
      },
    },

    caption: {
      type: GraphQLString,
      description: 'The post\'s caption',
      resolve: (parent, args) => {
        return resolveScalarField({ type: PostType, fieldName: 'caption', parent, args }); // returns promise for caption
      },
    },

    imageUri: {
      type: GraphQLString,
      description: 'The post\'s image\'s uri',
      resolve: (parent, args) => {
        return resolveScalarField({ type: PostType, fieldName: 'imageUri', parent, args }); // returns promise for imageUri
      },
    },
  }),
})

// # Query
query UserPosts {
  user(id: { is: 2 }) {
    username
    email
    posts {
      edges {
        node {
          caption
          imageUri
        }
      }
    }
  }
}

// # Batched...
const batchedResolutions = {
  types: [UserType, PostType],
  typesPredicateExpressionsMap: {
    [UserType.name]: { id: 2 },
    [PostType.name]: { creator: { id: 2 } }, // connection args...? clause/predicate for reference query...?
    // IDEA: use reference field from query (User.posts) (? what if it's reverse? how to identify the e of referring node? IDEA: use predicate used to select referring node)
  },
  typesAttributesMap: {
    [UserType.name]: [
      'username',
      'email',
    ],
    [PostType.name]: [
      'caption',
      'imageUri',
    ],
  },
  typesAttributesPredicateExpressionsMap: {
    [UserType.name]: {
      'username': null,
      'email': null,
    },
    [PostType.name]: {
      'caption': null,
      'imageUri': null,
    }
  },
};
// ->
const batchedQueries = [
  {
    entityUnificationVariable: '?user', // name of type
    findVariables: ['?username', '?email'], // from type attributes map
    clauses: [
      ['?user', ':db/id', 2], // from type predicate expressions map
      ['?user', ':user/username', '?username'], // from type attributes map
      ['?user', ':user/email', '?email'], // from type attributes map
    ],
  },
  {
    entityUnificationVariable: '?post', // name of type
    findVariables: ['?caption', '?imageUri'], // from type attributes map
    clauses: [
      ['?creator', ':db/id', 2],
      ['?post', ':post/creator', '?creator'],
      ['?post', ':post/caption', '?caption'], // from type attributes map
      ['?post', ':post/imageUri', '?imageUri'], // from type attributes map
    ],
  },
];// -> query edn -> query -> query results -> received by fn that resolves individual resolve*Field promises w/ appropriate values

// (?) This could even be reduced to one query... probably too complicated to implement for now
// [:find ?user ?post ?user-username ?user-email ?post-caption ?post-imageUri
//  :where [?user :user/id 2]
//         [?user :user/username ?user-username]
//         [?user :user/email ?user-email]
//         [?post :post/creator ?user]
//         [?post :post/caption ?post-caption]
//         [?post :post/imageUri ?post-imageUri]]

// Resolving bi-directional relations with unidirectional refs in schema...
// will probably need to add a meta-attribute to ref-type attributes for specifying reverse reference attribute field name on target type/interface
// will need to add this to bootstrap & to attribute props
:extGraphQL/reverseRefField // type :db/keyword; unique identity? (only one attribute should point to a given reverseRefField value ... guarantees referring attribute & entity type?)

// e.g.,
post {
  creator {} // [?post :post/creator ?creator] ... (meta-attribute [:post/creator :extGraphQL/reverseRefField :user/posts])
}

user {
  posts {} // [?user :post/_creator ?post]
}
