/* 그림: 인물 얼굴, 몸, 아바타, 장면 배경 (모두 SVG로 새로 그림) */

function face(L,size){
  size=size||84;const W=100;
  let s='<svg viewBox="0 0 100 100" width="'+size+'" height="'+size+'" aria-hidden="true">';
  s+='<circle cx="50" cy="50" r="50" fill="'+(L.bg||'#f4ede2')+'"/>';
  s+='<ellipse cx="50" cy="104" rx="36" ry="30" fill="'+L.shirt+'"/>';
  if(L.vest)s+='<rect x="20" y="82" width="60" height="20" fill="'+L.vest+'"/><rect x="20" y="88" width="60" height="4" fill="#eee"/>';
  if(L.tie)s+='<path d="M47 76 L53 76 L55 98 L45 98Z" fill="'+L.tie+'"/>';
  if(L.bob)s+='<ellipse cx="50" cy="52" rx="31" ry="31" fill="'+L.hair+'"/>';
  if(L.long)s+='<path d="M24 46 Q22 82 30 86 L70 86 Q78 82 76 46Z" fill="'+L.hair+'"/>';
  s+='<circle cx="50" cy="48" r="24" fill="'+L.skin+'"/>';
  const top=L.kerchief?'#ffffff':L.cap?L.cap:L.hair;
  s+='<path d="M25 46 A25.5 25.5 0 0 1 75 46 Z" fill="'+top+'"/>';
  if(L.cap)s+='<rect x="46" y="40" width="32" height="5" rx="2" fill="'+L.cap+'"/>';
  if(L.kerchief)s+='<path d="M72 40 l8 6 l-9 2z" fill="#fff"/>';
  if(L.bun)s+='<circle cx="50" cy="20" r="8" fill="'+L.hair+'"/>';
  if(L.glasses)s+='<circle cx="41" cy="49" r="6" fill="none" stroke="#333" stroke-width="1.6"/><circle cx="59" cy="49" r="6" fill="none" stroke="#333" stroke-width="1.6"/><path d="M47 49h6" stroke="#333" stroke-width="1.6"/>';
  s+='<ellipse cx="41.5" cy="49" rx="2.2" ry="3" fill="#2b221c"/><ellipse cx="58.5" cy="49" rx="2.2" ry="3" fill="#2b221c"/>';
  s+='<ellipse cx="35" cy="56" rx="3.5" ry="2.2" fill="#f3a9a0"/><ellipse cx="65" cy="56" rx="3.5" ry="2.2" fill="#f3a9a0"/>';
  s+='<path d="M44 57 Q50 63 56 57" stroke="#7a3b2e" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  return s+'</svg>';
}

function clockFace(size,mood){
  size=size||84;
  let s='<svg viewBox="0 0 100 100" width="'+size+'" height="'+size+'" aria-hidden="true">';
  s+='<circle cx="50" cy="50" r="50" fill="#fff4cf"/>';
  s+='<rect x="44" y="6" width="12" height="9" rx="3" fill="#c9962b"/><circle cx="50" cy="6" r="5" fill="none" stroke="#c9962b" stroke-width="3"/>';
  s+='<circle cx="50" cy="55" r="36" fill="#e9b949" stroke="#b7862a" stroke-width="4"/>';
  s+='<circle cx="50" cy="55" r="29" fill="#fffbea"/>';
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x1=50+Math.sin(a)*25,y1=55-Math.cos(a)*25,x2=50+Math.sin(a)*28,y2=55-Math.cos(a)*28;s+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="#b7862a" stroke-width="2"/>';}
  s+='<ellipse cx="41" cy="52" rx="3.2" ry="4.4" fill="#2b221c"/><ellipse cx="59" cy="52" rx="3.2" ry="4.4" fill="#2b221c"/>';
  s+='<ellipse cx="35" cy="62" rx="4" ry="2.4" fill="#f3a9a0"/><ellipse cx="65" cy="62" rx="4" ry="2.4" fill="#f3a9a0"/>';
  s+='<path d="M43 64 Q50 71 57 64" stroke="#7a3b2e" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  s+='<line x1="50" y1="55" x2="50" y2="34" stroke="#c0392b" stroke-width="2.4" stroke-linecap="round"/>';
  return s+'</svg>';
}

