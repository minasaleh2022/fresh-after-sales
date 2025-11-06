// Lightweight chart drawer (lines + bars) without external libs
function drawLineChart(canvasId, series, opts={}){
  const el = document.getElementById(canvasId);
  if(!el) return;
  const dpr = window.devicePixelRatio || 1;
  const w = el.clientWidth, h = el.clientHeight;
  const cvs = document.createElement('canvas');
  cvs.width = w*dpr; cvs.height = h*dpr; cvs.style.width=w+'px'; cvs.style.height=h+'px';
  const ctx = cvs.getContext('2d'); ctx.scale(dpr,dpr);
  el.innerHTML=''; el.appendChild(cvs);

  const pad=28, x0=pad, y0=pad, x1=w-pad, y1=h-pad;
  ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.rect(x0, y0, x1-x0, y1-y0); ctx.stroke();
  const maxY = Math.max(...series.map(s => Math.max(...s.data)), 10);
  const steps = series[0]?.data?.length || 1;

  // grid
  ctx.strokeStyle='#f3f4f6';
  for(let i=0;i<=4;i++){let y=y0+(y1-y0)*i/4; ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();}

  const colors = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6'];
  series.forEach((s,si)=>{
    ctx.strokeStyle = colors[si%colors.length]; ctx.lineWidth=2; ctx.beginPath();
    s.data.forEach((v,i)=>{
      const x = x0 + (x1-x0) * (i/(steps-1||1));
      const y = y1 - (v/maxY)*(y1-y0);
      i==0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.stroke();
  });
}
function drawBarChart(canvasId, data, opts={}){
  const el=document.getElementById(canvasId); if(!el) return;
  const dpr=window.devicePixelRatio||1, w=el.clientWidth, h=el.clientHeight;
  const cvs=document.createElement('canvas'); cvs.width=w*dpr; cvs.height=h*dpr; cvs.style.width=w+'px'; cvs.style.height=h+'px';
  const ctx=cvs.getContext('2d'); ctx.scale(dpr,dpr); el.innerHTML=''; el.appendChild(cvs);
  const pad=28,x0=pad,y0=pad,x1=w-pad,y1=h-pad;
  ctx.strokeStyle='#e5e7eb'; ctx.strokeRect(x0,y0,x1-x0,y1-y0);
  const maxY=Math.max(...data.map(d=>d.value),10); const bw=(x1-x0)/data.length*0.6;
  const colors=['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#06b6d4','#64748b'];
  data.forEach((d,i)=>{
    const x = x0 + (i+0.2)*(x1-x0)/data.length;
    const y = y1 - (d.value/maxY)*(y1-y0);
    ctx.fillStyle = colors[i%colors.length];
    ctx.fillRect(x, y, bw, y1-y);
  });
}
// Simple helpers
function setActiveNav(){
  document.querySelectorAll('.nav a').forEach(a=>{
    if(location.pathname.endsWith(a.getAttribute('href'))) a.classList.add('active');
  });
}
// Fake filters apply to regenerate charts with random numbers (demo)
function applyDemoCharts(){
  drawLineChart('trendChart',[{name:'SLA',data:[62,64,61,66,72,74,76,78,79,81,84,86]},{name:'CSAT',data:[70,72,71,74,75,77,79,82,84,85,87,88]}]);
  drawBarChart('deviceChart',[
    {label:'Refrigerators',value:120},
    {label:'Deep Freezer',value:86},
    {label:'Water Dispenser',value:64},
    {label:'Mini Bar',value:44},
    {label:'Washer',value:72}
  ]);
  drawBarChart('regionChart',[
    {label:'Cairo',value:96},{label:'Giza',value:84},{label:'Alex',value:72},{label:'Sharqia',value:60},{label:'Qalyubia',value:58},{label:'Dakahlia',value:55}
  ]);
}
document.addEventListener('DOMContentLoaded',()=>{ setActiveNav(); applyDemoCharts(); });
