; This query gets schema meta attributes
; Just copy and paste this into the q field in the Query REST API
[:find
  [(pull ?e [
    :db/id
    :db/ident
    :db/doc
    :db/index
    :db/fullText
    {:db/valueType [:db/ident]}
    {:db/cardinality [:db/ident]}
    {:db/unique [:db/ident]}
    :extGraphQL/required
    {:extGraphQL/refTarget [:db/ident]}
    {:extGraphQL/enumValues [:db/ident]}
  ]) ...] :where [?e :db/valueType _]]
