; This query gets installed types
; Just copy and paste this into the q field in the Query REST API
[:find
  [(pull ?e [
    :extGraphQL.type/name
    :extGraphQL.type/namespace
    :extGraphQL.type/doc
    {:extGraphQL/_refTarget [:db/ident]}
  ]) ...] :where [?e :extGraphQL.type/name _]]
