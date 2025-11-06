
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
function fillDemoTable(tbodyId, rows){
  const tb = document.getElementById(tbodyId);
  if(!tb) return;
  tb.innerHTML = rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('');
}