function portrait(who,size){const p=PEOPLE[who];if(!p)return '';return p.clock?clockFace(size):face(p.look,size);}

/* 서 있는 사람(장면용). x=가운데, y=발바닥, s=크기 */
function figure(L,x,y,s){
  s=s||1;const k=L.kid?0.78:1;s*=k;
  let g='<g transform="translate('+x+' '+y+') scale('+s+')">';
  g+='<ellipse cx="0" cy="0" rx="20" ry="4" fill="rgba(0,0,0,.18)"/>';
  g+='<rect x="-11" y="-46" width="9" height="46" rx="4" fill="'+L.pants+'"/><rect x="2" y="-46" width="9" height="46" rx="4" fill="'+L.pants+'"/>';
  g+='<rect x="-17" y="-96" width="34" height="56" rx="12" fill="'+L.shirt+'"/>';
  if(L.vest)g+='<rect x="-17" y="-92" width="34" height="40" rx="8" fill="'+L.vest+'" opacity=".95"/><rect x="-17" y="-70" width="34" height="5" fill="#f4f4f4"/>';
  if(L.tie)g+='<path d="M-3 -94 L3 -94 L5 -62 L0 -56 L-5 -62Z" fill="'+L.tie+'"/>';
  g+='<rect x="-25" y="-92" width="9" height="40" rx="4.5" fill="'+L.shirt+'"/><rect x="16" y="-92" width="9" height="40" rx="4.5" fill="'+L.shirt+'"/>';
  g+='<circle cx="-20.5" cy="-50" r="5" fill="'+L.skin+'"/><circle cx="20.5" cy="-50" r="5" fill="'+L.skin+'"/>';
  if(L.bob)g+='<ellipse cx="0" cy="-118" rx="22" ry="22" fill="'+L.hair+'"/>';
  if(L.long)g+='<path d="M-19 -122 Q-21 -94 -14 -90 L14 -90 Q21 -94 19 -122Z" fill="'+L.hair+'"/>';
  g+='<circle cx="0" cy="-118" r="18" fill="'+L.skin+'"/>';
  const top=L.kerchief?'#ffffff':L.cap?L.cap:L.hair;
  g+='<path d="M-19 -120 A19 19 0 0 1 19 -120 Z" fill="'+top+'"/>';
  if(L.cap)g+='<rect x="-2" y="-124" width="25" height="4" rx="2" fill="'+L.cap+'"/>';
  if(L.bun)g+='<circle cx="0" cy="-140" r="7" fill="'+L.hair+'"/>';
  g+='<circle cx="-6.5" cy="-117" r="2.1" fill="#2b221c"/><circle cx="6.5" cy="-117" r="2.1" fill="#2b221c"/>';
  g+='<path d="M-5 -110 Q0 -106 5 -110" stroke="#7a3b2e" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  return g+'</g>';
}

