# 01: Expand parity sweeps with shared-semantics pins

**What to build:** The live-API harness pins, end-to-end, every shared CRUD semantic the
MasterCrud module will take over — before any backend code moves. Running
`scripts/with-api.sh scripts/master-parity-sweep.sh` (gridify masters: sectors, plants,
contractor-companies) additionally verifies: missing get-by-id → 404 with the existing
`ErrorResponse` copy; create with a blank required field → 400 with the validation copy
("Name is required"); delete of a record referenced by a Security Observation → 409 with
the conflict copy ("X is referenced by security observations and cannot be deleted").
`scripts/combo-parity-check.sh` additionally verifies the flat catalogue's exact order
(comboKey → order → id) and the comboKey-scoped lookup feed. The pins assert wire
behavior only — status codes, envelopes, ordering, message copy.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Gridify sweep pins per master: 404 copy, 400 validation copy, 409 FK-conflict copy — green against the current clone services under the harness
- [ ] Combo check pins: flat-catalogue order and comboKey lookup — green against the current service
- [ ] Sweep deletions referenced by a fresh Security Observation created in-script (no pre-existing data assumptions), cleaned up after
- [ ] All new checks print PASS lines in the existing sweep style and fail the script's exit code on any FAIL
