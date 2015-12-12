import express from 'express';
import session from 'express-session';
import graphQLHTTP from 'express-graphql';
import getGraphQLSchema from '../src';

// (Configuration constants)
const PORT = process.env.PORT || 8000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'keyboard cat';
const DATOMIC_REST_API_URL = process.env.DATOMIC_REST_API_URL || 'http://localhost:8080';
const DATOMIC_DB_ALIAS = process.env.DATOMIC_DB_ALIAS || 'dev/mbrainz-1968-1973';

// Create HTTP server
const app = express();

// Get graphql schema
getGraphQLSchema(DATOMIC_REST_API_URL, DATOMIC_DB_ALIAS)
  // .then(graphQLSchema => console.log('graphQLSchema:', graphQLSchema))
  .then(graphQLSchema => {
    // Expose session middleware at root
    app.use('/', session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }));

    // Expose (session-aware) GraphQL interface to schema at root
    app.use('/', graphQLHTTP(request => ({
      schema: graphQLSchema,
      rootValue: {
        session: request.session,
      },
      pretty: true,
      graphiql: true,
    })));

    // Listen HTTP server on configured port
    app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));
  })
  .catch(error => console.error('Error:', error.stack || error));
