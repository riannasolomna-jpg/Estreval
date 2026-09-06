const CATEGORIES=[
 ['01','Мода',['Центральный модельный Дом','Модельный Дом-банкрот','Авангардный модельный Дом']],
 ['02','Искусство и культура',['Павильон искусств','Городской театр','Главный кинотеатр','Городской музей','Дом творчества','Частная арт-галерея','Фотостудия','Аукционный зал']],
 ['03','СМИ',['Дом журналистов']],
 ['04','Правопорядок',['Городской комиссариат','Сыскное бюро','Бригада по делам искусства']],
 ['05','Бары и клубы',['Джазовый клуб','Богемный бар','ЛГБТК+ клуб','Элитный клуб','Старый городской бар']],
 ['06','Подполье',['Закрытое общество коллекционеров','Чёрный рынок','Чёрные аукционы','Подпольные помещения']],
 ['07','Отели светские',['Роскошный городской отель','Отель для приезжих']],
 ['08','Город',['Модный рынок','Старый вокзал']],
 ['09','Прочее',[]]
];
let posts=[];let activeCategory='Все';
const $=s=>document.querySelector(s);
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function renderCategories(){
 $('#categoryGrid').innerHTML='<div class="cat active" data-cat="Все"><span class="cat-num">00</span><h3>Весь город</h3><span>Все локации</span></div>'+CATEGORIES.map(([n,name,places])=>`<div class="cat" data-cat="${esc(name)}"><span class="cat-num">${n}</span><h3>${esc(name)}</h3><span>${places.length||'—'} объектов</span></div>`).join('');
 document.querySelectorAll('.cat').forEach(el=>el.onclick=()=>{activeCategory=el.dataset.cat;document.querySelectorAll('.cat').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderPlaces()});
}
function renderPlaces(){
 let items=posts.filter(p=>(p.section||'place')==='place');
 if(activeCategory!=='Все')items=items.filter(p=>p.category===activeCategory);
 $('#placeList').innerHTML=items.map((p,i)=>`<article class="place" data-id="${esc(p.id)}"><span class="place-no">${String(i+1).padStart(2,'0')}</span><div><h4>${esc(p.title)}</h4><small>${esc(p.category||'Прочее')}</small></div><span class="place-arrow">↗</span></article>`).join('')||'<p class="section-note">В этом разделе пока нет локаций.</p>';
 document.querySelectorAll('.place').forEach(el=>el.onclick=()=>openPost(el.dataset.id));
}
function renderEclat(){
 const items=posts.filter(p=>p.section==='eclat');
 $('#eclat-feed').innerHTML=items.slice(0,12).map((p,i)=>`<article class="article" data-id="${esc(p.id)}"><div><span class="article-tag">${esc(p.category||'ECLAT')}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt||'')}</p></div><span class="article-date">${p.created_at?new Date(p.created_at.replace(' ','T')+'Z').toLocaleDateString('ru-RU'):''}</span></article>`).join('')||'<p class="section-note">Публикаций пока нет.</p>';
 document.querySelectorAll('.article[data-id]').forEach(el=>el.onclick=()=>openPost(el.dataset.id));
}
function openPost(id){
 const p=posts.find(x=>x.id===id);if(!p)return;
 let body=(p.blocks||[]).map(b=>b.type==='quote'?`<blockquote>${esc(b.text)}</blockquote>`:b.type==='image'?`<div class="modal-meta">IMAGE</div>`:`<p>${esc(b.text||'')}</p>`).join('');
 $('#modalContent').innerHTML=`<div class="eyebrow">${esc(p.category||'ESTREVAL')}</div><h2>${esc(p.title)}</h2><div class="modal-meta">${esc(p.section==='eclat'?'ECLAT ÉDITIONS':'CITY ARCHIVE')}</div>${p.excerpt?`<p>${esc(p.excerpt)}</p>`:''}${body}`;
 $('#modal').classList.add('open');
}
async function load(){
 try{
   const r=await fetch('/api/posts');
   if(r.ok)posts=await r.json();
 }catch(e){posts=[]}
 renderCategories();renderPlaces();renderEclat();
}
$('#menuBtn').onclick=()=>$('#drawer').classList.add('open');
$('#drawerClose').onclick=()=>$('#drawer').classList.remove('open');
$('#searchBtn').onclick=()=>{$('#searchPanel').classList.toggle('open');if($('#searchPanel').classList.contains('open'))$('#searchInput').focus()};
$('#modalClose').onclick=()=>$('#modal').classList.remove('open');
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('open')};
$('#searchInput').oninput=e=>{
 const q=e.target.value.toLowerCase().trim();
 if(!q){$('#searchResults').innerHTML='';return}
 const all=posts.filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).filter(p=>`${p.title} ${p.category} ${p.excerpt}`.toLowerCase().includes(q)).slice(0,8);
 $('#searchResults').innerHTML=all.map(p=>`<div class="search-result" data-id="${esc(p.id)}"><b>${esc(p.title)}</b> · ${esc(p.category||'')}</div>`).join('')||'<div class="search-result">Ничего не найдено.</div>';
 document.querySelectorAll('.search-result[data-id]').forEach(x=>x.onclick=()=>{openPost(x.dataset.id);$('#searchPanel').classList.remove('open')});
};
load();
