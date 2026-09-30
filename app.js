let course,view='home',selectedDay=1,bag=[],current=null;
let progress=JSON.parse(localStorage.getItem('jct-progress-v12')||'{"completed":[]}');
const $=x=>document.getElementById(x);
const screens=['home','lessons','lesson','review'];
function show(id){screens.forEach(x=>$(x).classList.toggle('hidden',x!==id));view=id;window.scrollTo(0,0)}
function save(){localStorage.setItem('jct-progress-v12',JSON.stringify(progress))}
function completed(d){return progress.completed.includes(d)}
function learned(){
 let map=new Map();
 course.lessons.filter(l=>completed(l.day)).forEach(l=>l.items.forEach(i=>map.set(i.reviewKey,i)));
 return [...map.values()]
}
function refreshHome(){
 let next=course.lessons.find(l=>!completed(l.day))||course.lessons.at(-1);
 $('continueTitle').textContent=`Day ${next.day} · ${next.title}`;$('continueSummary').textContent=next.summary;
 $('continueBtn').onclick=()=>openLesson(next.day);
 let n=learned().length;$('reviewCount').textContent=`${n} learned voicing${n===1?'':'s'} from completed days`;
}
function renderLessons(){
 $('lessonList').innerHTML='';
 course.lessons.forEach(l=>{let b=document.createElement('button');b.className='tile lessonRow';
 b.innerHTML=`<span class="dayNum">${l.day}</span><span><b>${l.title}</b><small>${l.summary}</small></span><span class="check">${completed(l.day)?'✓':'○'}</span>`;
 b.onclick=()=>openLesson(l.day);$('lessonList').appendChild(b)})
}
function openLesson(day){
 selectedDay=day;let l=course.lessons.find(x=>x.day===day);$('dayLabel').textContent=`DAY ${day} · ${completed(day)?'COMPLETED':'NOT COMPLETED'}`;
 $('lessonTitle').textContent=l.title;$('lessonSummary').textContent=l.summary;
 $('lessonInstructions').innerHTML='<h3>Today’s 33-minute session</h3>'+l.instructions.map(s=>`<div class="step"><b>${s.time} min</b><p>${s.text}</p></div>`).join('');
 $('lessonVoicings').innerHTML=l.items.length?'<h3>Today’s voicings</h3>':'<p class="muted">No new flashcard voicings are introduced on this day.</p>';
 l.items.forEach(i=>{let d=document.createElement('div');d.className='voicing';d.innerHTML=`<b>${i.symbol} · ${i.label}</b><small>LH ${i.lh.join('–')} · RH ${i.rh.join('–')}</small>`;$('lessonVoicings').appendChild(d)});
 let h=l.handSeparation;$('handSeparation').innerHTML=`<h3>Hand separation · ${h.stage}</h3><div class="handbox"><small>${h.base}</small><p>${h.text}</p></div>`;
 $('completeBtn').textContent=completed(day)?'Mark as Not Complete':'Mark Day Complete';show('lesson')
}
function toggleComplete(){
 let i=progress.completed.indexOf(selectedDay); if(i>=0)progress.completed.splice(i,1); else progress.completed.push(selectedDay);
 progress.completed.sort((a,b)=>a-b);save();refreshHome();renderLessons();openLesson(selectedDay)
}
function shuffle(a){for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startReview(){
 let pool=learned();if(!pool.length){$('prompt').textContent='No cards yet';$('promptLabel').textContent='Mark at least one lesson complete first.';$('nextBtn').disabled=true;$('revealBtn').disabled=true;show('review');return}
 $('nextBtn').disabled=false;bag=[];current=null;$('prompt').textContent='Tap Start';$('promptLabel').textContent=`${pool.length} learned voicings`;$('nextBtn').textContent='Start';$('reveal').classList.add('invisible');show('review')
}
function nextCard(){
 let pool=learned();if(!bag.length){bag=shuffle([...pool]);if(current&&bag.length>1&&bag[0].reviewKey===current.reviewKey)[bag[0],bag[1]]=[bag[1],bag[0]]}
 current=bag.shift();$('prompt').textContent=current.symbol;$('promptLabel').textContent=current.label;$('counter').textContent=`All Learned · ${pool.length} cards`;
 $('reveal').classList.add('invisible');$('revealBtn').disabled=false;$('nextBtn').textContent='Next'
}
function reveal(){$('lh').textContent=current.lh.join(' – ');$('rh').textContent=current.rh.join(' – ');$('reveal').classList.remove('invisible')}
async function init(){
 course=await fetch('curriculum.json?v=1.3a').then(r=>r.json());refreshHome();renderLessons();
 $('lessonsBtn').onclick=()=>{renderLessons();show('lessons')};$('reviewBtn').onclick=startReview;$('completeBtn').onclick=toggleComplete;
 $('backLessons').onclick=()=>{renderLessons();show('lessons')};$('backHome').onclick=()=>{refreshHome();show('home')};$('homeBtn').onclick=()=>{refreshHome();show('home')};
 $('nextBtn').onclick=nextCard;$('revealBtn').onclick=reveal;
 if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js')
}init();