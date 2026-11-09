/* 할머니의 타임캡슐 v2 — 화면 흐름 */
const KEY='econ-museum-v2-capsule';
const $=s=>document.querySelector(s);
function el(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstElementChild;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
function norm(s){return String(s||'').replace(/[\s·.,!?()（）'"]/g,'').toLowerCase();}
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function chosung(w){return [...w].map(c=>{const n=c.charCodeAt(0)-0xAC00;return n>=0&&n<11172?CHO[(n/588)|0]:c;}).join('');}

/* ---------- 저장 ---------- */
function fresh(){return {v:2,name:'',num:'',av:{skin:0,hair:0,style:0,shirt:1},at:{},sd:{},chDone:{},rd:{},wq:{},wl:{},wr:{},match:{labor:[],gap:[],waste:[]},sort:{},two:{},qz:{},
  debate:{role:'',idea:'',why:'',fix:'',rebut:false,done:false},ox:{},oxWrong:0,pieces:{},future:{word:'',why:''},climb:0,chest:false,capsule:false,free:false,started:''};}
let S=fresh();
try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw&&raw.v===2)S=Object.assign(fresh(),raw);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

/* ---------- 소리 ---------- */
let actx=null;
function ac(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();return actx;}catch(e){return null;}}
function tone(seq,type,vol){const c=ac();if(!c)return;let t=c.currentTime+.01;seq.forEach(([f,d])=>{const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.16,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05);t+=d*.8;});}
const sfx={ok:()=>tone([[660,.09],[880,.16]],'triangle'),no:()=>tone([[220,.16],[180,.2]],'square',.06),tap:()=>tone([[520,.05]],'sine',.08),
  piece:()=>tone([[523,.12],[659,.12],[784,.12],[1047,.3]],'triangle'),warp:()=>tone([[300,.1],[400,.1],[600,.1],[900,.1],[1200,.2]],'sine',.08),
  fan:()=>tone([[523,.14],[659,.14],[784,.14],[1047,.14],[784,.12],[1047,.4]],'triangle',.18),step:()=>tone([[392,.07],[587,.12]],'sine',.1)};

/* ---------- 공통 ---------- */
const view=$('#view'),toastEl=$('#toast');let toastT;
function toast(m,ms){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('on'),ms||2200);}
function modal(title,body,opts){
  const m=$('#modal');m.innerHTML='';const box=el('<div class="mbox" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="mhd"><h2>'+esc(title)+'</h2><button class="x" type="button" aria-label="닫기">✕</button></div><div class="mbd"></div></div>');
  if(typeof body==='string')box.querySelector('.mbd').innerHTML=body;else box.querySelector('.mbd').appendChild(body);
  box.querySelector('.x').addEventListener('click',closeModal);m.appendChild(box);m.classList.add('on');
  if(opts&&opts.wide)box.classList.add('wide');return box;}
function closeModal(){$('#modal').classList.remove('on');$('#modal').innerHTML='';}
function chapterById(id){return CHAPTERS.find(c=>c.id===id);}
function chIndex(id){return CHAPTERS.findIndex(c=>c.id===id);}
function unlocked(id){if(S.free)return true;const i=chIndex(id);return i===0||!!S.chDone[CHAPTERS[i-1].id];}
const BOXES=['c1','c2','c3','c4','c5','c6','lock'];
function boxCount(){return BOXES.filter(id=>S.chDone[id]).length;}
function pieceCount(){return [0,1,2,3,4,5].filter(n=>S.pieces[n]).length;}
const ALLW=Object.keys(WORDS);
function goldCape(){return ALLW.every(k=>(S.wl[k]||0)>=3);}
function avOpts(){return S.chest?{hat:'#5b3a25',cape:goldCape()?'#e9b949':'#7b4fd1',feather:S.oxWrong===0&&S.ox&&BINS.every((_,i)=>S.ox[i])?'#e85d5d':null,watch:true}:{watch:!!S.name};}

/* ---------- 머리줄 ---------- */
function renderTop(){
  const t=$('#top');
  t.innerHTML='<button class="me" type="button" title="내 캐릭터">'+avatarSVG(S.av,Object.assign({w:34,h:48},avOpts()))+'<span>'+(S.name?esc(S.name):'시간 여행자')+'</span></button>'+
   '<div class="ttl">할머니의 타임캡슐<small>사회 6-2 · 학습지 3~6쪽</small></div>'+
   '<div class="tbtns"><span class="pc" title="찾은 편지 조각">🧩 '+pieceCount()+'/6</span><span class="pc" title="쌓은 상자">📦 '+boxCount()+'/7</span>'+
   '<button type="button" class="tb" id="tbMap">🗺 지도</button><button type="button" class="tb" id="tbWords">🔑 낱말 도감</button></div>';
  t.querySelector('#tbMap').addEventListener('click',()=>{if(!S.name)return;renderMap();});
  t.querySelector('#tbWords').addEventListener('click',openWordBook);
  t.querySelector('.me').addEventListener('click',()=>{if(S.name)openMe();});
}

/* ---------- 시작 화면 ---------- */
function renderStart(){
  view.innerHTML='';const av=Object.assign({},S.av);
  const sec=el('<section class="start"><div class="hero">'+sceneSVG('hill',['halmoni'])+'<div class="herot"><h1>할머니의 타임캡슐</h1><p>찢겨 나간 편지 여섯 조각을 찾아 시간 여행을 떠나요</p></div></div>'+
   '<div class="card"><h2>오늘 할 공부</h2><ul class="list"><li>사회 6-2 2단원 ② 우리나라의 경제 성장 · <b>9~11차시</b></li><li>준비물: <b>교과서</b>(79·81~91쪽), <b>박물관 탐험 기록장(학습지) 3~6쪽</b>, 연필, 빨간 펜</li><li>화면 위 「지금 할 일」을 하나씩 따라가면 혼자서도 끝까지 갈 수 있어요.</li><li>기록은 이 크롬북에 저장돼요. 다음에도 <b>같은 크롬북</b>으로 이어서 해요.</li></ul></div>'+
   '<div class="card"><h2>시간 여행자 등록</h2><div class="who"><label>번호 <input id="sNum" inputmode="numeric" maxlength="2" placeholder="예) 7"></label><label>이름 <input id="sName" maxlength="8" placeholder="예) 김은석"></label></div>'+
   '<div class="avmk"><div class="avbig"></div><div class="avopts"></div></div><button class="btn big" id="sGo" type="button">시간 여행 시작! ▶</button></div></section>');
  view.appendChild(sec);
  const big=sec.querySelector('.avbig'),opts=sec.querySelector('.avopts');
  const draw=()=>big.innerHTML=avatarSVG(av,{w:120,h:170,watch:true});
  [['skin','피부'],['hair','머리 색'],['style','머리 모양'],['shirt','옷 색']].forEach(([k,lab])=>{
    const row=el('<div class="opt"><span>'+lab+'</span><div></div></div>');
    AV_OPT[k].forEach((v,i)=>{const b=el('<button type="button" class="sw" aria-pressed="'+(av[k]===i)+'" aria-label="'+lab+' '+(i+1)+'"></button>');
      if(k==='style')b.textContent=['짧은','긴','올린'][i];else b.style.background=v;
      b.addEventListener('click',()=>{av[k]=i;[].forEach.call(row.querySelectorAll('.sw'),x=>x.setAttribute('aria-pressed',String(x===b)));draw();sfx.tap();});row.lastElementChild.appendChild(b);});
    opts.appendChild(row);});
  draw();
  sec.appendChild(teachLink());
  sec.querySelector('#sNum').value=S.num||'';sec.querySelector('#sName').value=S.name||'';
  sec.querySelector('#sGo').addEventListener('click',()=>{
    const nm=sec.querySelector('#sName').value.trim(),no=sec.querySelector('#sNum').value.trim();
    if(!nm){toast('이름을 써 주세요');sec.querySelector('#sName').focus();return;}
    S.name=nm;S.num=no;S.av=av;if(!S.started)S.started=new Date().toISOString();save();ac();renderTop();openChapter('p0',true);});
}

function openMe(){
  const b=el('<div class="me-pop"><div class="avbig">'+avatarSVG(S.av,Object.assign({w:150,h:212},avOpts()))+'</div><div><p><b>'+esc(S.num?S.num+'번 ':'')+esc(S.name)+'</b> 시간 여행자</p>'+
    (S.chest?'<p>🎩 시간 여행자 모자 · 망토를 입고 있어요.</p><p class="note">'+(goldCape()?'✨ 모든 낱말 ★★★ — 금빛 망토!':'낱말 도감의 모든 낱말을 ★★★로 만들면 망토가 금빛으로 바뀌어요.')+'</p><p class="note">'+(avOpts().feather?'🪶 OX 쓰레기통을 한 번도 안 틀려서 빨간 깃털!':'')+'</p>':'<p>마지막 「타임캡슐 자물쇠」까지 열면 보상 탑 꼭대기 보물 상자에서 입을 것이 나와요.</p>')+'</div></div>');
  modal('내 캐릭터',b);
}