/* 아이 아바타 (모자·망토 보상 포함) */
const AV_OPT={
  skin:['#f6d7bd','#e8bf98','#c99a72'],
  hair:['#2b2018','#6b4a2f','#121212','#a0522d'],
  style:['short','long','bun'],
  shirt:['#e85d5d','#3d72c4','#27a37a','#f2b134','#8e5cc9']
};
function avatarSVG(av,o){
  o=o||{};av=av||{skin:0,hair:0,style:0,shirt:1};
  const skin=AV_OPT.skin[av.skin],hair=AV_OPT.hair[av.hair],shirt=AV_OPT.shirt[av.shirt],st=AV_OPT.style[av.style];
  const w=o.w||120,h=o.h||170;
  let s='<svg viewBox="-60 -170 120 175" width="'+w+'" height="'+h+'" aria-hidden="true" class="avsvg">';
  if(o.cape){s+='<path d="M-18 -92 Q-34 -40 -30 -6 L30 -6 Q34 -40 18 -92Z" fill="'+o.cape+'"/><path d="M-18 -92 Q0 -84 18 -92" stroke="rgba(0,0,0,.2)" stroke-width="2" fill="none"/>';}
  s+='<ellipse cx="0" cy="0" rx="22" ry="4" fill="rgba(0,0,0,.15)"/>';
  s+='<rect x="-11" y="-44" width="9" height="44" rx="4" fill="#3a4a5c"/><rect x="2" y="-44" width="9" height="44" rx="4" fill="#3a4a5c"/>';
  s+='<rect x="-13" y="-6" width="12" height="6" rx="3" fill="#222"/><rect x="1" y="-6" width="12" height="6" rx="3" fill="#222"/>';
  s+='<rect x="-17" y="-92" width="34" height="54" rx="12" fill="'+shirt+'"/>';
  s+='<rect x="-25" y="-88" width="9" height="38" rx="4.5" fill="'+shirt+'"/><rect x="16" y="-88" width="9" height="38" rx="4.5" fill="'+shirt+'"/>';
  s+='<circle cx="-20.5" cy="-48" r="5" fill="'+skin+'"/><circle cx="20.5" cy="-48" r="5" fill="'+skin+'"/>';
  if(o.watch)s+='<circle cx="0" cy="-74" r="6" fill="#e9b949" stroke="#b7862a" stroke-width="1.5"/><path d="M0 -77v3h2" stroke="#7a3b2e" stroke-width="1.2" fill="none"/>';
  if(st==='long')s+='<path d="M-20 -120 Q-23 -88 -15 -84 L15 -84 Q23 -88 20 -120Z" fill="'+hair+'"/>';
  s+='<circle cx="0" cy="-116" r="19" fill="'+skin+'"/>';
  s+='<path d="M-20 -118 A20 20 0 0 1 20 -118 Q12 -128 0 -126 Q-12 -128 -20 -118Z" fill="'+hair+'"/>';
  if(st==='bun')s+='<circle cx="0" cy="-139" r="7.5" fill="'+hair+'"/>';
  s+='<circle cx="-6.5" cy="-114" r="2.2" fill="#2b221c"/><circle cx="6.5" cy="-114" r="2.2" fill="#2b221c"/>';
  s+='<ellipse cx="-11" cy="-107" rx="3" ry="1.8" fill="#f3a9a0"/><ellipse cx="11" cy="-107" rx="3" ry="1.8" fill="#f3a9a0"/>';
  s+='<path d="M-5 -106 Q0 -101 5 -106" stroke="#7a3b2e" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  if(o.hat){const hc=o.hat;
    s+='<ellipse cx="0" cy="-131" rx="27" ry="6" fill="'+hc+'"/><rect x="-16" y="-158" width="32" height="27" rx="5" fill="'+hc+'"/>';
    s+='<rect x="-16" y="-138" width="32" height="6" fill="#c0392b"/><circle cx="9" cy="-146" r="6.5" fill="#f7d36b" stroke="#b7862a" stroke-width="1.5"/><path d="M9 -150v4h3" stroke="#7a3b2e" stroke-width="1.3" fill="none"/>';
    if(o.feather)s+='<path d="M-12 -150 Q-30 -172 -6 -168 Q-14 -160 -12 -150Z" fill="'+o.feather+'"/>';}
  return s+'</svg>';
}

