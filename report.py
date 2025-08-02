import math
import yaml
from pathlib import Path

DATA_DIR = Path('building-structure')

with open(DATA_DIR / 'points.yml') as f:
    points = yaml.safe_load(f)['points']

def length(p1, p2):
    a, b = points[p1], points[p2]
    dx = a['x'] - b['x']
    dy = a['y'] - b['y']
    dz = a['z'] - b['z']
    return math.sqrt(dx*dx + dy*dy + dz*dz)

def summarize(file, key):
    with open(DATA_DIR / file) as f:
        data = yaml.safe_load(f)[key]
    rows = []
    for m in data:
        start = m.get('start_point') or m.get('start')
        end = m.get('end_point') or m.get('end')
        if start and end:
            span = length(start, end)
        else:
            span = None
        rows.append((m['id'], span))
    return rows

sections = {
    'hss_columns.yml': 'columns',
    'w_beams.yml': 'beams',
    'lvl_members.yml': 'lvl_members',
    'ridge_and_walls.yml': 'components'
}

if __name__ == '__main__':
    for file, key in sections.items():
        print(f'\n{file}')
        for mid, span in summarize(file, key):
            if span is not None:
                print(f"  {mid}: {span:.1f} in")
            else:
                print(f"  {mid}: n/a")