/* ---------- 지도 ---------- */
function renderMap(){
  view.innerHTML='';renderTop();
  const sec=el('<section class="map"><div class="mhead"><h1>찢겨 나간 편지를 찾아라</h1><p>장을 차례로 끝내면 다음 장이 열려요. 장마다 <b>학습지 쪽</b>과 <b>교과서 쪽</b>이 적혀 있어요.</p></div><div class="mgrid"><div class="road"></div><aside class="side"></aside></div></section>');
  view.appendChild(sec);
  const road=sec.querySelector('.road');let lastSes='';
  const nextId=(CHAPTERS.find(c=>!S.chDone[c.id])||{}).id;
  CHAPTERS.forEach(c=>{
    if(c.session!==lastSes){lastSes=c.session;road.appendChild(el('<div class="ses">'+esc(c.session==='시작'?'출발':c.session==='정리'?'정리 (보너스 6쪽)':c.session)+'</div>'));}
    const on=unlocked(c.id),dn=!!S.chDone[c.id],now=c.id===nextId;
    const b=el('<button type="button" class="node'+(dn?' done':'')+(now?' now':'')+(on?'':' lock')+'"><span class="nn">'+esc(c.no)+'</span><span class="nt"><b>'+esc(c.title)+'</b><small>'+esc(c.era)+'</small><small class="pg">'+(c.ws?'✎ '+esc(c.ws):'')+(c.tb?' · 📖 '+esc(c.tb):'')+'</small></span><span class="ns">'+(dn?'✓ 완료':now&&on?'▶ 지금':on?'다시 보기':'🔒')+'</span></button>');
    b.addEventListener('click',()=>{if(!on){sfx.no();toast('앞 장을 먼저 끝내면 열려요',1800);return;}openChapter(c.id,true);});
    road.appendChild(b);});
  const side=sec.querySelector('.side');
  side.appendChild(letterView(true));
  side.appendChild(el('<div class="card mini"><h3>타임캡슐 상자 탑 '+boxCount()+'/7</h3>'+towerMini()+'<p class="note">장을 끝낼 때마다 상자가 하나씩 쌓여요. 7개가 되면 꼭대기 보물 상자를 열 수 있어요.</p></div>'));
  const wb=el('<button class="btn ghost" type="button">🔑 낱말 도감 · 연습장</button>');wb.addEventListener('click',openWordBook);side.appendChild(wb);
  if(S.chDone.lock){const fb=el('<button class="btn sun" type="button">🏆 보상 탑 다시 가기</button>');fb.addEventListener('click',()=>{S.at.lock=chapterById('lock').steps.length-1;save();openChapter('lock',false);});side.appendChild(fb);}
  side.appendChild(teachLink());
}
function towerMini(){let s='<svg viewBox="0 0 120 170" class="tmini" aria-hidden="true"><rect x="0" y="160" width="120" height="10" fill="#9cc77a"/>';
  for(let i=0;i<7;i++){const x=i%2?52:28,y=138-i*20,on=!!S.chDone[BOXES[i]];s+='<rect x="'+x+'" y="'+y+'" width="40" height="20" rx="3" fill="'+(on?'#c99b62':'none')+'" stroke="'+(on?'#7a5537':'#b9b1a3')+'" stroke-dasharray="'+(on?'':'4 3')+'" stroke-width="2"/>';}
  s+='<rect x="44" y="'+(138-7*20+4)+'" width="32" height="16" rx="3" fill="'+(S.chest?'#e9b949':'none')+'" stroke="#b7862a" stroke-width="2"/>';
  return s+'</svg>';}
function letterView(mini){
  const box=el('<div class="card letter'+(mini?' mini':'')+'"><h3>할머니의 찢긴 편지 '+pieceCount()+'/6</h3><div class="paperl"></div></div>');
  const p=box.querySelector('.paperl');
  LETTER.forEach((t,i)=>{p.appendChild(el('<p class="'+(S.pieces[i]?'y':'')+'">'+(S.pieces[i]?esc(t):'<span class="torn">찢겨 나간 조각 '+(i+1)+'</span>')+'</p>'));});
  if(S.pieces[6])p.appendChild(el('<p class="sign">— 2026년 가을, 옥순 할머니가 미래의 손주 친구에게</p>'));
  return box;
}

/* ---------- 시간 여행 효과 ---------- */
let lastYear=2026;
function timeWarp(to,then){
  const w=$('#warp');w.innerHTML='<div class="wc">'+clockFace(150)+'</div><div class="wy">'+lastYear+'</div><div class="wt">시간 여행 중…</div>';w.classList.add('on');sfx.warp();
  const from=lastYear,t0=Date.now(),dur=1300;let fin=false;
  const iv=setInterval(()=>{const k=Math.min(1,(Date.now()-t0)/dur);w.querySelector('.wy').textContent=Math.round(from+(to-from)*(1-Math.pow(1-k,3)))+'년';if(k>=1)end();},40);
  function end(){if(fin)return;fin=true;clearInterval(iv);w.classList.remove('on');lastYear=to;then();}
  setTimeout(end,dur+300);
  w.onclick=end; /* 눌러도 바로 넘어감 */
}

