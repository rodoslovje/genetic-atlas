# STATUS — genetic-atlas

_Updated 2026-10-24_

Slovenski genetski atlas (FTDNA Slovenian Origin). Rules: `CLAUDE.md` — every user-visible change updates the User Guide and Changelog in the same change.
Last work: **Private variants** in the block tree (24. 10.) — each member's card sits on the date line at their earliest ancestor's birth year, under a dashed block of private variants; plus century gridlines and a hideable tree minimap. Before that: ancient connections (1. 10.).

**State of private variants**

- Y-DNA: `tools/ftdna-get-private-variants.py` downloads each Big Y kit's list through the admin session into `data/input/slo-big-y-private.json` (81/82 kits; members with Limited/Advanced access). A login lasts ~1 hour, so run it right after `ftdna-login.py`.
- mtDNA: computed in `ftdna-csv-to-json.py` from the full-sequence export minus the haplogroup's path (101 kits); unstable Mitotree positions are filtered. Re-run the converter after `ftdna-get-paths.py` when new haplogroups arrive.
- Card year: earliest 4-digit year in the ancestor text; none → 1900, so members see the year is missing and add it. An ancestor dated before the branch keeps the card at the top with a short private-variants box.

**State of ancient connections**

- Collected for both lineages: 2,839 Y burials (870/874 nodes read) and 3,631 mtDNA ones (585/608), in `slo-{y,mt}dna-ancient.json`. Re-run `ftdna-get-paths.py --mode ancient` after each data refresh; any other run collects what it sees.
- Map: diamonds (Y) and rings (mt) at the dig site, era-coloured, nudged apart where one burial appears in both lineages. Tree: an italic ⚱ leaf on the branch where the line joins. Block tree: a column ending at the year of death.
- The sidebar count reports what the open view actually drew, which is less than the lineage holds when a branch is collapsed or a block tree starts below the joining branch.

**Next**

- [ ] Review the SL/HR/DE/IT/FR/HU wording of the new guide section and changelog entry (written by Claude, not reviewed)
- [ ] Review the SL/HR/DE/IT/FR/HU wording of the private-variants and minimap guide/changelog text
- [ ] Compare a few Big Y counts with FTDNA's own Block Tree (the download may include calls the Block Tree leaves out)
- [ ] Refresh data after new Big Y results (Sedej, Velikonja upgrades) — `python tools/ftdna-update.py` now runs the whole pipeline, signing in when needed
- [ ] Consider a per-block cap for branches with many burials (R-Z280 has 27 of its own)

**Decided**

- English is the source of record for i18n, guide and changelog; 7 languages
- URL holds the view state (`anc=1` for the ancient layer, `qonly=1` for "Show only matches")
- A burial is kept only when FTDNA gives it both a branch (`haplogroup_mrca`) and coordinates; it is drawn on the deepest MRCA seen for it, never on a guessed node
- Ancient burials never open a branch that members alone would not fill
- A search highlights rather than filters; "Show only matches" narrows, and then a surname search also keeps the burials on that family's branches
- `.ftdna-session.json` and `data/` never committed
- Private variants are published as counts only; the positions stay in `data/input`
- Minimap visibility is one setting for both lineages, in the URL as `mm=0`
- Do not run `npm run format` — the repo is not prettier-clean and it reformats every file
