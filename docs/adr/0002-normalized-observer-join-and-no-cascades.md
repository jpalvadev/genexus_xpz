# Normalized observer join, no cascades

GeneXus carried the observers of a planned security observation as one concatenated
string attribute (`SHYMA_OPSObservador`) assembled by a 1–10 picker. We store them in a
normalized `SecurityObservationObserver (ObservationId, ObserverId)` join table instead:
the glossary rule "one to ten Observers, ten is the hard limit" is only enforceable over
real rows, observers stay queryable per-person, and a display name change never rewrites
history. All FKs to reference entities (Plant, Sector, ContractorCompany, Observer) use
`Restrict` delete — retiring a reference never retires the observations that name it,
exactly as the export behaved.
