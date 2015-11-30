import express from 'express';
import session from 'express-session';
import graphQLHTTP from 'express-graphql';
import { applyTypes, getSchemaData, getSchemaArbitraryReferenceAttributes, getInstalledInterfaces, getInstalledTypes } from '../src';

// Configuration constants
const PORT = process.env.PORT || 8000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'keyboard cat';
const DATOMIC_REST_API_URL = process.env.DATOMIC_REST_API_URL || 'http://localhost:8080';
const DATOMIC_DB_ALIAS = process.env.DATOMIC_DB_ALIAS || 'dev/mbrainz-1968-1973';

getSchemaData(DATOMIC_REST_API_URL, DATOMIC_DB_ALIAS)
  // .then(schemaData => { console.log('schemaData:', schemaData); return schemaData; })
  // .then(schemaData => getSchemaArbitraryReferenceAttributes(schemaData))
  // .then(schemaArbitraryReferenceAttributes => console.log('schemaArbitraryReferenceAttributes:', schemaArbitraryReferenceAttributes))
  // .then(_ => applyTypes(DATOMIC_REST_API_URL, DATOMIC_DB_ALIAS))
  // .then(_ => getInstalledInterfaces(DATOMIC_REST_API_URL, DATOMIC_DB_ALIAS))
  // .then(installedInterfaces => console.log('installedInterfaces:', installedInterfaces))
  .then(_ => getInstalledTypes(DATOMIC_REST_API_URL, DATOMIC_DB_ALIAS))
  .then(installedTypes => console.log('installedTypes:', installedTypes))
  .catch(error => console.error(error.stack || error));

// // Create HTTP server
// const app = express();
//
// // Create graphql schema
// createGraphQLSchema(DATOMIC_REST_API_URL, DATOMIC_DB_ALIAS)
//   .then(graphQLSchema => {
//     // Expose session middleware at root
//     app.use('/', session({
//       secret: SESSION_SECRET,
//       resave: false,
//       saveUninitialized: false,
//       cookie: {
//         maxAge: 1000 * 60 * 60 * 24 * 7,
//       },
//     }));
//
//     // Expose (session-aware) GraphQL interface to schema at root
//     app.use('/', graphQLHTTP(request => ({
//       schema: graphQLSchema,
//       rootValue: {
//         session: request.session,
//       },
//       pretty: true,
//       graphiql: true,
//     })));
//
//     // Listen HTTP server on configured port
//     app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));
//   })
//   .catch(error => console.error('Error:', error.stack || error));
