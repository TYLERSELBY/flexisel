# Parameter Reference

All coordinates are in **inches** within a right-handed XYZ system.

| Parameter | Type | Units | Description |
|-----------|------|-------|-------------|
| `start_point`, `end_point` | string | n/a | Reference IDs from `points.yml` defining member endpoints |
| `size` | string | varies | Nominal member size (e.g., steel shape, lumber dimensions) |
| `loads.gravity_lb` | number | lb | Applied gravity load at the member |
| `loads.uplift_lb` | number | lb | Uplift load at the member |
| `loads.lateral_ew_lb` | number | lb | Lateral load in east-west direction |
| `loads.lateral_ns_lb` | number | lb | Lateral load in north-south direction |
| `loads.uniform_plf` | number | plf | Uniform line load along the member |
| `loads.point_lb` | number | lb | Concentrated load at connection points |
| `base_plate.size` | string | in | Base plate width × depth × thickness |
| `base_plate.edge_distance_in` | object | in | Edge distance from slab edges by direction |
| `supports` | array[string] | n/a | IDs of members or walls providing support |
| `connected_members` | array[string] | n/a | IDs of members directly connected |
| `spacing_in` | number | in | Center-to-center spacing for repeated members |
| `count` | integer | n/a | Number of repeated members in a set |
| `connection_detail` | string | n/a | Description of how members are connected |
