# Structural Design Data

This directory stores a simplified dataset for the example building using YAML files. All coordinates are defined in `points.yml` and referenced by ID from each member file so that shared locations only need to be updated once.

## Files

- `points.yml` – master list of coordinate points.
- `hss_columns.yml` – hollow structural section columns.
- `w_beams.yml` – W-flange and LVL beams between columns.
- `lvl_members.yml` – alternative LVL framing members.
- `ridge_and_walls.yml` – ridge beam and load-bearing walls.
- `rafter_sets.yml` – rafter series defined by spacing and count.
- `roof_sections.yml` – roof sections with area and load path notes.
- `PARAMETERS.md` – dictionary of parameter names, types and units.
- `structural_layout.html` – visual layout based on the same data.

### Validation

JSON Schema files live in `schemas/` and can be used to ensure the YAML files
are well-formed. From the repository root run:

```bash
python validate.py
```

to validate `points.yml` and `hss_columns.yml` against their schemas.

### Report script

Run `python report.py` from the repository root to view a summary of members with derived lengths or heights computed from point coordinates.

The schema follows a consistent set of parameters (see `PARAMETERS.md`) so different member types share common field names where applicable.
