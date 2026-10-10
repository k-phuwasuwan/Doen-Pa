# Personal record read performance

Run `pnpm bench:records` to compare the previous per-caller read model with the shared snapshot reader.

The benchmark uses the real local place catalog and synthetic personal records. It represents one Search filter plus one VisitCount per catalog card. Every measured round includes building a model for a new snapshot, so it does not report only a warm-cache lookup.

On the local Node 20 run on 2026-10-10, the catalog had 11 places (12 callers):

| Records | Previous models | Shared models | Previous median ms | Shared median ms |
| --- | --- | --- | --- | --- |
| 0 | 12 | 1 | 0.015 | 0.003 |
| 100 | 12 | 1 | 0.224 | 0.019 |
| 1,000 | 12 | 1 | 0.569 | 0.040 |
| 10,000 | 12 | 1 | 6.583 | 0.400 |

Times are medians of seven rounds after three warmups and vary by machine. This measures read-model computation in Node, excluding JSON parsing, photos, network requests, React rendering and the DOM. It is not a page-load or browser frame-time benchmark; no timing threshold is enforced in tests.

The shared reader indexes results by immutable decoded snapshot identity and user ID. A changed snapshot builds a fresh result. User IDs are isolated, and WeakMap keys allow old snapshots and their models to be collected. The local catalog is fixed for each reader instance. Storage writes replace arrays rather than mutating a cached snapshot.

Regression tests cover model reuse, invalidation after records change, and isolation between users. Domain behavior remains tested through the same interface used by the app.
