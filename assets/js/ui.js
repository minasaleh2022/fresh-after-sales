
window.UI = {
  makeFilters(containerId){
    const el = document.getElementById(containerId);
    el.innerHTML = `
      <div class="filters">
        <div class="field"><label class="small">من تاريخ</label><input type="date" id="fFrom"></div>
        <div class="field"><label class="small">إلى تاريخ</label><input type="date" id="fTo"></div>
        <div class="field"><label class="small">المنطقة</label>
          <select id="fRegion"><option value="">الكل</option>${Mock.regions.map(r=>`<option>${r}</option>`).join('')}</select></div>
        <div class="field"><label class="small">الفرع</label>
          <select id="fBranch"><option value="">الكل</option>${Mock.branches.map(b=>`<option>${b}</option>`).join('')}</select></div>
        <div class="field"><label class="small">الجهاز</label>
          <select id="fDevice"><option value="">الكل</option>${Mock.devices.map(d=>`<option>${d}</option>`).join('')}</select></div>
        <div class="field"><label class="small">الفني</label>
          <select id="fTech"><option value="">الكل</option>${Mock.techs.map(t=>`<option>${t}</option>`).join('')}</select></div>
        <div class="field" style="align-self:end"><button class="btn" id="fApply">تطبيق الفلاتر</button></div>
      </div>
    `;
    return {
      onApply(cb){
        document.getElementById('fApply').addEventListener('click', ()=>{
          cb({
            from: document.getElementById('fFrom').value,
            to: document.getElementById('fTo').value,
            region: document.getElementById('fRegion').value,
            branch: document.getElementById('fBranch').value,
            device: document.getElementById('fDevice').value,
            tech: document.getElementById('fTech').value
          });
        });
      }
    };
  }
};
