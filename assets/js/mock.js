
window.Mock = {
  devices:['ثلاجة ديچيتال','ثلاجة ميكانيكال','ديب فريزر رأسي','ديب فريزر أفقي','ميني بار','مبرد مياه'],
  branches:['القاهرة','الجيزة','الإسكندرية','الدلتا','الصعيد'],
  regions:['القاهرة الكبرى','الإسكندرية والساحل','الدلتا','القناة','الصعيد'],
  techs: Array.from({length:30}, (_,i)=>`فني ${i+1}`),
  months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  between(a,b){ return a + Math.floor(Math.random()*(b-a+1)); },
  csatSeries(){ return this.months.map(m=>({month:m, value: 70 + Math.round(Math.random()*25)})); },
  inv(){ return Array.from({length:60}).map((_,i)=>({code:`SP-${1000+i}`, name:`قطعة ${i+1}`, stock:this.between(0,300), min:this.between(20,60), device:this.devices[this.between(0,5)], wh:['رئيسي','قاهرة','إسكندرية','صعيد'][this.between(0,3)]})); },
  tickets(){ return Array.from({length:40}).map((_,i)=>({tk:`TK-${10000+i}`, device:this.devices[this.between(0,5)], region:this.regions[this.between(0,4)], days:this.between(0,18), status:['Open','Scheduled','In Progress','Completed'][this.between(0,3)]})); }
};
