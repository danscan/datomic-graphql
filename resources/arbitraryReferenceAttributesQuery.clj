; This query gets arbitrary reference attributes
; Just copy and paste this into the q field in the Query REST API
[:find ?ident :where
  [?e :db/ident ?ident]
  [?e :db/valueType :db.type/ref]
  [(missing? $ ?e :extGraphQL/refTarget)]
  [(missing? $ ?e :extGraphQL/enumValues)]]
