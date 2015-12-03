; This transaction installs the GraphQL extension's schema attributes
; Just copy and paste this into the tx-data field in the REST API
[
  ; - Type Attributes -
  ; Type Name
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL.type/name
   :db/valueType :db.type/string
   :db/cardinality :db.cardinality/one
   :db/unique :db.unique/value
   :db/doc "A type's name in the GraphQL type system"
   :db.install/_attribute :db.part/db}
  ; Type Namespace
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL.type/namespace
   :db/valueType :db.type/keyword
   :db/cardinality :db.cardinality/one
   :db/unique :db.unique/value
   :db/doc "The namespace of a type's attribute idents in the db"
   :db.install/_attribute :db.part/db}
  ; Type Description Doc
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL.type/doc
   :db/valueType :db.type/string
   :db/cardinality :db.cardinality/one
   :db/doc "The description of a type"
   :db.install/_attribute :db.part/db}

  ; - Interface Attributes -
  ; Interface Name
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL.interface/name
   :db/valueType :db.type/string
   :db/cardinality :db.cardinality/one
   :db/unique :db.unique/value
   :db/doc "An interface's name in the GraphQL type system"
   :db.install/_attribute :db.part/db}
  ; Interface Implementations
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL.interface/implementations
   :db/valueType :db.type/ref
   :db/cardinality :db.cardinality/many
   :db/doc "The types that implement an interface"
   :db.install/_attribute :db.part/db}
  ; Interface Description Doc
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL.interface/doc
   :db/valueType :db.type/string
   :db/cardinality :db.cardinality/one
   :db/doc "The description of an interface"
   :db.install/_attribute :db.part/db}

  ; - Meta Attributes -
  ; Ref Target
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL/refTarget
   :db/valueType :db.type/ref
   :db/cardinality :db.cardinality/one
   :db/doc "The type or interface that a reference attribute targets"
   :db.install/_attribute :db.part/db}
   ; Enum Values
  {:db/id #db/id[:db.part/db]
   :db/ident :extGraphQL/enumValues
   :db/valueType :db.type/ref
   :db/cardinality :db.cardinality/many
   :db/doc "The possible values of an enumeration-type reference attribute"
   :db.install/_attribute :db.part/db}

  ; (Attribute) Required
  ; {:db/id #db/id[:db.part/db]
  ;  :db/ident :extGraphQL/required
  ;  :db/valueType :db.type/boolean
  ;  :db/cardinality :db.cardinality/one
  ;  :db/doc "Whether an attribute must have a value for its entity to be valid"
  ;  :db.install/_attribute :db.part/db}
]