/* ---------- 장 화면 ---------- */
let curCh=null;
function openChapter(id,warp){curCh=id;const ch=chapterById(id);if(warp&&ch.year!==lastYear)timeWarp(ch.year,renderChapter);else{lastYear=ch.year;renderChapter();}}
function sd(id){return S.sd[id]||(S.sd[id]=[]);}
const INFO={
  talk:()=>['💬 이야기','💬 이야기를 끝까지 들어요. 「계속」을 눌러요.'],
  capsule:()=>['📦 타임캡슐','📦 타임캡슐 상자를 눌러서 열어요.'],
  read:s=>['📖 '+(s.box?s.box+' · ':'')+s.pages,'📖 교과서 '+s.pages+'을 펴서 읽어요. 찾은 것을 하나씩 눌러 ✓ 해요.'],
  match:s=>['🃏 '+(s.label||'카드 맞추기'),'🃏 노력 카드를 먼저 누르고, 알맞은 주체 칸을 눌러요.'],
  sort:s=>['🛒 '+(s.label||'나누기'),'🛒 물건마다 알맞은 쪽 버튼을 눌러요.'],
  two:s=>['🤔 '+(s.label||'생각해 보기'),'🤔 알맞은 것 두 개를 골라요.'],
  quiz:s=>['✅ '+(s.label||'확인 문제'),'✅ 문제를 차례로 풀어요.'],
  debate:s=>['🗣 '+(s.label||'토론 준비'),'🗣 주체를 골라 해결 방안과 근거를 쓰고, 반박 카드에 답해요.'],
  ox:s=>['🗑 '+(s.label||'OX'),'🗑 쓰레기통 1번부터 6번까지 O인지 X인지 골라요.'],
  words:s=>['🔑 '+(s.label||'낱말 열쇠'),'🔑 낱말 열쇠: '+((s.phases||['pick','write','tell']).map(p=>({pick:'뜻 보고 고르기',write:'뜻 보고 쓰기',tell:'헷갈리는 낱말 구별'})[p]).join(' → '))],
  write:s=>['✎ 학습지 '+s.page+'쪽','✎ 학습지 '+s.page+'쪽을 펴요 — '+s.where],
  future:s=>['✉ '+(s.label||'편지'),'✉ 기억에 남는 낱말 하나와 그 까닭을 골라 쓰고, 학습지 5쪽 맨 아래에도 써요.'],
  piece:()=>['🧩 편지 조각','🧩 찾은 편지 조각을 붙여요.'],
  finale:()=>['🏆 보상 탑','🏆 상자 탑을 한 칸씩 올라 보물 상자를 열어요.']
};
const HELP={
  talk:'「계속」 버튼을 누르면 다음 말이 나와요. 글자가 다 나오기 전에 누르면 한 번에 다 보여요.',
  capsule:'가운데 갈색 상자를 눌러 보세요.',
  read:'교과서를 펴서 화면에 적힌 쪽을 찾아요. 「찾으며 읽기」 항목을 하나 찾을 때마다 눌러 ✓ 표시해요. 다 ✓하면 확인 문제가 나와요. 틀리면 어느 부분을 다시 읽을지 알려 줘요.',
  match:'위의 노력 카드를 먼저 하나 누르고(파랗게 바뀌어요), 아래에서 그 일을 하는 주체 칸을 눌러요. 틀리면 칸이 흔들려요. 교과서 82~84쪽 아래 사진 카드를 보면 답이 있어요.',
  sort:'물건마다 오른쪽 버튼 둘 중 하나를 눌러요. 「정말 필요한가? 꼭 지금 이만큼 필요한가?」 생각해 봐요.',
  two:'두 개를 골라 「확인」을 눌러요. 빈부 격차가 커지면 사람들의 마음과 사회가 어떻게 될지 떠올려요.',
  quiz:'앞의 이야기에서 하늘 쌤이 말한 숫자를 떠올려요. 「막혔어요」로 이야기를 다시 보려면 「◀ 이전」을 눌러요.',
  debate:'1) 주체 하나를 골라요 → 2) 그 주체가 할 수 있는 해결 방안과 근거를 써요(교과서 속 예시를 참고해도 돼요) → 3) 반박 카드를 받고 보완 의견을 써요 → 4) 스스로 평가해요.',
  ox:'설명을 잘 읽고 O(옳아요) 또는 X(틀려요)를 눌러요. 「~만」, 「~만으로」 같은 낱말을 조심해요.',
  words:'뜻을 천천히 읽고 낱말을 골라요. 쓰기에서 막히면 「첫소리 힌트」를 눌러요. 틀린 낱말은 뒤에 다시 나오니 걱정하지 않아도 돼요.',
  write:'학습지의 그 쪽을 펴서 화면과 같은 칸을 찾아 연필로 써요. 회색 글자는 첫소리 힌트예요. 다 쓰면 「다 썼어요」를 누르고, 빨간 정답과 비교해 틀린 곳을 빨간 펜으로 고쳐요.',
  future:'오늘 배운 낱말 가운데 가장 기억에 남는 것 하나를 고르고, 왜 그런지 한 줄로 써요.',
  piece:'「다음 ▶」을 누르면 다음 장으로 가요.',
  finale:'「한 칸 오르기」를 일곱 번 누르면 꼭대기에 닿아요.'
};
function renderChapter(){
  renderTop();const ch=chapterById(curCh);const n=ch.steps.length;let i=Math.min(S.at[ch.id]||0,n-1);S.at[ch.id]=i;save();
  const st=ch.steps[i],done=sd(ch.id);
  view.innerHTML='';
  const sec=el('<section class="chap"><div class="scene">'+sceneSVG(ch.scene,ch.people)+'<div class="era"><b>'+esc(ch.no)+'</b> '+esc(ch.title)+'<small>'+esc(ch.era)+'</small></div><div class="tags">'+(ch.ws?'<span>✎ '+esc(ch.ws)+'</span>':'')+(ch.tb?'<span>📖 '+esc(ch.tb)+'</span>':'')+'</div></div>'+
   '<div class="guide"><div class="nowdo"><span class="lb">지금 할 일</span><span class="tx"></span></div><ol class="chips"></ol></div><div class="card step"></div>'+
   '<div class="nav"><button class="btn ghost" type="button" id="bPrev">◀ 이전</button><button class="btn ghost" type="button" id="bHelp">막혔어요</button><button class="btn" type="button" id="bNext">다음 ▶</button></div></section>');
  view.appendChild(sec);
  sec.querySelector('.nowdo .tx').textContent=INFO[st.t](st)[1];
  const chips=sec.querySelector('.chips');
  ch.steps.forEach((s2,j)=>{const c=el('<li><button type="button" class="'+(j===i?'cur':done[j]?'ok':'')+'">'+(done[j]&&j!==i?'✓ ':'')+esc(INFO[s2.t](s2)[0])+'</button></li>');
    c.firstChild.addEventListener('click',()=>{if(j===i)return;if(done[j]||j<=firstUndone(ch)){S.at[ch.id]=j;save();renderChapter();window.scrollTo(0,0);}else{sfx.no();toast('지금 할 일을 먼저 끝내요',1500);}});chips.appendChild(c);});
  const bN=sec.querySelector('#bNext'),bP=sec.querySelector('#bPrev');
  bP.disabled=i===0;bP.addEventListener('click',()=>{S.at[ch.id]=i-1;save();renderChapter();});
  sec.querySelector('#bHelp').addEventListener('click',()=>modal('막혔어요',helpHtml(st,ch)));
  const setNext=()=>{bN.disabled=!done[i];bN.classList.toggle('pulse',!!done[i]);};
  const isLast=i===n-1;
  if(isLast)bN.textContent=ch.id==='lock'?'지도로 ▶':'지도로 가기 ▶';
  bN.addEventListener('click',()=>{if(!done[i])return;
    if(isLast){if(ch.id==='p0'){S.chDone.p0=true;save();}renderMap();window.scrollTo(0,0);return;}
    S.at[ch.id]=i+1;save();renderChapter();window.scrollTo(0,0);});
  const was=!!done[i];
  const markDone=()=>{if(!done[i]){done[i]=true;save();}setNext();
    [].forEach.call(chips.querySelectorAll('button'),(b,j)=>{if(j===i)b.classList.add('ok');});};
  setNext();
  STEP[st.t](sec.querySelector('.step'),st,markDone,was,ch,i);
}
function firstUndone(ch){const d=sd(ch.id);for(let j=0;j<ch.steps.length;j++)if(!d[j])return j;return ch.steps.length;}
function helpHtml(st,ch){
  let h='<p>'+HELP[st.t]+'</p>';
  if(ch.tb)h+='<p class="note">이 장의 교과서: <b>'+esc(ch.tb)+'</b> · 학습지: <b>'+esc(ch.ws)+'</b></p>';
  h+='<div class="box sunny"><b>그래도 어려우면</b><ul class="list"><li>「◀ 이전」을 눌러 앞 이야기를 다시 읽어요.</li><li>교과서의 그 쪽을 소리 내지 말고 한 번 더 읽어요.</li><li>학습지에서 모르는 칸은 비워 두고 옆에 <b>?</b> 표시를 해 두면, 선생님이 나중에 함께 봐 주실 거예요.</li></ul></div>';
  return h;
}

/* ---------- 단계별 ---------- */
const STEP={};

STEP.talk=(box,st,done,was)=>{
  const L=st.lines,n=L.length;let k=was?n-1:0,typing=null,full='';
  const wrap=el('<div class="talk"><div class="pf"></div><div class="bub"><div class="nm"></div><div class="tx" aria-live="polite"></div></div></div>');
  const ctl=el('<div class="row"><button class="btn" type="button">계속 ▶</button><span class="note cnt"></span></div>');
  const log=el('<details class="log"><summary>앞에서 한 말 다시 보기</summary><div></div></details>');
  box.append(wrap,ctl,log);const btn=ctl.querySelector('button'),tx=wrap.querySelector('.tx');
  function show(){const [who,t]=L[k],p=PEOPLE[who];wrap.querySelector('.pf').innerHTML=portrait(who,92);
    wrap.querySelector('.nm').innerHTML='<b>'+esc(p.name)+'</b> <small>'+esc(p.role)+'</small>';wrap.classList.toggle('tt',who==='tt');
    full=t;let c=0;tx.textContent='';clearInterval(typing);
    typing=setInterval(()=>{c+=2;tx.textContent=full.slice(0,c);if(c>=full.length){clearInterval(typing);typing=null;fin();}},28);
    ctl.querySelector('.cnt').textContent=(k+1)+' / '+n;
    log.lastElementChild.innerHTML=L.slice(0,k).map(([w,t2])=>'<p><b>'+esc(PEOPLE[w].name)+'</b> '+esc(t2)+'</p>').join('')||'<p class="note">아직 없어요.</p>';
    btn.textContent=k<n-1?'계속 ▶':'처음부터 다시 듣기 ↺';}
  function fin(){if(k===n-1)done();}
  btn.addEventListener('click',()=>{if(typing){clearInterval(typing);typing=null;tx.textContent=full;fin();return;}sfx.tap();if(k<n-1)k++;else k=0;show();});
  show();
};

STEP.capsule=(box,st,done,was)=>{
  const w=el('<div class="caps"><button type="button" class="capbox" aria-label="타임캡슐 상자 열기"><svg viewBox="0 0 200 140" width="220"><rect x="20" y="50" width="160" height="80" rx="8" fill="#8a6a45" stroke="#5e4630" stroke-width="4"/><g class="lid"><rect x="14" y="30" width="172" height="30" rx="6" fill="#9b7a52" stroke="#5e4630" stroke-width="4"/></g><rect x="88" y="52" width="24" height="18" rx="3" fill="#e9b949"/></svg><span>눌러서 열기</span></button><div class="letters"></div></div>');
  box.appendChild(w);const letters=w.querySelector('.letters');
  function open(){w.classList.add('open');letters.innerHTML='';
    const cards=[['1960년대 → 2020년대','<div class="pair"><img src="img/gw1960.png" alt="1960년대 광화문 거리 그림"><img src="img/gw2020.png" alt="2020년대 광화문 거리 그림"></div>빌딩과 자동차가 몰라보게 늘었단다.'],
      ['1970년 → 2023년','<div class="big-num">약 490배</div>1인당 국민 총소득이 9만 원에서 4,405만 원으로!'],
      ['1970년 → 2022년','<div class="big-num">62.3세 → 82.7세</div>기대 수명이 20년 넘게 늘었지.']];
    cards.forEach(([h,b],j)=>{const c=el('<div class="lt" style="animation-delay:'+(j*.25)+'s"><b>'+h+'</b><div>'+b+'</div></div>');letters.appendChild(c);});
    setTimeout(()=>{letters.appendChild(el('<div class="lt torn" style="animation-delay:.1s"><b>그런데…</b><div>일기장 뒤쪽이 북 찢겨 나갔어요! 찢긴 자리가 <b>여섯 군데</b>예요.</div></div>'));sfx.no();done();},was?0:1200);}
  w.querySelector('.capbox').addEventListener('click',()=>{if(w.classList.contains('open'))return;sfx.piece();S.capsule=true;save();open();});
  if(was)open();
};

function quizBlock(q,onRight,already){
  const b=el('<div class="qz"><p class="q">'+q.q+'</p><div class="opts"></div><div class="fb" aria-live="polite"></div></div>');
  const opts=b.querySelector('.opts'),fb=b.querySelector('.fb');const btns=[];
  q.opts.forEach((t,j)=>{const o=el('<button type="button" class="opt">'+esc(t)+'</button>');btns.push(o);
    o.addEventListener('click',()=>{if(b.dataset.done)return;
      if(j===q.ans){sfx.ok();fin();onRight();}else{sfx.no();o.classList.add('no');o.disabled=true;fb.innerHTML='<span class="bad">다시 생각해 봐요.</span> '+esc(q.hint||'앞의 내용을 다시 떠올려 봐요.');}});opts.appendChild(o);});
  function fin(){b.dataset.done=1;btns.forEach((o,j)=>{o.disabled=true;if(j===q.ans)o.classList.add('right');});fb.innerHTML='<span class="good">맞았어요!</span>';}
  if(already)fin();
  return b;
}

