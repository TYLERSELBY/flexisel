// Interactive structural editor
let data = {points:{}, columns:[], beams:[], components:[], rafter_sets:[]};
let changeLog = [];
let svg, panel, panelText, panelTitle;
let current = null;
let scale=1, minX=0, maxY=0;

async function loadYAML(url){
  const res = await fetch(url);
  const txt = await res.text();
  return jsyaml.load(txt);
}

async function init(){
  const [p,c,b,comp,r] = await Promise.all([
    loadYAML('points.yml'),
    loadYAML('hss_columns.yml'),
    loadYAML('w_beams.yml'),
    loadYAML('ridge_and_walls.yml'),
    loadYAML('rafter_sets.yml')
  ]);
  data.points = p.points;
  data.columns = c.columns;
  data.beams = b.beams;
  data.components = comp.components;
  data.rafter_sets = r.rafter_sets;
  prepare();
}

function prepare(){
  svg = document.getElementById('diagram');
  panel = document.getElementById('panel');
  panelText = document.getElementById('panelText');
  panelTitle = document.getElementById('panelTitle');
  document.getElementById('saveBtn').onclick = saveMember;
  document.getElementById('closeBtn').onclick = ()=> panel.style.display='none';
  document.getElementById('exportDesign').onclick = ()=>
    download(JSON.stringify(data,null,2),'design.json');
  document.getElementById('exportLog').onclick = ()=>
    download(JSON.stringify(changeLog,null,2),'change-log.json');
  document.getElementById('importBtn').onclick = ()=>
    document.getElementById('importInput').click();
  document.getElementById('importInput').onchange = importDesign;
  computeScale();
  draw();
}

function computeScale(){
  const pts = Object.values(data.points);
  const xs = pts.map(p=>p.x);
  const ys = pts.map(p=>p.y);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxYVal = Math.max(...ys);
  minX = Math.min(...xs);
  maxY = maxYVal;
  const width = maxX - minX;
  const height = maxYVal - minY;
  const w = svg.clientWidth - 40;
  const h = svg.clientHeight - 40;
  scale = Math.min(w/width, h/height);
}

function toScreen(pt){
  return {
    x:(pt.x - minX)*scale + 20,
    y:(maxY - pt.y)*scale + 20
  };
}

function draw(){
  while(svg.firstChild) svg.removeChild(svg.firstChild);
  drawRafterSets();
  drawBeams();
  drawComponents();
  drawColumns();
}

function drawColumns(){
  data.columns.forEach(col=>{
    const start = data.points[col.start_point];
    const end = data.points[col.end_point];
    const sPt = toScreen(start);
    const heightIn = Math.sqrt(Math.pow(end.x-start.x,2)+Math.pow(end.y-start.y,2)+Math.pow(end.z-start.z,2));
    col.calculated = {height_in: Number(heightIn.toFixed(1))};
    const circle = createSVG('circle',{cx:sPt.x, cy:sPt.y, r:6, fill:'#e74c3c', 'data-id':col.id, 'data-type':'columns', class:'member'});
    svg.appendChild(circle);
  });
}

function drawBeams(){
  data.beams.forEach(beam=>{
    const s = toScreen(data.points[beam.start_point]);
    const e = toScreen(data.points[beam.end_point]);
    const load = beam.loads?.uniform_plf || 0; // plf
    const lengthIn = Math.hypot(e.x - s.x, e.y - s.y) / scale; // inches
    const lengthFt = lengthIn / 12;
    const maxMoment = load * Math.pow(lengthFt,2) / 8;
    const maxShear = load * lengthFt / 2;
    beam.calculated = {length_in: Number(lengthIn.toFixed(1)), max_moment_lbft: Number(maxMoment.toFixed(0)), max_shear_lb: Number(maxShear.toFixed(0))};
    const color = load>2000? '#e74c3c': load>1500? '#f1c40f':'#3498db';
    const line = createSVG('line',{x1:s.x,y1:s.y,x2:e.x,y2:e.y,stroke:color,'stroke-width':3,'data-id':beam.id,'data-type':'beams', class:'member'});
    svg.appendChild(line);
    const label = createSVG('text',{x:(s.x+e.x)/2, y:(s.y+e.y)/2 -4, 'font-size':10, fill:'#2980b9'});
    label.textContent = `${beam.id} M=${beam.calculated.max_moment_lbft}`;
    svg.appendChild(label);
  });
}

