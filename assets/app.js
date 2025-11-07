
/* FRESH v28 – Static demo store with shared filters + CSV export + simple charts */
const Store = {
  key:'fresh_v28_store',
  seed(){
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const regions = ['القاهرة','الجيزة','الإسكندرية','الدلتا','الصعيد'];
    const branches = ['Cairo HQ','Giza','Alex','Tanta','Assiut'];
    const devices = ['Refrigerator','Deep Freezer','Water Dispenser','Mini Bar'];
    const models = [
      {id:'REF-370', device:'Refrigerator', name:'REF 370 Digital'},
      {id:'REF-300', device:'Refrigerator', name:'REF 300 Mech'},
      {id:'DFZ-200', device:'Deep Freezer', name:'DFZ 200 Upright'},
      {id:'WDS-2T', device:'Water Dispenser', name:'WDS Two Tap'},
      {id:'MB-50', device:'Mini Bar', name:'Mini Bar 50L'}
    ];
    // sample tickets
    let id=1000; const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    const tickets = Array.from({length:120},()=>{
      const region = regions[rand(0,regions.length-1)];
      const branch = branches[rand(0,branches.length-1)];
      const device = devices[rand(0,devices.length-1)];
      const model = models.filter(m=>m.device===device)[0]?.id || 'N/A';
      const daysAgo = rand(0,14);
      const created = new Date(Date.now()-daysAgo*86400000);
      const statusPool = ['new','scheduled','onroute','inprogress','done'];
      const status = daysAgo>7? (rand(0,1)?'inprogress':'scheduled') : statusPool[rand(0,statusPool.length-1)];
      const csat = status==='done'? rand(70,98): null;
      return {
        id:id++,
        region, branch, device, model,
        created: created.toISOString().slice(0,10),
        csat, onTime: rand(0,1)===1, revisit: rand(0,9)===0,
        partsCost: rand(0,1)? rand(150,1200):0,
        status
      }
    });
    const parts = [
      {code:'CMP-01', name:'Compressor', stock:18, price:2200},
      {code:'FAN-10', name:'Fan Motor', stock:60, price:240},
      {code:'VAL-33', name:'Valve', stock:120, price:90},
      {code:'CRT-07', name:'Control Board', stock:9, price:1450},
    ];
    const techs = [
      {id:'T-100',name:'Ahmed Reda',skills:['Refrigerator','Deep Freezer'],branch:'Cairo HQ'},
      {id:'T-101',name:'Mina F.',skills:['Water Dispenser','Mini Bar'],branch:'Cairo HQ'},
      {id:'T-102',name:'Samir Adel',skills:['Refrigerator'],branch:'Giza'},
    ];
    return {today, regions, branches, devices, models, tickets, parts, techs, users:[{u:'admin',role:'admin'}]};
  },
  load(){
    const raw = localStorage.getItem(this.key);
    if(!raw){ const d=this.seed(); localStorage.setItem(this.key, JSON.stringify(d)); return d; }
    try{ return JSON.parse(raw);}catch{ const d=this.seed(); localStorage.setItem(this.key, JSON.stringify(d)); return d; }
  },
  save(d){ localStorage.setItem(this.key, JSON.stringify(d)); },
  reset(){ localStorage.removeItem(this.key); location.reload(); }
};

const Data = Store.load();

// filters
const Filters = {
  state:{region:'',branch:'',device:'',from:'',to:''},
  bind(root=document){
    ['region','branch','device'].forEach(k=>{
      const el = root.querySelector(`[data-filter=${k}]`);
      if(!el) return;
      el.innerHTML = `<option value="">All ${k}</option>` + (Data[(k==='region'? 'regions': (k==='device'?'devices':'branches'))]||[]).map(v=>`<option>${v}</option>`).join('');
      el.value = this.state[k]||'';
      el.onchange = e=>{this.state[k]=e.target.value; this.onchange&&this.onchange();}
    });
    ['from','to'].forEach(k=>{
      const el=root.querySelector(`[data-filter=${k}]`);
      if(el){ el.value=this.state[k]||''; el.onchange=e=>{this.state[k]=e.target.value; this.onchange&&this.onchange();}; }
    });
    const apply=root.querySelector('[data-action=apply]'); if(apply){apply.onclick=()=>this.onchange&&this.onchange();}
    const reset=root.querySelector('[data-action=reset]'); if(reset){reset.onclick=()=>{this.state={region:'',branch:'',device:'',from:'',to:''}; this.bind(root); this.onchange&&this.onchange();};}
  },
  pass(t){
    const s=this.state; if(s.region && t.region!==s.region) return false;
    if(s.branch && t.branch!==s.branch) return false;
    if(s.device && t.device!==s.device) return false;
    if(s.from && t.created < s.from) return false;
    if(s.to && t.created > s.to) return false;
    return true;
  }
};

