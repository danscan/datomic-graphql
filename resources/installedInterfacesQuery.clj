; This query gets installed types
; Just copy and paste this into the q field in the Query REST API
[:find
  [(pull ?e [
    :extGraphQL.interface/name
    {:extGraphQL.implementations [:db/ident :extGraphQL.type/name]}
  ]) ...] :where [?e :extGraphQL.type/name _]]