function drawComponents(){
  data.components.forEach(comp=>{
    const start = data.points[comp.start_point];
    const end = data.points[comp.end_point];
    const s = toScreen(start);
    const e = toScreen(end);
    const lengthIn = Math.sqrt(Math.pow(end.x-start.x,2)+Math.pow(end.y-start.y,2)+Math.pow(end.z-start.z,2));
    comp.calculated = {length_in: Number(lengthIn.toFixed(1))};
    let color = '#9b59b6';
    if(comp.type && comp.type.includes('wall')) color = '#34495e';
    const line = createSVG('line',{x1:s.x,y1:s.y,x2:e.x,y2:e.y,stroke:color,'stroke-width':4,'data-id':comp.id,'data-type':'components', class:'member'});
    svg.appendChild(line);
  });
}

function drawRafterSets(){
  data.rafter_sets.forEach(rs=>{
    const startLine = getMemberLine(rs.start_member);
    const endLine = getMemberLine(rs.end_member);
    if(!startLine || !endLine) return;
    const pts = [startLine.start, startLine.end, endLine.end, endLine.start];
    const pointsStr = pts.map(p=>`${p.x},${p.y}`).join(' ');
    const area = Math.abs(polygonArea(pts))/144; // square feet
    rs.calculated = {area_sf: Number(area.toFixed(1))};
    const poly = createSVG('polygon',{points:pointsStr, fill:'#95a5a6', 'fill-opacity':0.3, stroke:'#7f8c8d', 'data-id':rs.id, 'data-type':'rafter_sets', class:'member'});
    svg.appendChild(poly);
    const reaction = rs.loads?.point_lb ? rs.loads.point_lb/2 : 0;
    const label = createSVG('text',{x:(pts[0].x+pts[1].x)/2, y:(pts[0].y+pts[1].y)/2 -5, 'font-size':10, fill:'#2c3e50'});
    label.textContent = `${rs.size} @ ${rs.spacing_in}" -> ${reaction} lb`;
    svg.appendChild(label);
  });
}

function getMemberLine(id){
  const arrs = [data.beams, data.components, data.columns];
  for(const arr of arrs){
    const m = arr.find(x=>x.id===id);
    if(m){
      const s = toScreen(data.points[m.start_point]);
      const e = toScreen(data.points[m.end_point]);
      return {start:s,end:e};
    }
  }
  return null;
}

function createSVG(name, attrs){
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for(const k in attrs){
    el.setAttribute(k, attrs[k]);
  }
  return el;
}

function polygonArea(pts){
  let area = 0;
  for(let i=0;i<pts.length;i++){
    const j = (i+1)%pts.length;
    area += pts[i].x*pts[j].y - pts[j].x*pts[i].y;
  }
  return area/2;
}

const svgClick = (e)=>{
  const target = e.target;
  const id = target.getAttribute('data-id');
  const type = target.getAttribute('data-type');
  if(!id) return;
  current = {id, type};
  const obj = getMember(type,id);
  panelTitle.textContent = `${id}`;
  panelText.value = JSON.stringify(obj,null,2);
  panel.style.display='block';
};

function getMember(type,id){
  const arr = data[type];
  return arr.find(m=>m.id===id);
}

function saveMember(){
  try {
    const newObj = JSON.parse(panelText.value);
    const arr = data[current.type];
    const idx = arr.findIndex(m=>m.id===current.id);
    const oldObj = arr[idx];
    arr[idx] = newObj;
    changeLog.push({timestamp:new Date().toISOString(), id:current.id, type:current.type, before:oldObj, after:newObj});
    panel.style.display='none';
    computeScale();
    draw();
  } catch(err){
    alert('Invalid JSON');
  }
}

function download(content, name){
  const blob = new Blob([content], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function importDesign(evt){
  const file = evt.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    data = JSON.parse(reader.result);
    changeLog = [];
    computeScale();
    draw();
  };
  reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', init);
document.getElementById('diagram').addEventListener('click', svgClick);
