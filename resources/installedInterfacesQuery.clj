; This query gets installed interfaces
; Just copy and paste this into the q field in the Query REST API
[:find
  [(pull ?e [
    :extGraphQL.interface/name
    {:extGraphQL.interface/implementations [:db/ident :extGraphQL.type/name]}
    :extGraphQL.interface/doc
    {:extGraphQL/_refTarget [:db/ident]}
  ]) ...] :where [?e :extGraphQL.interface/name _]]