STEP.read=(box,st,done,was,ch,i)=>{
  const k=ch.id+':'+i,R=S.rd[k]||(S.rd[k]={c:[],ok:false});
  box.appendChild(el('<div class="readhd"><div class="bk">📖</div><div><small>'+(st.box?esc(st.box)+' · ':'')+'교과서를 펴요</small><b>'+esc(st.pages)+'</b></div></div>'));
  box.appendChild(el('<p>읽으면서 아래 내용을 찾아요. <b>찾으면 하나씩 눌러 ✓</b> 표시해요.</p>'));
  const ul=el('<div class="look"></div>');box.appendChild(ul);
  const go=el('<button class="btn" type="button" disabled>교과서를 다 읽었어요 ✓</button>');box.appendChild(go);
  const qh=el('<div></div>');box.appendChild(qh);
  st.look.forEach((t,j)=>{const b=el('<button type="button" class="lk" aria-pressed="'+(R.c.indexOf(j)>-1)+'"><span class="ck"></span>'+esc(t)+'</button>');
    b.addEventListener('click',()=>{const p=R.c.indexOf(j);if(p>-1)R.c.splice(p,1);else{R.c.push(j);sfx.tap();}save();b.setAttribute('aria-pressed',String(p<0));upd();});ul.appendChild(b);});
  function upd(){go.disabled=R.c.length<st.look.length;}
  function showQ(){go.hidden=true;qh.innerHTML='';qh.appendChild(el('<h3 class="qh">읽었는지 확인해요</h3>'));
    qh.appendChild(quizBlock(st.q,()=>{R.ok=true;save();done();},R.ok));if(R.ok)done();}
  go.addEventListener('click',()=>{sfx.tap();showQ();});
  upd();if(R.ok||was)showQ();
};