// utils
function $(sel,root=document){return root.querySelector(sel)}
function $all(sel,root=document){return [...root.querySelectorAll(sel)]}
function fmt(n){return new Intl.NumberFormat('en').format(n)}
function percent(a,b){return b? Math.round((a/b)*100):0}
function csv(rows){
  const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  return rows.map(r=>Object.values(r).map(esc).join(',')).join('\n');
}
function download(name,content){
  const blob=new Blob([content],{type:'text/csv'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
}

// tiny canvas bar chart
function barChart(canvas, series, labels){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth;
  const H = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,W,H);
  const max = Math.max(...series,1);
  const bw = Math.max(10, (W-40)/series.length - 10);
  series.forEach((v,i)=>{
    const x = 30 + i*(bw+10);
    const h = (H-40)*(v/max);
    const y = H-20 - h;
    ctx.fillStyle = ['#ef4444','#3b82f6','#10b981','#f59e0b','#a855f7'][i%5];
    ctx.fillRect(x,y,bw,h);
    ctx.fillStyle='#94a3b8'; ctx.font='11px Inter';
    ctx.fillText(labels[i]||'', x, H-6);
  });
}

// views
const Views = {
  dashboard(root){
    Filters.onchange=_=>Views.dashboard(root);
    Filters.bind(root);
    const list = Data.tickets.filter(t=>Filters.pass(t));
    const done = list.filter(t=>t.status==='done');
    const csatAvg = Math.round(done.reduce((a,b)=>a+(b.csat||0),0)/Math.max(done.length,1));
    const ontime = percent(list.filter(t=>t.onTime).length, list.length);
    const revisit = percent(list.filter(t=>t.revisit).length, list.length);
    const kpi = (id,val)=> root.querySelector(`[data-kpi=${id}]`).innerText = isNaN(val)?'0':val;
    kpi('csat', csatAvg); kpi('ontime', ontime+'%'); kpi('revisit', revisit+'%'); kpi('tickets', fmt(list.length));
    // charts
    const by = (key)=>{
      const map={}; list.forEach(t=> map[t[key]] = (map[t[key]]||0)+1 ); 
      const labels=Object.keys(map); const vals=labels.map(k=>map[k]);
      return {labels, vals};
    };
    const b1 = by('branch'); barChart(root.querySelector('#chartBranch'), b1.vals, b1.labels);
    const b2 = by('device'); barChart(root.querySelector('#chartDevice'), b2.vals, b2.labels);
    // aging table
    const aging = { '1d-0':{}, '3d-2':{}, '7d-4':{} };
    list.forEach(t=>{
      const age = (Date.now()-new Date(t.created))/86400000;
      const bucket = age<=1?'1d-0': age<=3?'3d-2':'7d-4';
      aging[bucket][t.device] = (aging[bucket][t.device]||0)+1;
    });
    const tbody = root.querySelector('#agingBody'); tbody.innerHTML='';
    Object.keys(aging['1d-0']).concat(Object.keys(aging['3d-2']),Object.keys(aging['7d-4'])).filter((v,i,a)=>a.indexOf(v)===i).forEach(dev=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${aging['7d-4'][dev]||0}</td><td>${aging['3d-2'][dev]||0}</td><td>${aging['1d-0'][dev]||0}</td><td>${dev}</td>`;
      tbody.appendChild(tr);
    });
    // export
    const exp = root.querySelector('[data-action=export]');
    if(exp) exp.onclick=()=>download('tickets.csv', csv([
      ["id","region","branch","device","model","created","status","csat","onTime","revisit","partsCost"],
      ...list.map(t=>t)
    ]));
  },
  reports(root){
    Filters.onchange=_=>Views.reports(root);
    Filters.bind(root);
    const list = Data.tickets.filter(t=>Filters.pass(t));
    // CSAT per Branch
    const by = (arr,key,val='count')=>{
      const map={};
      arr.forEach(t=>{
        const k=t[key]; if(!(k in map)) map[k]={count:0,csat:0,done:0,parts:0};
        map[k].count++; map[k].parts+=t.partsCost||0; if(t.csat){ map[k].csat += t.csat; map[k].done++; }
      });
      return Object.entries(map).map(([k,v])=>({key:k, ...v, csatAvg: v.done? Math.round(v.csat/v.done):0}));
    };
    const b = by(list,'branch');
    $('#tbl-branch tbody',root).innerHTML = b.map(r=>`<tr><td>${r.key}</td><td>${fmt(r.count)}</td><td>${r.csatAvg}%</td><td>${fmt(r.parts)}</td></tr>`).join('')||'<tr><td colspan=4>لا توجد بيانات</td></tr>';
    // CSAT per Device
    const d = by(list,'device');
    $('#tbl-device tbody',root).innerHTML = d.map(r=>`<tr><td>${r.key}</td><td>${fmt(r.count)}</td><td>${r.csatAvg}%</td><td>${fmt(r.parts)}</td></tr>`).join('');
    // Region Heat matrix (offline)
    const regs = Data.regions, devs = Data.devices;
    const matrix = regs.map(r=> devs.map(dev=> list.filter(t=>t.region===r && t.device===dev).length ));
    const heat = $('#heat',root); heat.innerHTML='';
    const max = Math.max(...matrix.flat(),1);
    const cell = (v)=>{
      const c = v/max; const col=`rgba(228,30,38, ${0.15+0.75*c})`;
      return `<td style="background:${col};text-align:center;border:1px solid #1f2937">${v}</td>`;
    }
    heat.innerHTML = `<tr><th></th>${devs.map(x=>`<th>${x}</th>`).join('')}</tr>` +
      regs.map((r,i)=>`<tr><th style="text-align:left">${r}</th>${matrix[i].map(cell).join('')}</tr>`).join('');
    // export
    const exp = root.querySelector('[data-action=export]');
    if(exp) exp.onclick=()=>download('report.csv', csv(b.map(r=>({Branch:r.key, Tickets:r.count, CSAT:r.csatAvg}))));
  },
  technician(root){
    Filters.onchange=_=>Views.technician(root);
    Filters.bind(root);
    const techSel = root.querySelector('#techSel');
    techSel.innerHTML = Data.techs.map(t=>`<option value="${t.id}">${t.name} (${t.branch})</option>`).join('');
    const t = Data.techs[0];
    const list = Data.tickets.filter(x=>Filters.pass(x) && (t.skills.includes(x.device)) );
    $('#techTickets',root).innerText=fmt(list.length);
  },
  admin(root){
    // add Branch/Device/Model
    const add = (id, cb)=>{
      const f = $(id,root);
      f.onsubmit = e=>{e.preventDefault(); const val=f.querySelector('input').value.trim(); if(!val) return;
        cb(val); Store.save(Data); alert('Saved'); location.reload();
      };
    };
    add('#formBranch', v=>Data.branches.push(v));
    add('#formDevice', v=>Data.devices.push(v));
    $('#resetDemo',root).onclick=()=>Store.reset();
  }
};

// router: auto-detect which view to bind
window.addEventListener('DOMContentLoaded',()=>{
  const root = document;
  const page = document.body.dataset.page || '';
  if(Views[page]) Views[page](root);
  // set active nav
  const here = location.pathname.split('/').slice(-2,-1)[0]; // folder name
  $all('.nav a').forEach(a=>{ if(a.href.includes('/'+here+'/')) a.classList.add('active'); });
});
