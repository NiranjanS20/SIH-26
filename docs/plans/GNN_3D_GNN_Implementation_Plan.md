# GNN & 3D GNN Implementation Plan
## MOIL Manganese Prospectivity Platform — Research Extension Track
### SIH 2026 PS 26009 | Additive to, not a replacement for, the locked Model 1 baseline

---

## 0. Non-negotiable framing (read before anything else)

This is a **research extension tier**, evaluated against your already-locked
Model 1 baseline (Random Forest, chosen after benchmarking against Logistic
Regression / SVM / LightGBM). It is not a fifth candidate thrown into that
benchmarking round, and it must never be ensembled or stacked with the
winning model — your own locked rule ("no ensembling or stacking of
candidates; losing models are deleted") exists for the benchmarking
*selection* process, and this work respects that by treating the GNN as a
separate, later-stage research comparison, not a sixth contestant in the
same race.

**Blocking precondition, before any GNN code is written:** your own project
state currently flags that "some model experiments were run without the
full datasets available to the coding environment" and that existing
performance numbers are provisional. Stage 0 of this plan (below) is
restoring and re-running the real baseline. Building a GNN on top of an
unverified baseline means you have nothing honest to compare it against —
this would actively undermine your pitch rather than strengthen it. Do not
skip this.

**What can honestly be claimed to judges, and nothing more:**
- GNN is a research upgrade exploring explicit spatial/geological
  relationship modeling — not a proven replacement for the current baseline
- The published literature (cited below) shows GNN outperforming tabular
  baselines *in other deposits* — no MOIL-specific improvement percentage
  may be claimed until your own experiment produces one
- 3D GNN requires subsurface drillhole/assay data that **may not currently
  exist in usable form for your sites** (see Section 5) — this must be
  stated as a precondition, not glossed over

---

## 1. What a GNN actually changes, precisely (grounded in literature)

Your current Model 1 (Random Forest on pooled 16–18 features per grid cell)
treats every cell as an independent row in a table. Published
mineral-prospectivity-mapping (MPM) research confirms your uploaded report's
core claim: a GNN instead represents the study area as an explicit graph —
nodes carry the same per-cell features you already compute, but edges let
information propagate between spatially or geologically related cells
during training, something a tabular model cannot do without manual feature
engineering.

Multiple recent peer-reviewed studies (Sihombing et al., *Ore Geology
Reviews* 2024; an attention-driven GCN study in *Computers & Geosciences*
2025; a Knowledge-Data-Collaboration GAT study, *Minerals* 2025; a
heterogeneous GCN study for the Zhongtiaoshan copper deposit, 2026)
consistently report the same two findings relevant to you:
1. Graph-based MPM outperforms pixel/tabular-based MPM **when evaluated on
   the same underlying data**, because explicit spatial propagation
   recovers signal that engineered proxy features miss.
2. The performance gain is deposit-specific and not guaranteed to transfer —
   none of these studies claim a universal percentage improvement, which
   matches the honesty standard your own project documentation already
   holds itself to.

---

## 2. Stage 1 (prerequisite) — Re-establish the verified baseline

Per your own project's evidence-integrity flag, this happens before any
graph code exists:
1. Restore all real project datasets (not the ones used in the
   under-tested experiment run).
2. Re-run Random Forest, Logistic Regression, SVM, and LightGBM on the
   **identical** pooled 16–18 feature set, with mandatory GroupKFold CV
   grouped by `site_id` (your locked rule — not plain stratified k-fold).
3. Record Precision, Recall, F1, AUROC, **and AUPRC** — AUPRC is especially
   important given your own already-documented finding that with ~9
   confirmed positives out of 1,002 total cells (Dongri Buzurg), AUC-ROC and
   F1 are statistically unreliable. This is the same reasoning that led your
   project to prefer a continuous regression prospectivity score over a
   binary classifier — carry that preference through to the GNN comparison
   too (Section 4).
4. This re-verified result becomes the **fixed comparison target** for every
   subsequent GNN experiment. Log it once, reference it, don't silently
   re-derive a new "baseline" each time a GNN experiment runs.

---

## 3. Stage 2 — Graph construction specification (the actual engineering work)

### 3.1 Node definition
One node per grid cell, exactly matching your existing pixel-based Model 1
unit of analysis — no change to spatial resolution or cell boundaries.

### 3.2 Node features
**Reuse the exact locked 16–18 pooled feature set, unchanged**: NDVI / LST /
soil-moisture (monsoon-dry-annual variants + seasonal deltas), slope,
elevation, iron oxide index, clay index, `in_gondite_formation`,
`mno_geochem_proxy`. Do not invent new node features for this stage — the
graph structure itself (edges) is what's new, not the feature vector. This
also means **`site_id` is still included as a node feature**, consistent
with the locked pooled-training design.

### 3.3 Edge construction — the core design decision
Published literature converges on two viable approaches; recommend starting
with the simpler one and only adding complexity if it earns its keep:

**Option A (start here) — Pure spatial k-NN adjacency.**
Construct an undirected graph where each node connects to its *k* nearest
neighbours by spatial distance (k=8 is a common literature default,
equivalent to a queen's-case neighbourhood on a grid). This is the approach
used in the GAT-based "Knowledge-Data-Collaboration" study (*Minerals*,
2025) and is the standard, well-validated starting point. Edge weights can
initially be uniform (unweighted) or inverse-distance, with the model
learning importance via attention in Stage 3.

**Option B (upgrade path, not Stage 2) — Hybrid spatial + feature-distance
edges.** Recent work ("Features Leverage in Graph Models for Mineral
Prospectivity Mapping") shows combining spatial proximity with
feature-space similarity when deciding which cells to connect outperforms
pure spatial adjacency alone. Hold this as a documented Stage 3+ refinement,
not a Stage 2 requirement — get the simple graph working and validated
first.

**Critical constraint from your locked architecture — do not violate this:**
Geophysics (magnetic/gravity, Tirodi-only) and structural fault/shear-zone
distance (Tirodi and Sitapatore only) are explicitly *never imputed* for
sites lacking the data. This means **edges must not implicitly leak this
information across site boundaries** — e.g., a Dongri Buzurg node must never
receive propagated signal derived from a neighbouring node's fault-distance
feature if Dongri Buzurg itself has no such feature. Practically: run the
graph construction **separately per site** (three separate graphs, each
respecting that site's actual available feature set), not one pooled
national graph where cross-site edges could exist. Pooled *training* of
model weights across sites is still fine (matches your locked pooled-model
approach) — it's the edges (information propagation), not the weights, that
must stay site-bounded.

### 3.4 The label problem — do not treat this as solved by switching to a GNN
Your uploaded report is correct and your own project documentation already
independently arrived at the same conclusion: **a GNN does not fix label
scarcity.** With ~9 confirmed positives at Dongri Buzurg, treating all other
cells as confirmed negatives (standard supervised framing) teaches the model
from false negatives regardless of architecture.

**Required complementary step: Positive-Unlabeled (PU) learning
formulation.** This is well-established in the published MPM literature
(bagging-based PU learning with RF/XGBoost as base learners is standard
practice for exactly this problem, including in 3D MPM studies). Treat
confirmed manganese occurrences as positive, everything else as
*unlabeled* (not negative), and use a PU-adapted loss or a bagging-PU
wrapper around the GNN's node classifier. Evaluate this as a **separate,
explicitly labeled experiment** from ordinary supervised GNN
classification — do not blend the two results into one number.

---

## 4. Stage 3 — Architecture progression (build in this order, benchmark at each step)

| Step | Architecture | Why this position in the sequence |
|---|---|---|
| 3a | **GCN or GraphSAGE** (simple baseline) | Establishes whether graph structure helps *at all* before adding complexity. Use PyTorch Geometric — the standard library across essentially every cited study (Oxford's Sihombing et al. explicitly used it). |
| 3b | **GAT** (Graph Attention Network) | Adds learned attention weights so the model decides which neighbours matter more, rather than treating all k-NN neighbours equally. This is the single most consistently reported source of accuracy gain across the literature reviewed. |
| 3c | **Heterogeneous GNN** (HGCN-style) | Only attempt this once 3a/3b show genuine gains. Represents different node *types* (satellite/raster cells, geochemical points, structural features) with different edge *types* between them — directly matches your multi-evidence-source situation (satellite + geochem + structural, where available). The Zhongtiaoshan copper study (2026) used exactly this pattern: geochemical elements, faults, high-density fault areas, and ore-controlling strata as four distinct node types. **Apply your locked rule here too: do not impute a node type for a site that lacks that evidence layer** — Sitapatore's thinner geochemistry and absent structural data mean its heterogeneous graph will legitimately have fewer node/edge types than Tirodi's, and that asymmetry should be disclosed exactly as your existing documentation already discloses Sitapatore's weaker evidence base. |

**Output framing — carry your existing decision forward:** given the
9-positive-out-of-1002 problem already identified as making binary
classification metrics unreliable, the GNN's primary output should also be
a **continuous prospectivity regression score** per node, not a binary
label — consistent with what your project already concluded is the more
defensible framing for the demo pitch.

**Evaluation discipline, identical across every step:** same GroupKFold
split by `site_id`, same metric set (Precision/Recall/F1/AUROC/AUPRC), same
comparison target (the Stage 1 re-verified baseline). A step only "passes"
if it beats the baseline on AUPRC specifically, given the rare-positive-class
caveat. If GCN (3a) doesn't beat the baseline, that's a valid, reportable
result — document it honestly rather than proceeding to GAT hoping it fixes
an architecture problem that might actually be a data problem.

---

## 5. Stage 4 (longer-term) — 3D Geological GNN: data precondition check first

**Before any 3D work is planned in detail, answer this question honestly:**
does the project currently hold, for any site, the data types a 3D model
requires? Per your own geology data inventory:
- Dongri Buzurg: ~266 geochem points and 24 grade *polygons* — this is
  surface/near-surface point and polygon data, **not drillhole interval
  data with depth** (coordinates + elevation + depth + trajectory + Mn%/Fe%
  assays at depth intervals)
- No site is currently documented as having drillhole trajectory,
  assay-by-depth-interval, lithology-by-depth, or structural (fault/shear)
  data in a form usable for a volumetric model

**This means Stage 4 is currently blocked on data availability, not on
modeling capability.** The published precedent your uploaded report cites
(the 2026 iron-grade study: 632 composited intervals from 43 drillholes,
GNN R²=0.72 vs Ordinary Kriging R²=0.67) required exactly this kind of
dense drillhole network — a scale of subsurface data MOIL's publicly
available MCDR/geoscience layers do not currently provide for your three
mine sites.

**Correct framing for your pitch:** present Stage 4 as the **documented
future direction**, explicitly contingent on MOIL providing or granting
access to drillhole/assay data (a reasonable ask, since MOIL as the problem
owner likely holds this internally even if it isn't in your current public
data package). Do not attempt to simulate or interpolate synthetic drillhole
data to make this stage demoable now — that would fabricate exactly the
kind of false subsurface precision your project's own data-integrity
principles already warn against for 2D data, and the stakes are higher for
a 3D resource claim.

**If/when real drillhole data becomes available**, the pipeline would be:
- Nodes = composited depth intervals along each drillhole
- Edges = 3D spatial adjacency (k-NN in 3D space, or along-hole +
  cross-hole connections) plus geological-domain edges (same lithology/
  gondite boundary)
- Node features = Mn%/Fe%/SiO₂ assay values, interval length, density
- Benchmark target = Ordinary Kriging on the **same** drillhole set (not a
  different one) — this is the comparison your uploaded report correctly
  insists on ("3D GNN versus established geostatistical baselines under the
  same validation scheme," not "GNN replaces geology")
- Output = grade/continuity/uncertainty estimates feeding the existing
  Resource → Accessible → Recoverable funnel, as an additional input layer
  rather than a replacement for the funnel's existing logic

---

## 6. Where this plugs into the platform (Feature 1 — Prospectivity)

- The GNN output is surfaced as an **alternative, clearly-labeled research
  track** alongside the existing Random Forest baseline in the
  Prospectivity view — e.g. a toggle or side-by-side comparison panel
  ("Baseline Model" vs "Graph-Based Research Model"), not a silent swap.
  This is actually a stronger demo moment than a quiet replacement: it shows
  judges your team understands the difference between a production-ready
  baseline and an active research direction, which is exactly the maturity
  signal domain-expert judges respond to.
- **Serving isolation rule still applies unchanged**: GNN outputs are
  filtered by `site_id` exactly like the baseline's outputs — no site's GNN
  predictions are ever shown on another site's page, and the same
  automated zero-overlap test already planned for the baseline should be
  extended to cover the GNN outputs too.
- **No-silent-fallback rule still applies**: if a site's GNN artifact fails
  to load, show an explicit "research model unavailable for this site"
  state — never silently fall back to showing the baseline's numbers
  relabeled as the GNN's.

---

## 7. Summary roadmap (matches your uploaded report's structure, now with your project's specific constraints folded in)

| Stage | What | Gate to proceed to next stage |
|---|---|---|
| 0 | Restore real datasets, re-run RF/LogReg/SVM/LightGBM baseline | Verified, non-provisional metrics logged |
| 1 | Construct per-site k-NN spatial graphs on existing pooled features | Graph construction passes the zero-cross-site-leakage check |
| 2 | PU learning formulation, evaluated separately | Documented as its own result, not blended into supervised numbers |
| 3a | GCN/GraphSAGE baseline via PyTorch Geometric | Beats Stage 0 baseline on AUPRC, or is honestly reported as not doing so |
| 3b | GAT | Only pursued if 3a shows promise |
| 3c | Heterogeneous GNN (per-site node/edge types, no imputed layers) | Only pursued if 3b shows promise |
| 4 | 3D Geological GNN | **Blocked pending real drillhole/assay data from MOIL** — documented as future work, not built on synthetic placeholders |

**One sentence for your pitch deck, if you want it verbatim:** *"Our current
Random Forest baseline remains the production model; we're actively
researching whether explicit graph-based spatial modeling (GNN/GAT) can
improve on it, evaluated on identical data splits, with a clearly scoped,
data-dependent path toward 3D subsurface modeling once drillhole access is
available."*