STEP.match=(box,st,done,was)=>{
  const m=MATCH[st.key],placed=S.match[st.key];
  const play=el('<div><p class="note">노력 카드를 먼저 누르고 → 그 일을 하는 <b>주체</b> 칸을 눌러요.</p>'+(st.scale?'<div class="scale"></div>':'')+'<div class="cards"></div><div class="slots"></div><div class="fin"></div></div>');
  box.appendChild(play);const cards=play.querySelector('.cards'),slots=play.querySelector('.slots');let sel=null;const cardEls=[];
  function drawScale(){if(!st.scale)return;const t=Math.max(0,16-placed.length*16/3);
    play.querySelector('.scale').innerHTML='<svg viewBox="0 0 300 150" width="300" aria-label="저울"><rect x="145" y="40" width="10" height="95" fill="#5a7da6"/><rect x="110" y="132" width="80" height="10" rx="4" fill="#5a7da6"/>'+
      '<g style="transform:rotate('+t+'deg);transform-origin:150px 44px;transition:transform .8s"><rect x="40" y="40" width="220" height="7" rx="3" fill="#3d72c4"/>'+
      '<g transform="translate(55 47)"><line x1="0" y1="0" x2="-14" y2="40" stroke="#555"/><line x1="0" y1="0" x2="14" y2="40" stroke="#555"/><rect x="-26" y="40" width="52" height="8" rx="3" fill="#7aa0d0"/><text x="0" y="62" text-anchor="middle" font-size="11">어려운 집</text></g>'+
      '<g transform="translate(245 47)"><line x1="0" y1="0" x2="-14" y2="40" stroke="#555"/><line x1="0" y1="0" x2="14" y2="40" stroke="#555"/><rect x="-26" y="40" width="52" height="8" rx="3" fill="#7aa0d0"/><circle cx="-8" cy="32" r="7" fill="#e9b949"/><circle cx="6" cy="30" r="7" fill="#e9b949"/><circle cx="0" cy="22" r="7" fill="#e9b949"/><text x="0" y="62" text-anchor="middle" font-size="11">넉넉한 집</text></g></g></svg>'+
      '<p class="note">'+(placed.length>=3?'저울이 평평해졌어요!':'카드를 맞힐 때마다 저울이 조금씩 평평해져요.')+'</p>';}
  m.order.forEach(ci=>{const c=el('<button class="mcard" type="button" aria-pressed="false">'+esc(m.cards[ci])+'</button>');
    if(placed.indexOf(ci)>-1)c.classList.add('placed');
    c.addEventListener('click',()=>{if(c.classList.contains('placed'))return;sel=ci;cardEls.forEach(x=>x&&x.setAttribute('aria-pressed','false'));c.setAttribute('aria-pressed','true');sfx.tap();});cards.appendChild(c);cardEls[ci]=c;});
  m.who.forEach((w,wi)=>{const full=placed.indexOf(wi)>-1;
    const s=el('<button class="slot'+(full?' full':'')+'" type="button"><b>'+esc(w)+'</b><span>'+(full?esc(m.cards[wi]):'여기에 카드를 놓아요')+'</span></button>');
    s.addEventListener('click',()=>{if(placed.indexOf(wi)>-1)return;if(sel===null){toast('먼저 위에서 노력 카드를 골라요',1500);return;}
      if(sel===wi){placed.push(wi);save();sfx.ok();s.classList.add('full');s.querySelector('span').textContent=m.cards[wi];cardEls[wi].classList.add('placed');sel=null;drawScale();fin();}
      else{sfx.no();s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');toast('다시 생각해 봐요. 이 일은 누가 할 수 있을까요?',1700);}});slots.appendChild(s);});
  function fin(){if(placed.length===m.who.length){play.querySelector('.fin').innerHTML='<div class="box sunny"><b>세 주체를 모두 찾았어요!</b> 한 가지 문제도 여러 주체가 함께 노력해야 더 빠르고 효율적으로 해결할 수 있어요.</div>';done();}}
  drawScale();fin();
};

STEP.sort=(box,st,done)=>{
  const R=S.sort[st.key]||(S.sort[st.key]={});
  box.appendChild(el('<p>'+esc(st.intro)+'</p>'));const wrap=el('<div class="sort"></div>');box.appendChild(wrap);const fin=el('<div></div>');box.appendChild(fin);
  st.items.forEach(([t,a],j)=>{const ok=R[j]===true;const it=el('<div class="it'+(ok?' ok':'')+'"><span>'+esc(t)+'</span><button type="button">'+esc(st.a)+'</button><button type="button">'+esc(st.b)+'</button></div>');
    const bs=it.querySelectorAll('button');if(ok)bs[a].classList.add('pick');
    bs.forEach((b,x)=>b.addEventListener('click',()=>{if(R[j]===true)return;
      if(x===a){R[j]=true;save();it.classList.add('ok');b.classList.add('pick');sfx.ok();chk();}
      else{sfx.no();it.classList.remove('no');void it.offsetWidth;it.classList.add('no');toast(a?'정말 꼭 필요한 만큼일까요?':'다 썼거나 작아졌다면 꼭 필요한 소비예요.',1800);}}));wrap.appendChild(it);});
  function chk(){if(st.items.every((_,j)=>R[j]===true)&&!fin.firstChild){fin.appendChild(el('<div class="box sunny"><b>장바구니 검사 끝!</b> 필요한 것보다 지나치게 많이 사는 것이 <b>과소비</b>예요. 과소비가 늘면 쓰레기가 늘고 자원이 낭비돼요.</div>'));done();}}
  chk();
};

STEP.two=(box,st,done,was,ch,i)=>{
  const k=ch.id+':'+i;let pick=[];const ok=!!S.two[k];
  box.appendChild(el('<p class="q">'+esc(st.q)+'</p>'));const opts=el('<div class="opts"></div>');box.appendChild(opts);
  const cb=el('<button class="btn" type="button" disabled>확인</button>');box.appendChild(cb);const fb=el('<div class="fb"></div>');box.appendChild(fb);
  const bs=st.opts.map((t,j)=>{const b=el('<button type="button" class="opt" aria-pressed="false">'+esc(t)+'</button>');
    b.addEventListener('click',()=>{if(S.two[k])return;const p=pick.indexOf(j);if(p>-1)pick.splice(p,1);else{if(pick.length>=2)pick.shift();pick.push(j);}
      bs.forEach((x,y)=>x.setAttribute('aria-pressed',String(pick.indexOf(y)>-1)));cb.disabled=pick.length!==2;sfx.tap();});opts.appendChild(b);return b;});
  function win(){bs.forEach((x,y)=>{x.disabled=true;if(st.ans.indexOf(y)>-1)x.classList.add('right');});cb.hidden=true;fb.innerHTML='<div class="box sunny"><b>맞았어요!</b> '+esc(st.after)+'</div>';done();}
  cb.addEventListener('click',()=>{const r=pick.length===2&&st.ans.every(a=>pick.indexOf(a)>-1);if(r){S.two[k]=true;save();sfx.ok();win();}else{sfx.no();fb.innerHTML='<span class="bad">하나가 아니에요.</span> 빈부 격차가 커지면 사람들의 마음과 사회가 어떻게 될지 생각해 봐요.';}});
  if(ok)win();
};

STEP.quiz=(box,st,done,was,ch,i)=>{
  const k=ch.id+':'+i,R=S.qz[k]||(S.qz[k]=[]);
  st.qs.forEach((q,j)=>{box.appendChild(quizBlock(q,()=>{R[j]=true;save();chk();},!!R[j]));});
  function chk(){if(st.qs.every((_,j)=>R[j]))done();}chk();
};

STEP.debate=(box,st,done)=>{
  const D=S.debate;
  box.appendChild(el('<div class="box"><b>문제 상황</b> 시청과 구청에서 한 해 쓴 <b>우산 비닐 커버가 약 30만 장</b>. 젖은 비닐 커버는 재활용할 수 없어 태우거나 땅에 묻는데, 썩는 데 <b>최소 100년 이상</b> 걸려요.</div>'));
  const s1=el('<div class="dstep"><h3>1. 어떤 주체가 되어 볼까요?</h3><div class="roles"></div><div class="ex"></div></div>');box.appendChild(s1);
  const roles=s1.querySelector('.roles'),ex=s1.querySelector('.ex');
  Object.keys(ROLES).forEach(r=>{const b=el('<button class="role" type="button" aria-pressed="'+(D.role===r)+'">'+esc(r)+'</button>');
    b.addEventListener('click',()=>{if(D.rebut&&D.role!==r){toast('이미 반박 카드를 받았어요. 같은 주체로 마무리해요.',1900);return;}
      D.role=r;save();[].forEach.call(roles.children,c=>c.setAttribute('aria-pressed',String(c===b)));sfx.tap();showEx();s2.hidden=false;});roles.appendChild(b);});
  function showEx(){ex.innerHTML=D.role?'<div class="quote"><b>도움 예시 · '+esc(D.role)+'</b><br>'+esc(ROLES[D.role].ex)+'<br><small>예시를 그대로 쓰지 말고, 내 말로 바꾸거나 더 좋은 방법을 써 봐요.</small></div>':'';}
  showEx();
  const s2=el('<div class="dstep"><h3>2. 내 해결 방안과 근거</h3><label class="note" for="dIdea">맡은 주체가 할 수 있는 일 (「~해요」로 끝맺어요)</label><textarea id="dIdea" placeholder="예) 구청 입구에 빗물 제거기를 두 대 설치해요."></textarea><label class="note" for="dWhy">근거 자료 (숫자나 사실)</label><textarea id="dWhy" placeholder="예) 한 해 30만 장, 썩는 데 100년 이상, 재활용 안 됨"></textarea><button class="btn" type="button" id="rbBtn">친구의 반박 카드 받기</button></div>');
  s2.hidden=!D.role;box.appendChild(s2);
  const idea=s2.querySelector('#dIdea'),why=s2.querySelector('#dWhy');idea.value=D.idea;why.value=D.why;
  idea.addEventListener('input',()=>{D.idea=idea.value;save();});why.addEventListener('input',()=>{D.why=why.value;save();});
  const s3=el('<div class="dstep"><h3>3. 반박에 답하기</h3><div class="rbq"></div><label class="note" for="dFix">반박을 듣고 어떻게 고치거나 보완할까요?</label><textarea id="dFix"></textarea><button class="btn ghost sm" type="button" id="fxBtn">보완 예시 보기</button><div class="fxq"></div><button class="btn sun" type="button" id="dDone">토론 카드 완성!</button></div>');
  s3.hidden=!D.rebut;box.appendChild(s3);
  const fix=s3.querySelector('#dFix');fix.value=D.fix;fix.addEventListener('input',()=>{D.fix=fix.value;save();});
  function showRb(){s3.querySelector('.rbq').innerHTML=D.role?'<div class="quote rb"><b>친구의 반박</b><br>'+esc(ROLES[D.role].rb)+'</div>':'';}showRb();
  s2.querySelector('#rbBtn').addEventListener('click',()=>{if(D.idea.trim().length<6){toast('해결 방안을 조금 더 자세히 써 볼까요?',1800);idea.focus();return;}
    if(D.why.trim().length<2){toast('근거 자료도 한 가지 써 봐요 (숫자나 사실)',1800);why.focus();return;}
    D.rebut=true;save();showRb();s3.hidden=false;sfx.tap();s3.scrollIntoView({behavior:'smooth',block:'start'});});
  s3.querySelector('#fxBtn').addEventListener('click',e=>{s3.querySelector('.fxq').innerHTML='<div class="quote fx"><b>보완 예시</b><br>'+esc(ROLES[D.role].fix)+'</div>';e.target.remove();});
  const card=el('<div></div>');box.appendChild(card);
  function myCard(){card.innerHTML='';if(!D.done||!ROLES[D.role])return;card.appendChild(debateCard());}
  s3.querySelector('#dDone').addEventListener('click',()=>{if(D.fix.trim().length<4){toast('반박에 대한 보완 의견을 써 볼까요?',1800);fix.focus();return;}
    D.done=true;save();sfx.ok();myCard();done();card.scrollIntoView({behavior:'smooth',block:'start'});});
  myCard();if(D.done)done();
};
function debateCard(){const D=S.debate;if(!D.role||!ROLES[D.role])return el('<div class="note">아직 토론 카드가 없어요.</div>');
  return el('<div class="mycard"><b>내 토론 카드 · '+esc(D.role)+'</b><div><i>1. 해결 방안</i> '+esc(D.idea)+'</div><div><i>2. 근거 자료</i> '+esc(D.why)+'</div><div><i>3. 친구의 반박</i> '+esc(ROLES[D.role].rb)+'</div><div><i>4. 보완 의견</i> '+esc(D.fix)+'</div></div>');}

STEP.ox=(box,st,done)=>{
  let n=BINS.findIndex((_,j)=>!S.ox[j]);if(n<0)n=0;
  const banner=el('<div class="bannerw"><div class="banner"></div><p class="note">옳은 설명이 적힌 쓰레기통의 문구만 현수막에 올라가요.</p></div>');
  const bins=el('<div class="binrow"></div>');const q=el('<div class="oxq"></div>');
  box.append(bins,q,banner);
  function drawBanner(){banner.querySelector('.banner').innerHTML=BINS.map((b,j)=>b.a?'<span class="'+(S.ox[j]?'y':'')+'">'+(S.ox[j]?esc(b.w):'?')+'</span>':'').join('');}
  function drawBins(){bins.innerHTML='';BINS.forEach((b,j)=>{const x=el('<button type="button" class="bn'+(j===n?' cur':'')+(S.ox[j]?' ok':'')+'">'+(j+1)+'<small>'+(S.ox[j]?(b.a?'O':'X'):'?')+'</small></button>');x.addEventListener('click',()=>{n=j;draw();});bins.appendChild(x);});}
  function draw(){drawBins();drawBanner();const b=BINS[n];
    q.innerHTML='';const c=el('<div class="oxcard"><small>'+(n+1)+'번 쓰레기통 · 문구 「'+esc(b.w)+'」</small><p>'+esc(b.s)+'</p><div class="oxz"><button type="button" class="o">O<small>옳아요</small></button><button type="button" class="x">X<small>틀려요</small></button></div><div class="fb"></div></div>');q.appendChild(c);
    const fb=c.querySelector('.fb'),[bo,bx]=c.querySelectorAll('.oxz button');
    function result(){bo.disabled=bx.disabled=true;(b.a?bo:bx).classList.add('pick');
      fb.innerHTML='<span class="good">'+(b.a?'O, 옳은 설명!':'X, 틀린 설명!')+'</span> '+esc(b.why)+(b.fix?'<br><b>바르게 고쳐 쓰기:</b> '+esc(b.fix):'')+'<br>'+(b.a?'「'+esc(b.w)+'」 문구가 현수막으로 날아가요.':'「'+esc(b.w)+'」 문구는 현수막에 쓰지 않아요.');
      const nx=BINS.findIndex((_,j)=>!S.ox[j]);if(nx>=0){const nb=el('<button class="btn" type="button">'+(nx+1)+'번 쓰레기통으로 ▶</button>');nb.addEventListener('click',()=>{n=nx;draw();});fb.appendChild(nb);}
      else{fb.appendChild(el('<div class="box sunny"><b>현수막 완성!</b> 「필요한 만큼만 소비하고 자원을 절약하자」</div>'));done();}}
    function answer(v){if(S.ox[n])return;
      if(v===b.a){S.ox[n]=true;save();sfx.ok();drawBins();drawBanner();result();}
      else{S.oxWrong=(S.oxWrong||0)+1;save();sfx.no();c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');
        fb.innerHTML='<span class="bad">다시 생각해 봐요.</span> '+(b.a?'이 설명에서 정말 틀린 곳이 있을까요? 지금까지 찾은 편지 조각을 떠올려 봐요.':'정말 그럴까요? 「~만」, 「~만으로」 같은 낱말을 잘 읽어 봐요.');}}
    bo.addEventListener('click',()=>answer(true));bx.addEventListener('click',()=>answer(false));
    if(S.ox[n])result();}
  draw();if(BINS.every((_,j)=>S.ox[j]))done();
};

/* 낱말 열쇠: 고르기 → 쓰기 → 구별 (틀린 것은 뒤로 돌아가 다시) */
const PH_NAME={pick:'뜻 보고 고르기',write:'뜻 보고 쓰기',tell:'헷갈리는 낱말 구별'};
function lvUp(id,v){if((S.wl[id]||0)<v){S.wl[id]=v;}}
STEP.words=(box,st,done,was,ch,i)=>{
  const ids=st.ids==='ALL'?ALLW.slice():st.ids;const phases=st.phases||['pick','write','tell'];
  const key=st.fullKey||(ch.id+':'+st.key);let P=S.wq[key];
  if(!P||st.reset){P=S.wq[key]={ph:0,q:null,fin:false,t:0,rev:false};save();}
  const head=el('<div class="wph"></div>');const body=el('<div class="wbody"></div>');box.append(head,body);
  function drawHead(){head.innerHTML=phases.map((p,j)=>'<span class="'+(j<P.ph||P.fin?'ok':j===P.ph?'cur':'')+'">'+(j+1)+'. '+PH_NAME[p]+'</span>').join('<i>→</i>')+(P.fin?'':'<b class="left">남은 문제 '+(P.q?P.q.length:'')+'</b>');}
  function buildQ(ph){if(ph==='tell')return shuffle(TELL.map((t,j)=>j).filter(j=>ids.indexOf(TELL[j].a)>-1));return shuffle(ids.slice());}
  function next(){
    if(P.ph>=phases.length){P.fin=true;save();drawHead();summary();done();return;}
    const ph=phases[P.ph];if(!P.q){P.q=buildQ(ph);P.t=0;P.rev=false;save();}
    if(!P.q.length){P.ph++;P.q=null;save();if(P.ph<phases.length){body.innerHTML='';drawHead();const c=el('<div class="phase-go"><div class="big">🔓</div><p><b>'+PH_NAME[phases[P.ph-1]]+'</b> 통과!</p><p>다음은 <b>'+PH_NAME[phases[P.ph]]+'</b>예요.</p><button class="btn" type="button">시작 ▶</button></div>');c.querySelector('button').addEventListener('click',next);body.appendChild(c);sfx.step();return;}next();return;}
    drawHead();({pick:askPick,write:askWrite,tell:askTell})[ph](P.q[0]);}
  function advance(ok){const it=P.q.shift();if(!ok)P.q.push(it);P.t=0;P.rev=false;save();next();}
  function fbBox(ok,html,btnText,cb){const f=el('<div class="wfb '+(ok?'good':'bad')+'">'+html+'<button class="btn" type="button">'+btnText+'</button></div>');f.querySelector('button').addEventListener('click',cb);return f;}
  function askPick(id){const W=WORDS[id];body.innerHTML='';
    let pool=ids.filter(x=>x!==id);if(pool.length<3)pool=pool.concat(shuffle(ALLW.filter(x=>x!==id&&pool.indexOf(x)<0&&WORDS[x].ch===W.ch)));if(pool.length<3)pool=pool.concat(shuffle(ALLW.filter(x=>x!==id&&pool.indexOf(x)<0)));
    const opts=shuffle([id].concat(shuffle(pool).slice(0,3)));
    const c=el('<div class="wq"><small>이 뜻을 가진 낱말은?</small><p class="def">'+esc(W.d)+'</p><div class="opts g2"></div></div>');body.appendChild(c);
    opts.forEach(o=>{const b=el('<button type="button" class="opt">'+esc(WORDS[o].w)+'</button>');b.addEventListener('click',()=>{if(c.dataset.done)return;c.dataset.done=1;
      [].forEach.call(c.querySelectorAll('.opt'),x=>x.disabled=true);
      if(o===id){sfx.ok();b.classList.add('right');lvUp(id,1);save();c.appendChild(fbBox(true,'<b>정답! '+esc(W.w)+'</b>','다음 문제 ▶',()=>advance(true)));}
      else{sfx.no();b.classList.add('no');c.appendChild(fbBox(false,'<b>아쉬워요.</b> 정답은 <b>'+esc(W.w)+'</b>예요. <br><small>「'+esc(WORDS[o].w)+'」의 뜻: '+esc(WORDS[o].d)+'</small><br><small>이 문제는 뒤에서 한 번 더 나와요.</small>','알겠어요 ▶',()=>advance(false)));}
      c.lastElementChild.querySelector('button').focus();});c.querySelector('.opts').appendChild(b);});}
  function askWrite(id){const W=WORDS[id];body.innerHTML='';
    const c=el('<div class="wq"><small>뜻을 읽고 낱말을 써요</small><p class="def">'+esc(W.d)+'</p><div class="hint"></div><div class="wr"><input type="text" autocomplete="off" spellcheck="false" aria-label="낱말 쓰기" placeholder="여기에 낱말을 써요"><button class="btn" type="button">확인</button></div><button class="btn ghost sm hb" type="button">첫소리 힌트</button><div class="fbw"></div></div>');body.appendChild(c);
    const inp=c.querySelector('input'),hint=c.querySelector('.hint'),fb=c.querySelector('.fbw');
    function showHint(){hint.innerHTML='첫소리: <b>'+esc(chosung(W.w))+'</b> <small>('+W.w.replace(/\s/g,'').length+'글자'+(/\s/.test(W.w)?', 띄어 쓰는 곳 있음':'')+')</small>';c.querySelector('.hb').hidden=true;}
    if(P.t>=1)showHint();if(P.rev)hint.innerHTML='정답: <b class="rev">'+esc(W.w)+'</b> — 똑같이 따라 써 봐요.';
    c.querySelector('.hb').addEventListener('click',()=>{showHint();sfx.tap();});
    function check(){const v=norm(inp.value);if(!v){inp.focus();return;}
      const ok=[W.w].concat(W.alt||[]).some(a=>norm(a)===v);
      if(ok){sfx.ok();inp.disabled=true;c.querySelector('.wr button').disabled=true;
        if(P.rev){fb.innerHTML='';fb.appendChild(fbBox(true,'<b>잘 따라 썼어요.</b> 이 낱말은 뒤에서 한 번 더 나와요.','다음 문제 ▶',()=>advance(false)));}
        else{lvUp(id,phases.length===1&&P.t===0?3:2);save();fb.innerHTML='';fb.appendChild(fbBox(true,'<b>정답! '+esc(W.w)+'</b>'+(P.t?'':' · 한 번에 맞혔어요 ★'),'다음 문제 ▶',()=>advance(true)));}
        fb.querySelector('button').focus();}
      else{sfx.no();P.t++;save();c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');
        if(P.t===1){showHint();fb.innerHTML='<span class="bad">아쉬워요.</span> 첫소리 힌트를 보고 다시 써 봐요.';}
        else{P.rev=true;save();hint.innerHTML='정답: <b class="rev">'+esc(W.w)+'</b> — 똑같이 따라 써 봐요.';fb.innerHTML='<span class="bad">괜찮아요.</span> 정답을 보고 따라 쓰면, 뒤에서 한 번 더 나와요.';inp.value='';}
        inp.focus();}}
    c.querySelector('.wr button').addEventListener('click',check);
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();check();}});
    setTimeout(()=>inp.focus(),50);}
  function askTell(ti){const T=TELL[ti];body.innerHTML='';
    const c=el('<div class="wq"><small>어떤 낱말이 알맞을까요?</small><p class="def sit">'+esc(T.s)+'</p><div class="opts g2"></div></div>');body.appendChild(c);
    T.o.forEach(o=>{const b=el('<button type="button" class="opt">'+esc(WORDS[o].w)+'</button>');b.addEventListener('click',()=>{if(c.dataset.done)return;c.dataset.done=1;
      [].forEach.call(c.querySelectorAll('.opt'),x=>x.disabled=true);
      if(o===T.a){sfx.ok();b.classList.add('right');lvUp(T.a,3);save();c.appendChild(fbBox(true,'<b>맞았어요!</b> '+esc(WORDS[T.a].w)+': '+esc(WORDS[T.a].d),'다음 문제 ▶',()=>advance(true)));}
      else{sfx.no();b.classList.add('no');c.appendChild(fbBox(false,'<b>헷갈렸죠?</b><br>'+T.o.map(x=>'· <b>'+esc(WORDS[x].w)+'</b>: '+esc(WORDS[x].d)).join('<br>')+'<br><small>이 문제는 뒤에서 한 번 더 나와요.</small>','알겠어요 ▶',()=>advance(false)));}
      c.lastElementChild.querySelector('button').focus();});c.querySelector('.opts').appendChild(b);});}
  function summary(){body.innerHTML='';
    const g=el('<div class="wsum"><p><b>🔑 낱말 열쇠를 모두 열었어요!</b> 오늘 익힌 낱말이에요.</p><div class="wgrid"></div></div>');
    ids.forEach(id=>g.querySelector('.wgrid').appendChild(wordCard(id)));body.appendChild(g);
    if(!st.fullKey){const r=el('<button class="btn ghost sm" type="button">이 낱말들 한 번 더 연습하기</button>');r.addEventListener('click',()=>{S.wq[key]={ph:0,q:null,fin:false,t:0,rev:false};P=S.wq[key];save();next();});body.appendChild(r);}}
  if(P.fin){drawHead();summary();done();}else next();
};
function stars(n){let s='';for(let i=0;i<3;i++)s+=i<n?'★':'<i>★</i>';return '<span class="stars" aria-label="별 '+n+'개">'+s+'</span>';}
function wordCard(id){const W=WORDS[id],lv=S.wl[id]||0;return el('<div class="wc2'+(lv>=3?' gold':'')+'"><b>'+esc(W.w)+'</b>'+stars(lv)+'<p>'+(lv?esc(W.d):'아직 열지 않은 낱말이에요.')+'</p></div>');}

STEP.write=(box,st,done,was,ch,i)=>{
  const k=ch.id+':'+i,W=S.wr[k]||(S.wr[k]={a:false,b:false});
  box.appendChild(el('<div class="readhd ws"><div class="bk">✎</div><div><small>학습지(박물관 탐험 기록장)를 펴요</small><b>'+st.page+'쪽</b></div></div>'));
  box.appendChild(el('<p class="where">'+esc(st.where)+'</p>'));
  const paper=el('<div class="paper"></div>');box.appendChild(paper);
  st.rows.forEach(([lab,t])=>{paper.appendChild(el('<div class="wrow"><div class="wl">'+esc(lab)+'</div><div class="wt">'+blanks(t)+'</div></div>'));});
  if(st.showDebate){box.appendChild(el('<h3 class="qh">화면에서 만든 내 토론 카드 (보고 옮겨 써요)</h3>'));box.appendChild(debateCard());}
  const s1=el('<div class="wsteps"><p class="note">회색 글자는 <b>첫소리 힌트</b>예요. 학습지 칸에 연필로 써요.</p><button class="btn" type="button" id="wa">학습지에 다 썼어요 ✓</button></div>');box.appendChild(s1);
  const s2=el('<div class="wsteps" hidden><div class="box red"><b>빨간 펜 시간!</b> 화면의 <span class="redt">빨간 글자</span>와 내 학습지를 비교해요. 틀린 곳은 빨간 펜으로 고쳐 써요. (생각을 쓰는 칸은 내 생각이 들어가면 맞아요.)</div><button class="btn sun" type="button" id="wb">맞춰 보고 고쳤어요 ✓</button></div>');box.appendChild(s2);
  function stA(){paper.classList.add('rev');s1.hidden=true;s2.hidden=false;}
  function stB(){s2.querySelector('#wb').disabled=true;s2.querySelector('#wb').textContent='✓ 학습지 확인 끝';done();}
  s1.querySelector('#wa').addEventListener('click',()=>{W.a=true;save();sfx.tap();stA();s2.scrollIntoView({behavior:'smooth',block:'nearest'});});
  s2.querySelector('#wb').addEventListener('click',()=>{W.b=true;save();sfx.ok();stB();});
  if(W.a)stA();if(W.b)stB();
};
function blanks(t){return esc(t).replace(/\{([^|}]+)\|([^}]*)\}/g,(m,a,hn)=>'<span class="bl"><i>'+(hn.trim()||'&nbsp;&nbsp;&nbsp;&nbsp;')+'</i><b>'+a+'</b></span>');}

