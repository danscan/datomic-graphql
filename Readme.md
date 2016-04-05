# datomic-graphql
GraphQL interface to datomic.

## Status
This works.  It's pretty nice!  It's unfinished though, and while I plan to make use of it, I am not maintaining it now.  If you're interested at all, please open an issue, and I'll respond!

### Purpose
Datomic is a very interesting database with a simple design.  I discovered it right when GraphQL was released, and wanted to test the potential for aligning GraphQL & Datomic.

The goal of this project is to enable a GraphQL interface atop any Datomic database with minimal configuration.  Furthermore, I'd really like to use GraphQL to mutate the schema itself, such that it could be considered GraphQL as a backend.

Better notes coming soon.  **Please don't hesitate to contact me or open an issue if this interests you!**


## Running the Example

GraphiQL interface to Mbrainz Datomic sample database.
![GraphiQL](https://cloud.githubusercontent.com/assets/1638987/12154291/a4d30cda-b48c-11e5-841d-62428f642d2f.png)

### Datomic / Mbrainz Setup
First download the datomic-pro trial and follow [this tutorial](http://blog.datomic.com/2013/07/datomic-musicbrainz-sample-database.html) to create the musicbrainz database.

Then, from within `datomic-pro-0.9.x` (in different Terminal tabs / tmux / bg):
```
bin/transactor config/samples/dev-transactor-template.properties

bin/rest -p 8080 dev datomic:dev://localhost:4334/
```

Clone this repository, npm install, and cd to the example directory.
```
git clone https://github.com/danscan/datomic-graphql.git
cd datomic-graphql
npm install
cd example
npm install
npm start
```

`datomic-graphql` will prompt you to resolve so ambiguities regarding reference attribute targets, enum values, etc.  Once ambiguities are resolved, a GraphQL server will start up.