/* ---------- 장면 배경 (800 x 240) ---------- */
function rnd(seed){let t=seed;return()=>{t=(t*9301+49297)%233280;return t/233280;};}
function sceneSVG(id,people){
  let s='<svg viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" class="scn" aria-hidden="true">';
  const r=rnd(id.length*97+13);
  if(id==='hill'){
    s+='<defs><linearGradient id="skH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3f5"/><stop offset="1" stop-color="#fdf1d6"/></linearGradient></defs>';
    s+='<rect width="800" height="240" fill="url(#skH)"/>';
    s+='<path d="M0 170 Q200 120 420 160 T800 150 V240 H0Z" fill="#a9cf7f"/><path d="M0 200 Q300 170 800 200 V240 H0Z" fill="#8fbe63"/>';
    s+='<g transform="translate(560 70)"><rect x="0" y="40" width="170" height="80" fill="#f4ead8" stroke="#b8a27f" stroke-width="3"/><path d="M-12 42 L85 0 L182 42Z" fill="#c25b3f"/>';
    for(let i=0;i<5;i++)s+='<rect x="'+(14+i*32)+'" y="58" width="12" height="60" fill="#e2d4b9"/>';
    s+='<text x="85" y="34" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">박물관</text></g>';
    [[90,150],[150,140],[700,160]].forEach(([x,y])=>{s+='<rect x="'+(x-5)+'" y="'+(y-10)+'" width="10" height="40" fill="#7a5537"/><circle cx="'+x+'" cy="'+(y-30)+'" r="34" fill="#f2c13d"/><circle cx="'+(x-18)+'" cy="'+(y-18)+'" r="22" fill="#f6cf56"/><circle cx="'+(x+20)+'" cy="'+(y-16)+'" r="20" fill="#e8b22c"/>';});
    s+='<ellipse cx="400" cy="205" rx="80" ry="16" fill="#7a5537"/><g id="capB"><rect x="360" y="170" width="80" height="44" rx="6" fill="#8a6a45" stroke="#5e4630" stroke-width="3"/><rect x="392" y="182" width="16" height="12" rx="2" fill="#e9b949"/></g>';
    for(let i=0;i<14;i++){const x=r()*800,y=40+r()*90;s+='<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="5" ry="3" fill="#f2b33d" opacity=".8" transform="rotate('+(r()*90).toFixed(0)+' '+x.toFixed(0)+' '+y.toFixed(0)+')"/>';}
  }
  else if(id==='factory'){
    s+='<rect width="800" height="240" fill="#4b4740"/><rect y="170" width="800" height="70" fill="#38342e"/>';
    for(let i=0;i<4;i++)s+='<rect x="'+(60+i*190)+'" y="18" width="110" height="10" rx="4" fill="#efe9c9" opacity=".9"/><rect x="'+(60+i*190)+'" y="28" width="110" height="40" fill="#efe9c9" opacity=".08"/>';
    s+='<rect x="660" y="60" width="90" height="60" fill="#6f7c86"/><path d="M660 90h90M705 60v60" stroke="#4b4740" stroke-width="5"/>';
    for(let row=0;row<2;row++)for(let i=0;i<5;i++){const x=40+i*130+row*40,y=140+row*45;
      s+='<rect x="'+x+'" y="'+y+'" width="96" height="12" fill="#6b4f35"/><rect x="'+(x+10)+'" y="'+(y-26)+'" width="44" height="26" rx="5" fill="#2f3337"/><rect x="'+(x+46)+'" y="'+(y-36)+'" width="10" height="36" rx="3" fill="#2f3337"/><circle cx="'+(x+20)+'" cy="'+(y-14)+'" r="5" fill="#9aa3a8"/>';
      s+='<rect x="'+(x+60)+'" y="'+(y-10)+'" width="28" height="10" fill="'+['#e6dfcc','#c9d6e8','#e9c6c6'][(i+row)%3]+'"/>';}
    for(let i=0;i<40;i++)s+='<circle cx="'+(r()*800).toFixed(0)+'" cy="'+(r()*170).toFixed(0)+'" r="'+(1+r()*2).toFixed(1)+'" fill="#d8d0b8" opacity=".35"/>';
    s+='<text x="740" y="150" font-size="12" fill="#d8d0b8" text-anchor="end">1975</text>';
  }
  else if(id==='winter'){
    s+='<rect width="800" height="240" fill="#2a3550"/>';
    for(let i=0;i<7;i++){const x=i*120-10,hgt=90+r()*70;s+='<rect x="'+x+'" y="'+(180-hgt)+'" width="104" height="'+hgt+'" fill="#3a4766"/>';
      for(let j=0;j<6;j++)for(let k=0;k<3;k++)if(r()>.45)s+='<rect x="'+(x+12+k*30)+'" y="'+(190-hgt+j*16)+'" width="14" height="8" fill="#f6e3a1" opacity=".75"/>';}
    s+='<rect y="180" width="800" height="60" fill="#e9eef5"/>';
    s+='<g transform="translate(70 110)"><rect width="150" height="80" fill="#7c4a2d"/><rect x="-10" y="-14" width="170" height="16" fill="#a7462f"/><rect x="10" y="12" width="56" height="58" fill="#f7f4ea"/><rect x="74" y="12" width="66" height="58" fill="#f7f4ea"/>';
    s+='<text x="38" y="30" font-size="10" fill="#111" text-anchor="middle" font-weight="700">경제 위기</text><text x="107" y="30" font-size="9" fill="#111" text-anchor="middle" font-weight="700">회사 줄줄이</text><text x="107" y="42" font-size="9" fill="#111" text-anchor="middle" font-weight="700">문 닫아</text></g>';
    for(let i=0;i<70;i++)s+='<circle class="snow" cx="'+(r()*800).toFixed(0)+'" cy="'+(r()*240).toFixed(0)+'" r="'+(1+r()*2.4).toFixed(1)+'" fill="#fff" opacity=".85"/>';
  }
  else if(id==='clothes'){
    s+='<rect width="800" height="240" fill="#cfc8bb"/><path d="M0 40 L400 0 L800 40 V60 H0Z" fill="#9a8f7f"/>';
    for(let i=0;i<9;i++)s+='<rect x="'+(i*90+10)+'" y="40" width="6" height="200" fill="#8b8172"/>';
    s+='<rect y="200" width="800" height="40" fill="#8f877a"/>';
    const cols=['#e85d5d','#3d72c4','#f2b134','#27a37a','#8e5cc9','#f08bb4','#ffffff','#444','#6fc3e0','#c97a3a'];
    for(let i=0;i<260;i++){const t=r(),x=200+(r()-.5)*560*(1-t*0.7),y=210-t*150;
      s+='<rect x="'+x.toFixed(0)+'" y="'+y.toFixed(0)+'" width="'+(14+r()*20).toFixed(0)+'" height="'+(8+r()*10).toFixed(0)+'" rx="3" fill="'+cols[(r()*cols.length)|0]+'" transform="rotate('+((r()-.5)*60).toFixed(0)+' '+x.toFixed(0)+' '+y.toFixed(0)+')"/>';}
    s+='<g transform="translate(640 150)"><rect width="80" height="56" fill="#2d6a4f"/><text x="40" y="34" font-size="12" fill="#fff" text-anchor="middle">수거함</text></g>';
  }
  else if(id==='rain'){
    s+='<rect width="800" height="240" fill="#dfe6ee"/><rect y="0" width="800" height="120" fill="#9fb1c4"/>';
    for(let i=0;i<5;i++)s+='<rect x="'+(20+i*160)+'" y="10" width="140" height="104" fill="#b9c8d8" stroke="#7f93a8" stroke-width="4"/>';
    for(let i=0;i<90;i++){const x=r()*800,y=r()*110;s+='<line class="rain" x1="'+x.toFixed(0)+'" y1="'+y.toFixed(0)+'" x2="'+(x-4).toFixed(0)+'" y2="'+(y+14).toFixed(0)+'" stroke="#e8f1fb" stroke-width="1.5"/>';}
    s+='<rect y="120" width="800" height="8" fill="#6e7f90"/><rect y="200" width="800" height="40" fill="#c4ccd4"/>';
    s+='<g transform="translate(250 112)"><rect x="-6" y="0" width="300" height="20" rx="4" fill="#2a66a8"/><text x="144" y="15" font-size="13" fill="#fff" text-anchor="middle" font-weight="700">우산 비닐 커버 문제의 해결 방안 토론회</text></g>';
    s+='<rect x="220" y="160" width="380" height="16" rx="5" fill="#8a5a3a"/><rect x="230" y="176" width="10" height="30" fill="#6b4329"/><rect x="580" y="176" width="10" height="30" fill="#6b4329"/>';
    ['국회','기업','시민 단체','개인'].forEach((t,i)=>{s+='<rect x="'+(250+i*88)+'" y="146" width="62" height="16" rx="3" fill="#fff"/><text x="'+(281+i*88)+'" y="158" font-size="10" text-anchor="middle" fill="#333">'+t+'</text>';});
    s+='<g transform="translate(60 150)"><rect width="70" height="56" fill="#9aa8b6"/>';for(let i=0;i<12;i++)s+='<path d="M'+(8+(i%6)*10)+' '+(-8-((i/6)|0)*8)+' l6 22" stroke="#e8f4ff" stroke-width="5" opacity=".9"/>';s+='<text x="35" y="36" font-size="10" fill="#fff" text-anchor="middle">비닐 커버</text></g>';
  }
  else if(id==='street'){
    s+='<defs><linearGradient id="skS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7a26b"/><stop offset="1" stop-color="#fde3b5"/></linearGradient></defs>';
    s+='<rect width="800" height="240" fill="url(#skS)"/><circle cx="640" cy="90" r="34" fill="#ffd27a"/>';
    for(let i=0;i<9;i++){const hgt=60+r()*60;s+='<rect x="'+(i*92)+'" y="'+(150-hgt)+'" width="80" height="'+hgt+'" fill="#c98a6a" opacity=".6"/>';}
    s+='<rect y="150" width="800" height="90" fill="#9cc77a"/><path d="M0 200 Q400 160 800 205" stroke="#e8d5a8" stroke-width="26" fill="none"/>';
    const bc=['#c9a99a','#8fd3c7','#e9c25e','#f2a2b4','#8cc3f0','#c6a8e6'];
    bc.forEach((c,i)=>{const x=40+i*125,y=150+((i%2)*14);s+='<g class="bin" data-i="'+i+'"><rect x="'+x+'" y="'+y+'" width="74" height="54" rx="6" fill="'+c+'" stroke="rgba(0,0,0,.2)"/><rect x="'+(x-4)+'" y="'+(y-8)+'" width="82" height="10" rx="3" fill="'+c+'" stroke="rgba(0,0,0,.25)"/><text x="'+(x+37)+'" y="'+(y+34)+'" font-size="16" text-anchor="middle" fill="#333" font-weight="700">'+(i+1)+'</text></g>';});
  }
  else if(id==='attic'){
    s+='<rect width="800" height="240" fill="#6e4b32"/><path d="M0 0 L400 -60 L800 0 V240 H0Z" fill="#7d573b"/>';
    for(let i=0;i<6;i++)s+='<path d="M'+(i*160-40)+' 0 L'+(i*160+80)+' 240" stroke="#5a3c27" stroke-width="10"/>';
    s+='<circle cx="400" cy="70" r="44" fill="#ffe7a8" stroke="#4a3020" stroke-width="8"/><path d="M400 26v88M356 70h88" stroke="#4a3020" stroke-width="5"/>';
    s+='<rect y="196" width="800" height="44" fill="#4a3020"/>';
    ['A','B','C','D','E'].forEach((t,i)=>{const x=120+i*120,y=150;s+='<g class="abox" data-i="'+i+'"><rect x="'+x+'" y="'+y+'" width="76" height="52" rx="4" fill="#c99b62" stroke="#7a5537" stroke-width="3"/><rect x="'+(x+30)+'" y="'+(y-2)+'" width="16" height="56" fill="#b0462f" opacity=".7"/><text x="'+(x+38)+'" y="'+(y+34)+'" font-size="20" text-anchor="middle" fill="#fff" font-weight="700">'+t+'</text></g>';});
    for(let i=0;i<30;i++)s+='<circle cx="'+(330+r()*140).toFixed(0)+'" cy="'+(40+r()*140).toFixed(0)+'" r="1.5" fill="#fff6d6" opacity=".6"/>';
  }
  else if(id==='night'){
    s+='<rect width="800" height="240" fill="#1d2747"/>';
    for(let i=0;i<80;i++)s+='<circle cx="'+(r()*800).toFixed(0)+'" cy="'+(r()*150).toFixed(0)+'" r="'+(0.6+r()*1.6).toFixed(1)+'" fill="#fff" opacity="'+(0.4+r()*0.6).toFixed(2)+'"/>';
    s+='<circle cx="120" cy="60" r="26" fill="#fff4c9"/><circle cx="132" cy="54" r="24" fill="#1d2747"/>';
    s+='<path d="M0 180 Q260 130 520 170 T800 160 V240 H0Z" fill="#2f4a3a"/><ellipse cx="400" cy="208" rx="80" ry="15" fill="#4a3424"/>';
    s+='<g transform="translate(360 168)"><rect width="80" height="44" rx="6" fill="#8a6a45" stroke="#e9b949" stroke-width="3"/><circle cx="40" cy="20" r="9" fill="#e9b949"/><rect x="36" y="20" width="8" height="12" fill="#e9b949"/></g>';
  }
  (people||[]).forEach((p,i,a)=>{const L=PEOPLE[p].look;if(!L)return;const x=a.length===1?690:600+i*90;s+=figure(L,x,id==='hill'||id==='night'?200:220,a.length===1?1.05:0.95);});
  return s+'</svg>';
}