STEP.future=(box,st,done)=>{
  const F=S.future;
  box.appendChild(el('<p>할머니가 새 타임캡슐에 <b>너의 편지</b>도 함께 넣고 싶대요. 오늘 배운 낱말 가운데 <b>가장 기억에 남는 낱말 하나</b>와 <b>그 까닭</b>을 써 주세요.</p>'));
  const chips=el('<div class="wchips"></div>');box.appendChild(chips);
  ALLW.filter(k=>WORDS[k].ch!=='p0').forEach(k=>{const b=el('<button type="button" class="chip" aria-pressed="'+(F.word===WORDS[k].w)+'">'+esc(WORDS[k].w)+'</button>');b.addEventListener('click',()=>{F.word=WORDS[k].w;save();[].forEach.call(chips.children,x=>x.setAttribute('aria-pressed',String(x===b)));sfx.tap();});chips.appendChild(b);});
  const ta=el('<div><label class="note" for="fWhy">그 까닭 (한 줄)</label><textarea id="fWhy" placeholder="예) 빈부 격차 — 경제가 성장해도 모두가 똑같이 잘살게 된 건 아니라서"></textarea></div>');box.appendChild(ta);
  const t=ta.querySelector('textarea');t.value=F.why;t.addEventListener('input',()=>{F.why=t.value;save();});
  box.appendChild(el('<div class="box"><b>✎ 학습지 5쪽 맨 아래</b> 「탐험을 마치며 · 오늘 가장 기억에 남는 단어 하나와 그 까닭」 칸에도 똑같이 써요.</div>'));
  const b=el('<button class="btn sun" type="button">편지를 타임캡슐에 넣었어요 ✓</button>');box.appendChild(b);const out=el('<div></div>');box.appendChild(out);
  function show(){out.innerHTML='<div class="mycard"><b>미래에 보내는 편지</b><div>'+esc(S.num?S.num+'번 ':'')+esc(S.name)+'의 낱말: <b>'+esc(F.word)+'</b></div><div>'+esc(F.why)+'</div></div>';}
  b.addEventListener('click',()=>{if(!F.word){toast('낱말 하나를 골라요',1600);return;}if(F.why.trim().length<5){toast('까닭을 한 줄로 써 봐요',1600);t.focus();return;}F.done=true;save();sfx.ok();show();done();});
  if(F.done){show();done();}
};

