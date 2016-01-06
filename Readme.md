# datomic-graphql
[Work in Progress] GraphQL interface to datomic.

### Purpose
Datomic is a very interesting database with a simple design.  I discovered it right when GraphQL was released, and wanted to test the potential for aligning GraphQL & Datomic.

The goal of this project is to enable a GraphQL interface atop any Datomic database with minimal configuration.  Furthermore, I'd really like to use GraphQL to mutate the schema itself, such that it could be considered GraphQL as a backend.

Better notes coming soon.  **Please don't hesitate to contact me or open an issue if this interests you!**


## Running the Example

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
npm start
```
