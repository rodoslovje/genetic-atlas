# STATUS — genetic-atlas

_Updated 2026-10-01_

Slovenski genetski atlas (FTDNA Slovenian Origin). Rules: `CLAUDE.md` — every user-visible change updates the User Guide and Changelog in the same change.
Last work: **Ancient connections** — an opt-in layer of excavated burials on the map and both lineage views (1. 10.), on top of the Block Tree and the Guide/Changelog pages (16. 9.).

**State of ancient connections**

- Collected for both lineages: 2,839 Y burials (870/874 nodes read) and 3,631 mtDNA ones (585/608), in `slo-{y,mt}dna-ancient.json`. Re-run `ftdna-get-paths.py --mode ancient` after each data refresh; any other run collects what it sees.
- Map: diamonds (Y) and rings (mt) at the dig site, era-coloured, nudged apart where one burial appears in both lineages. Tree: an italic ⚱ leaf on the branch where the line joins. Block tree: a column ending at the year of death.
- The sidebar count reports what the open view actually drew, which is less than the lineage holds when a branch is collapsed or a block tree starts below the joining branch.

**Next**

- [ ] Review the SL/HR/DE/IT/FR/HU wording of the new guide section and changelog entry (written by Claude, not reviewed)
- [ ] Commit the working tree (ancient layer + "Show only matches"); nothing is committed since 6751a14
- [ ] Refresh data after new Big Y results (Sedej, Velikonja upgrades)
- [ ] Consider a per-block cap for branches with many burials (R-Z280 has 27 of its own)

**Decided**

- English is the source of record for i18n, guide and changelog; 7 languages
- URL holds the view state (`anc=1` for the ancient layer, `qonly=1` for "Show only matches")
- A burial is kept only when FTDNA gives it both a branch (`haplogroup_mrca`) and coordinates; it is drawn on the deepest MRCA seen for it, never on a guessed node
- Ancient burials never open a branch that members alone would not fill
- A search highlights rather than filters; "Show only matches" narrows, and then a surname search also keeps the burials on that family's branches
- `.ftdna-session.json` and `data/` never committed
- Do not run `npm run format` — the repo is not prettier-clean and it reformats every file