STEP.piece=(box,st,done,was,ch)=>{
  const first=!S.pieces[st.n];S.pieces[st.n]=true;S.chDone[ch.id]=true;save();renderTop();
  if(st.n<6){box.appendChild(el('<div class="pc-hd'+(first?' new':'')+'"><div class="pcs">🧩</div><div><b>편지 조각 '+(st.n+1)+'을(를) 찾았어요!</b><p class="note">타임캡슐 상자 하나가 탑에 쌓였어요 (📦 '+boxCount()+'/7)</p></div></div>'));
    box.appendChild(el('<blockquote class="newline">'+esc(LETTER[st.n])+'</blockquote>'));}
  else box.appendChild(el('<div class="pc-hd new"><div class="pcs">🔓</div><div><b>타임캡슐 자물쇠가 열렸어요!</b><p class="note">편지가 모두 이어졌어요. 마지막 상자가 탑에 쌓였어요 (📦 '+boxCount()+'/7)</p></div></div>'));
  box.appendChild(letterView(false));
  box.appendChild(el('<div class="box sunny"><b>✎ 학습지 확인</b> '+esc(st.stampLine)+'</div>'));
  if(first)sfx.piece();
  const nx=CHAPTERS[chIndex(ch.id)+1];
  if(nx&&!st.last)box.appendChild(el('<p class="note">「지도로 가기」를 누르면 다음 장 <b>'+esc(nx.no+' '+nx.title)+'</b>이(가) 열려 있어요.</p>'));
  done();
};

