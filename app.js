
let library, set, bag=[], current=null, revealed=false, timer=null;
let prefs=JSON.parse(localStorage.getItem('jct-prefs')||'{"setId":"autumn-leaves-current","mode":"manual","seconds":5,"specific":false}');
let stats=JSON.parse(localStorage.getItem('jct-stats')||'{"seen":0,"clean":0,"reveals":0,"byItem":{}}');

const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem('jct-prefs',JSON.stringify(prefs));localStorage.setItem('jct-stats',JSON.stringify(stats));};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function refill(){bag=shuffle([...set.items]); if(current && bag.length>1 && bag[0].id===current.id)[bag[0],bag[1]]=[bag[1],bag[0]]}
function updateStats(){$('seenStat').textContent=stats.seen;$('cleanStat').textContent=stats.clean;$('revealStat').textContent=stats.reveals}
function showNext(){
  clearTimeout(timer);
  if(current && !revealed){stats.clean++; (stats.byItem[current.id]??={seen:0,reveals:0}).seen++}
  if(!bag.length) refill();
  current=bag.shift(); revealed=false; stats.seen++;
  $('prompt').textContent=current.symbol;
  $('subprompt').textContent=(prefs.specific && current.promptDetail)?current.promptDetail:'Play the learned voicing';
  $('revealPanel').classList.add('hidden'); $('revealBtn').disabled=false; $('nextBtn').textContent='Next';
  $('counter').textContent=`${set.name} · ${set.items.length-bag.length}/${set.items.length}`;
  updateStats();save();
  if(prefs.mode==='timed') timer=setTimeout(showNext,prefs.seconds*1000);
}
function reveal(){
  if(!current||revealed)return; revealed=true; stats.reveals++;
  let s=stats.byItem[current.id]??={seen:0,reveals:0}; s.reveals++; s.seen++;
  $('lhNotes').textContent=current.lh.length?current.lh.join(' – '):'—';
  $('rhNotes').textContent=current.rh.length?current.rh.join(' – '):'—';
  $('revealNote').textContent=current.note||'Notes are shown low → high within each hand.';
  $('revealPanel').classList.remove('hidden');updateStats();save();
}
function applySet(){
  set=library.sets.find(x=>x.id===prefs.setId)||library.sets[0]; prefs.setId=set.id; bag=[];current=null;
  $('setName').textContent=set.name;$('prompt').textContent='Tap Start';$('subprompt').textContent='Out-of-context chord recall';
  $('revealPanel').classList.add('hidden');$('revealBtn').disabled=true;$('nextBtn').textContent='Start';$('counter').textContent='Ready';save();
}
async function init(){
  library=await fetch('chord-library.json').then(r=>r.json());
  library.sets.forEach(s=>{let o=document.createElement('option');o.value=s.id;o.textContent=s.name;$('setSelect').appendChild(o)});
  $('setSelect').value=prefs.setId;$('modeSelect').value=prefs.mode;$('secondsSelect').value=String(prefs.seconds);$('specificPrompt').checked=prefs.specific;
  $('secondsRow').style.display=prefs.mode==='timed'?'block':'none';
  applySet();updateStats();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
}
$('nextBtn').onclick=showNext;$('revealBtn').onclick=reveal;$('settingsBtn').onclick=()=>$('settings').showModal();
$('modeSelect').onchange=()=>{$('secondsRow').style.display=$('modeSelect').value==='timed'?'block':'none'};
$('saveSettings').onclick=()=>{prefs={setId:$('setSelect').value,mode:$('modeSelect').value,seconds:Number($('secondsSelect').value),specific:$('specificPrompt').checked};clearTimeout(timer);applySet()};
init();
