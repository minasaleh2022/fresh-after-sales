
// Data (demo)
window.FRESH = (function(){
  const regions = ["Cairo","Giza","Alex","Sharqia","Dakahlia","Qalyubia","Gharbia","Menoufia","Ismailia","Suez"];
  const deviceTypes = ["Fridge Digital","Fridge Mechanical","Deep Freezer V","Deep Freezer H","Mini Bar","Water Cooler"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // generate synthetic tickets and parts
  const rand = (a,b)=>Math.round(a+Math.random()*(b-a));
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  const tickets = Array.from({length:1200}).map((_,i)=>{
    const month = rand(0,11);
    const region = pick(regions);
    const device = pick(deviceTypes);
    const ontime = Math.random()>.18; // 82% on time
    const revisit = Math.random()<.14; // 14% revisit
    const csat = rand(70,98);
    const aging = rand(0,25);
    const branch = pick(["Branch A","Branch B","Branch C","Branch D"]);
    const tech = pick(["T-1001","T-1002","T-1012","T-1020","T-1050"]);
    return {id:i+1,month,region,device,ontime,revisit,csat,aging,branch,tech};
  });

  const parts = Array.from({length:300}).map((_,i)=>{
    const t = pick(tickets);
    const cost = rand(150,1800);
    const qty = rand(1,3);
    return {ticket:t.id,region:t.region,device:t.device,cost,qty,month:t.month,branch:t.branch};
  });

  function applyFilters(data, filters){
    return data.filter(r=>{
      if(filters.region && filters.region!=="All" && r.region!==filters.region) return false;
      if(filters.device && filters.device!=="All" && r.device!==filters.device) return false;
      if(filters.branch && filters.branch!=="All" && r.branch!==filters.branch) return false;
      if(filters.month && filters.month!=="All" && months[r.month]!==filters.month) return false;
      return true;
    });
  }

  function aggregateCSATBy(key, rows){
    const g = {};
    rows.forEach(r=>{
      const k = r[key]; g[k] ??= {sum:0,cnt:0};
      g[k].sum += r.csat; g[k].cnt++;
    });
    return Object.entries(g).map(([k,v])=>({name:k, value: +(v.sum/v.cnt).toFixed(1)}))
      .sort((a,b)=>a.name.localeCompare(b.name));
  }

  function pctOnTime(rows){
    const all = rows.length||1;
    const ok = rows.filter(r=>r.ontime).length;
    return +(ok/all*100).toFixed(1);
  }
  function pctRevisit(rows){
    const all = rows.length||1;
    const rv = rows.filter(r=>r.revisit).length;
    return +(rv/all*100).toFixed(1);
  }
  function agingBuckets(rows){
    const b = { "0-2d":0, "3-5d":0, "6-10d":0, "10d+":0 };
    rows.forEach(r=>{
      if(r.aging<=2) b["0-2d"]++; else if(r.aging<=5) b["3-5d"]++; else if(r.aging<=10) b["6-10d"]++; else b["10d+"]++;
    });
    return b;
  }
  function monthlyTrend(rows, fieldFn){
    const arr = Array(12).fill(0); const counts = Array(12).fill(0);
    rows.forEach(r=>{arr[r.month]+=fieldFn(r); counts[r.month]++});
    return arr.map((v,i)=> counts[i]? +(v/counts[i]).toFixed(1) : 0);
  }
  function partsCostBy(key, rows){
    const g={};
    rows.forEach(p=>{ const k=p[key]; g[k]=(g[k]||0)+p.cost*p.qty; });
    return Object.entries(g).map(([k,v])=>({name:k, value:+v.toFixed(0)}))
      .sort((a,b)=>b.value-a.value);
  }

  return {
    regions, deviceTypes, months, tickets, parts,
    applyFilters, aggregateCSATBy, pctOnTime, pctRevisit, agingBuckets,
    monthlyTrend, partsCostBy
  };
})();

// Chart helpers
function mkBar(ctx, labels, data, color="#E10600", label=""){
  return new Chart(ctx, {
    type:"bar",
    data:{ labels, datasets:[{label, data, backgroundColor: color}]},
    options:{responsive:true, plugins:{legend:{display:false}}}
  });
}
function mkLine(ctx, labels, data, color="#1e88e5", label=""){
  return new Chart(ctx, {
    type:"line",
    data:{ labels, datasets:[{label, data, fill:false, borderColor: color, tension:.2}]},
    options:{responsive:true, plugins:{legend:{display:false}}}
  });
}
function mkDoughnut(ctx, labels, data, colors){
  return new Chart(ctx, {
    type:"doughnut",
    data:{ labels, datasets:[{ data, backgroundColor: colors || ["#22c55e","#f59e0b","#ef4444","#475569"] }]},
    options:{responsive:true}
  });
}

// shared filters wiring
function readFilters(){
  const val = id => (document.getElementById(id)?.value || "All");
  return { region: val("f-region"), device: val("f-device"), branch: val("f-branch"), month: val("f-month") };
}
function fillFilterOptions(){
  const add = (id, arr)=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = `<option>All</option>` + arr.map(x=>`<option>${x}</option>`).join("");
  };
  add("f-region", FRESH.regions);
  add("f-device", FRESH.deviceTypes);
  add("f-branch", ["Branch A","Branch B","Branch C","Branch D"]);
  add("f-month", FRESH.months);
}
document.addEventListener("DOMContentLoaded", fillFilterOptions);