/* 보상 탑 */
STEP.finale=(box,st,done,was)=>{
  const preview=!!st.preview;let climb=preview?7:(S.climb||0);
  const pos=i=>i<0?[40,452]:[ (i%2?190:110), 418-i*52 ];
  let svg='<svg viewBox="0 0 320 500" class="tower" role="img" aria-label="타임캡슐 상자 탑"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2747"/><stop offset="1" stop-color="#4a5f8f"/></linearGradient></defs><rect width="320" height="500" fill="url(#tg)"/>';
  for(let j=0;j<30;j++)svg+='<circle cx="'+(Math.random()*320).toFixed(0)+'" cy="'+(Math.random()*260).toFixed(0)+'" r="'+(Math.random()*1.6+.5).toFixed(1)+'" fill="#fff" opacity=".7"/>';
  svg+='<rect x="0" y="470" width="320" height="30" fill="#2f4a3a"/>';
  const lab=['1장','2장','3장','4장','5장','6장','자물쇠'];
  for(let j=0;j<7;j++){const [x,y]=pos(j),on=preview||!!S.chDone[BOXES[j]];
    svg+='<g class="tbx'+(on?'':' off')+'"><rect x="'+(x-38)+'" y="'+(y)+'" width="76" height="52" rx="5" fill="'+(on?'#c99b62':'rgba(255,255,255,.08)')+'" stroke="'+(on?'#7a5537':'#9aa6c4')+'" stroke-width="3" '+(on?'':'stroke-dasharray="6 4"')+'/><rect x="'+(x-6)+'" y="'+y+'" width="12" height="52" fill="'+(on?'#b0462f':'none')+'" opacity=".7"/><text x="'+x+'" y="'+(y+32)+'" font-size="13" text-anchor="middle" fill="#fff" font-weight="700">'+lab[j]+'</text></g>';}
  const [cx,cy]=pos(6);
  svg+='<g class="chest" transform="translate('+(cx+2)+' '+(cy-34)+') scale(.7)"><rect x="0" y="18" width="60" height="30" rx="4" fill="#b7862a" stroke="#6b4a12" stroke-width="3"/><g class="clid"><path d="M0 20 Q30 -4 60 20Z" fill="#e9b949" stroke="#6b4a12" stroke-width="3"/></g><rect x="26" y="20" width="8" height="12" fill="#6b4a12"/></g>';
  svg+='<g class="spark" opacity="0">';for(let j=0;j<14;j++){const a=j/14*Math.PI*2;svg+='<line x1="'+(cx+23+Math.cos(a)*20).toFixed(0)+'" y1="'+(cy-24+Math.sin(a)*20).toFixed(0)+'" x2="'+(cx+23+Math.cos(a)*48).toFixed(0)+'" y2="'+(cy-24+Math.sin(a)*48).toFixed(0)+'" stroke="#ffe27a" stroke-width="4" stroke-linecap="round"/>';}svg+='</g>';
  svg+='<g class="hero" style="transition:transform .55s cubic-bezier(.3,1.6,.5,1)"></g></svg>';
  const w=el('<div class="fin"><div class="tw">'+svg+'</div><div class="fside"><h3>타임캡슐 상자 탑</h3><p class="cnt"></p><button class="btn big" type="button" id="up">한 칸 오르기 ▲</button><button class="btn sun big" type="button" id="open" hidden>보물 상자 열기 ✨</button><div class="got"></div></div></div>');
  box.appendChild(w);const hero=w.querySelector('.hero'),up=w.querySelector('#up'),op=w.querySelector('#open'),got=w.querySelector('.got');
  function placeHero(){let [x,y]=pos(climb-1);if(climb>=7)x-=20;hero.innerHTML=avatarSVG(S.av,Object.assign({w:60,h:86},preview?{hat:'#5b3a25',cape:'#7b4fd1',watch:true}:avOpts())).replace('<svg','<svg x="-30" y="-86"');hero.style.transform='translate('+x+'px,'+(climb>0?y:y+18)+'px)';}
  function upd(){w.querySelector('.cnt').textContent=climb>=7?'꼭대기에 올라왔어요!':'상자 '+boxCount()+'/7 · 지금 '+climb+'층';
    up.hidden=climb>=7;op.hidden=!(climb>=7&&!S.chest&&!preview);if((S.chest&&!preview)||preview&&climb>=7&&w.dataset.opened)reward();
    up.disabled=!preview&&climb>=boxCount();}
  up.addEventListener('click',()=>{if(climb>=7)return;if(!preview&&climb>=boxCount()){toast('아직 상자가 다 쌓이지 않았어요',1600);return;}climb++;if(!preview){S.climb=climb;save();}sfx.step();placeHero();upd();});
  op.addEventListener('click',()=>{openChest();});
  function openChest(){w.classList.add('opened');w.dataset.opened=1;sfx.fan();if(!preview){S.chest=true;save();renderTop();}confetti();setTimeout(()=>{placeHero();reward();},700);op.hidden=true;}
  function reward(){w.classList.add('opened');got.innerHTML='';
    got.appendChild(el('<div class="box sunny"><b>🎩 시간 여행자 모자와 망토를 얻었어요!</b><p>이제 내 캐릭터가 어디서나 입고 다녀요. (왼쪽 위 내 캐릭터를 눌러 봐요)</p><p class="note">'+(goldCape()&&!preview?'✨ 모든 낱말이 ★★★라서 망토가 <b>금빛</b>이에요!':'★ 더 하고 싶다면: 「🔑 낱말 도감」의 연습장에서 모든 낱말을 ★★★로 만들면 망토가 <b>금빛</b>으로 바뀌어요.')+'</p></div>'));
    if(!preview){got.appendChild(certificate());done();}}
  placeHero();upd();
  if(preview){op.hidden=false;up.hidden=true;}
};
function certificate(){const d=new Date(),n3=ALLW.filter(k=>(S.wl[k]||0)>=3).length;
  return el('<div class="cert"><small>시간 여행 완주 인증서</small><h3>'+esc(S.num?S.num+'번 ':'')+esc(S.name)+'</h3><p>할머니의 찢긴 편지 여섯 조각을 모두 찾고, 타임캡슐 자물쇠를 열었어요.</p><p>학습지 3~6쪽 · 낱말 ★★★ '+n3+'/'+ALLW.length+'개 · 미래 편지 낱말 「'+esc(S.future.word)+'」</p><p class="note">'+d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 · 이 화면과 학습지를 선생님께 보여 드려요.</p></div>');}
function confetti(){const c=$('#fx');c.innerHTML='';const cols=['#e85d5d','#f2b134','#27a37a','#3d72c4','#8e5cc9','#fff'];
  for(let i=0;i<70;i++){const p=document.createElement('i');p.style.left=(Math.random()*100)+'%';p.style.background=cols[i%cols.length];p.style.animationDelay=(Math.random()*.6)+'s';p.style.animationDuration=(1.6+Math.random()*1.4)+'s';c.appendChild(p);}
  c.classList.add('on');setTimeout(()=>{c.classList.remove('on');c.innerHTML='';},3600);}

/* ---------- 낱말 도감 · 연습장 ---------- */
function openWordBook(){
  const b=el('<div><p>열쇠를 연 낱말은 뜻이 보여요. ★ 1개 = 뜻 보고 고르기, ★★ = 뜻 보고 쓰기, ★★★ = 헷갈리는 낱말 구별 또는 자물쇠에서 한 번에 쓰기.</p><div class="practice"></div><div class="wbook"></div></div>');
  const groups=[['p0','지난 시간 복습'],['c1','1장 노동 문제'],['c2','2장 빈부 격차'],['c3','3장 과소비'],['c4','4장 토론'],['c6','6장 다락방']];
  groups.forEach(([c,t])=>{const g=el('<div class="wgroup"><h3>'+t+'</h3><div class="wgrid"></div></div>');ALLW.filter(k=>WORDS[k].ch===c).forEach(k=>g.lastChild.appendChild(wordCard(k)));b.querySelector('.wbook').appendChild(g);});
  const opened=ALLW.filter(k=>(S.wl[k]||0)>=1),weak=opened.filter(k=>(S.wl[k]||0)<3);
  const pr=b.querySelector('.practice');
  if(weak.length){const pb=el('<button class="btn" type="button">✏ 연습장: ★★★가 아닌 낱말 '+weak.length+'개 연습하기</button>');pb.addEventListener('click',()=>practice(weak));pr.appendChild(pb);}
  else if(opened.length)pr.appendChild(el('<div class="box sunny">열린 낱말이 모두 ★★★예요! '+(goldCape()?'✨ 금빛 망토를 얻었어요.':'')+'</div>'));
  modal('🔑 낱말 도감',b,{wide:true});
}
function practice(ids){
  const box=modal('✏ 낱말 연습장',el('<div class="step"></div>'),{wide:true}).querySelector('.step');
  const st={t:'words',ids:ids,phases:['write','tell'],fullKey:'practice',reset:true};
  STEP.words(box,st,()=>{renderTop();if(goldCape())toast('✨ 모든 낱말 ★★★! 망토가 금빛으로 바뀌었어요',3000);},false,{id:'practice'},0);
}

/* ---------- 선생님 ---------- */
function openTeacher(){
  const b=el('<div class="teach"></div>');
  const rows=CHAPTERS.map(c=>'<li>'+(S.chDone[c.id]?'✓':'·')+' '+esc(c.no+' '+c.title)+' <small>('+((S.sd[c.id]||[]).filter(Boolean).length)+'/'+c.steps.length+'단계)</small></li>').join('');
  b.innerHTML='<p><b>'+esc(S.num?S.num+'번 ':'')+esc(S.name||'(이름 없음)')+'</b> · 편지 조각 '+pieceCount()+'/6 · 상자 '+boxCount()+'/7 · 낱말 ★★★ '+ALLW.filter(k=>(S.wl[k]||0)>=3).length+'/'+ALLW.length+' · OX 틀린 횟수 '+(S.oxWrong||0)+'</p><ul class="list">'+rows+'</ul>'+
   (S.debate.done?'<h3>토론 카드</h3>':'')+'<div class="dc"></div>'+(S.future.done?'<p><b>미래 편지:</b> '+esc(S.future.word)+' — '+esc(S.future.why)+'</p>':'')+
   '<div class="row wrap"><button class="btn ghost sm" type="button" id="tFree"></button><button class="btn ghost sm" type="button" id="tPrev">보상 탑 미리 보기</button><button class="btn ghost sm" type="button" id="tReset">이 기기 기록 지우기</button></div>'+
   '<p class="note">학생 기록은 이 크롬북에만 저장돼요. 다른 기기에서는 이어지지 않아요. 「모든 장 열기」는 이 기기에만 적용돼요.</p>';
  if(S.debate.done)b.querySelector('.dc').appendChild(debateCard());
  const fr=b.querySelector('#tFree');const lab=()=>fr.textContent=S.free?'다시 순서대로 잠그기':'모든 장 열기 (시연용)';lab();
  fr.addEventListener('click',()=>{S.free=!S.free;save();lab();if($('.map'))renderMap();});
  b.querySelector('#tPrev').addEventListener('click',()=>{const box=modal('보상 탑 미리 보기',el('<div></div>'),{wide:true}).querySelector('.mbd');STEP.finale(box.firstChild||box,{preview:true},()=>{},false);});
  b.querySelector('#tReset').addEventListener('click',e=>{const t=e.target;if(!t.dataset.sure){t.dataset.sure=1;t.textContent='정말 지울까요? 한 번 더 누르면 지워져요';return;}try{localStorage.removeItem(KEY);}catch(_){}location.reload();});
  modal('선생님 창',b,{wide:true});
}

/* ---------- 시작 ---------- */
function teachLink(){const b=el('<button class="teachBtn" type="button">선생님 창</button>');b.addEventListener('click',openTeacher);return b;}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
renderTop();
if(!S.name)renderStart();else renderMap();
