(() => {
  'use strict';

  const FAST={speed:1.04,pass:.98,shot:.98}, PASS={speed:.98,pass:1.04,shot:.98};
  const SHOT={speed:.98,pass:.98,shot:1.04}, BALANCED={speed:1,pass:1,shot:1};
  const TEAM_PROFILES = {
    '아르헨티나': {rating:{speed:1,pass:1.02,shot:1.04},kit:{primary:'#8ecdf4',secondary:'#ffffff',shorts:'#111111',socks:'#ffffff',trim:'#ffffff',gkPrimary:'#52c46b'}},
    '브라질': {rating:{speed:1.04,pass:1,shot:1.02},kit:{primary:'#f7d927',secondary:'#1e8f4d',shorts:'#2457a6',socks:'#ffffff',trim:'#1e8f4d',gkPrimary:'#5b5b5b'}},
    '프랑스': {rating:{speed:1.03,pass:.99,shot:1.03},kit:{primary:'#244ea8',secondary:'#ffffff',shorts:'#183a7b',socks:'#d93a47',trim:'#ffffff',gkPrimary:'#f0a536'}},
    '독일': {rating:{speed:.98,pass:1.04,shot:.99},kit:{primary:'#f4f4f4',secondary:'#171717',shorts:'#171717',socks:'#f4f4f4',trim:'#d7b445',gkPrimary:'#49a061'}},
    '스페인': {rating:{speed:.98,pass:1.05,shot:.97},kit:{primary:'#c92d35',secondary:'#f0c83f',shorts:'#243a74',socks:'#c92d35',trim:'#f0c83f',gkPrimary:'#72a94c'}},
    '포르투갈': {rating:{speed:1.01,pass:.98,shot:1.05},kit:{primary:'#b61f33',secondary:'#236c43',shorts:'#2f6245',socks:'#b61f33',trim:'#e6c84c',gkPrimary:'#d7d7d7'}},
    '대한민국': {rating:{speed:1.03,pass:1.01,shot:1.00},kit:{primary:'#e7263f',secondary:'#111111',shorts:'#e7263f',socks:'#e7263f',trim:'#ffffff',gkPrimary:'#f2c534'}},
    '일본': {rating:{speed:1.02,pass:1.03,shot:.99},kit:{primary:'#2450a4',secondary:'#ffffff',shorts:'#173a7c',socks:'#2450a4',trim:'#ffffff',gkPrimary:'#f2c534'}},
    '잉글랜드': {rating:{speed:.99,pass:1,shot:1.03},kit:{primary:'#f5f5f5',secondary:'#233b70',shorts:'#233b70',socks:'#f5f5f5',trim:'#d94752',gkPrimary:'#5a8f5a'}},
    '크로아티아': {rating:PASS,kit:{primary:'#f5f5f5',secondary:'#d8464b',shorts:'#28519a',socks:'#ffffff',trim:'#d8464b',gkPrimary:'#5a8f5a'}},
    '네덜란드': {rating:FAST,kit:{primary:'#ef7a26',secondary:'#111111',shorts:'#ef7a26',socks:'#ef7a26',trim:'#111111',gkPrimary:'#58a764'}},
    '우루과이': {rating:SHOT,kit:{primary:'#79c5ed',secondary:'#111111',shorts:'#111111',socks:'#79c5ed',trim:'#ffffff',gkPrimary:'#e8c640'}},
    '벨기에': {rating:SHOT,kit:{primary:'#d73c43',secondary:'#111111',shorts:'#111111',socks:'#d73c43',trim:'#e8c43b',gkPrimary:'#5a8f5a'}},
    '이탈리아': {rating:PASS,kit:{primary:'#2f69bd',secondary:'#ffffff',shorts:'#ffffff',socks:'#2f69bd',trim:'#ffffff',gkPrimary:'#5a8f5a'}},
    '미국': {rating:BALANCED,kit:{primary:'#f1f3f8',secondary:'#d53b4c',shorts:'#233d78',socks:'#f1f3f8',trim:'#233d78',gkPrimary:'#e7a843'}},
    '멕시코': {rating:PASS,kit:{primary:'#25804c',secondary:'#ffffff',shorts:'#f1f1e8',socks:'#c64043',trim:'#c64043',gkPrimary:'#e4bd43'}},
    '캐나다': {rating:FAST,kit:{primary:'#d83f4a',secondary:'#ffffff',shorts:'#d83f4a',socks:'#d83f4a',trim:'#ffffff',gkPrimary:'#e6b74c'}},
    '콜롬비아': {rating:SHOT,kit:{primary:'#e8c53c',secondary:'#203c75',shorts:'#203c75',socks:'#d94d4d',trim:'#d94d4d',gkPrimary:'#7654b9'}},
    '칠레': {rating:BALANCED,kit:{primary:'#da4148',secondary:'#ffffff',shorts:'#234581',socks:'#f5f5f5',trim:'#ffffff',gkPrimary:'#e6b74c'}},
    '스위스': {rating:PASS,kit:{primary:'#d94349',secondary:'#ffffff',shorts:'#f5f5f5',socks:'#d94349',trim:'#ffffff',gkPrimary:'#7663b9'}},
    '스웨덴': {rating:PASS,kit:{primary:'#e9c746',secondary:'#2f67ab',shorts:'#2f67ab',socks:'#e9c746',trim:'#2f67ab',gkPrimary:'#8952aa'}},
    '덴마크': {rating:BALANCED,kit:{primary:'#cf3c46',secondary:'#ffffff',shorts:'#ffffff',socks:'#cf3c46',trim:'#ffffff',gkPrimary:'#eba643'}},
    '노르웨이': {rating:FAST,kit:{primary:'#d5444d',secondary:'#224279',shorts:'#f5f5f5',socks:'#224279',trim:'#ffffff',gkPrimary:'#e6bb48'}},
    '폴란드': {rating:SHOT,kit:{primary:'#f5f4f0',secondary:'#d8474e',shorts:'#d8474e',socks:'#f5f4f0',trim:'#d8474e',gkPrimary:'#7959b6'}},
    '튀르키예': {rating:SHOT,kit:{primary:'#d7434b',secondary:'#ffffff',shorts:'#d7434b',socks:'#d7434b',trim:'#ffffff',gkPrimary:'#e4b84a'}},
    '모로코': {rating:FAST,kit:{primary:'#c93e47',secondary:'#268555',shorts:'#268555',socks:'#c93e47',trim:'#f1e4b4',gkPrimary:'#e4b84a'}},
    '세네갈': {rating:FAST,kit:{primary:'#f1f1e8',secondary:'#33945d',shorts:'#f1f1e8',socks:'#33945d',trim:'#e3bd45',gkPrimary:'#8d58b6'}},
    '나이지리아': {rating:FAST,kit:{primary:'#3ba470',secondary:'#ffffff',shorts:'#f5f5ee',socks:'#3ba470',trim:'#ffffff',gkPrimary:'#e2b144'}},
    '가나': {rating:SHOT,kit:{primary:'#f3f1e4',secondary:'#d74c4d',shorts:'#f3f1e4',socks:'#f3f1e4',trim:'#e7bf4e',gkPrimary:'#7654b9'}},
    '카메룬': {rating:SHOT,kit:{primary:'#27844d',secondary:'#d64648',shorts:'#d64648',socks:'#e2c149',trim:'#e2c149',gkPrimary:'#8255ad'}},
    '이집트': {rating:PASS,kit:{primary:'#cf3e47',secondary:'#f3f2ec',shorts:'#1d2733',socks:'#1d2733',trim:'#f3f2ec',gkPrimary:'#e4bd48'}},
    '남아공': {rating:FAST,kit:{primary:'#e8c746',secondary:'#27834e',shorts:'#27834e',socks:'#e8c746',trim:'#27834e',gkPrimary:'#8058b4'}},
    '호주': {rating:FAST,kit:{primary:'#edc83d',secondary:'#27824f',shorts:'#27824f',socks:'#edc83d',trim:'#27824f',gkPrimary:'#7d5db4'}},
    '이란': {rating:PASS,kit:{primary:'#f3f2eb',secondary:'#3a9a6a',shorts:'#f3f2eb',socks:'#f3f2eb',trim:'#d6494c',gkPrimary:'#e6b84a'}},
    '사우디': {rating:PASS,kit:{primary:'#f2f3ec',secondary:'#278453',shorts:'#f2f3ec',socks:'#f2f3ec',trim:'#278453',gkPrimary:'#ddae45'}},
    '카타르': {rating:BALANCED,kit:{primary:'#923a5c',secondary:'#f4f0eb',shorts:'#923a5c',socks:'#923a5c',trim:'#f4f0eb',gkPrimary:'#deb746'}},
    '코스타리카': {rating:FAST,kit:{primary:'#d4454b',secondary:'#24467f',shorts:'#24467f',socks:'#f3f2eb',trim:'#f3f2eb',gkPrimary:'#e0b646'}},
    '에콰도르': {rating:SHOT,kit:{primary:'#e8c539',secondary:'#284f94',shorts:'#284f94',socks:'#d4494a',trim:'#d4494a',gkPrimary:'#8356b4'}},
    '파라과이': {rating:BALANCED,kit:{primary:'#f3f2eb',secondary:'#d34d55',shorts:'#244984',socks:'#244984',trim:'#d34d55',gkPrimary:'#e2b647'}},
    '베네수엘라': {rating:PASS,kit:{primary:'#9a3e5c',secondary:'#e6c64d',shorts:'#9a3e5c',socks:'#9a3e5c',trim:'#e6c64d',gkPrimary:'#4e9e6c'}},
    '세르비아': {rating:SHOT,kit:{primary:'#d44950',secondary:'#f5f2ed',shorts:'#244580',socks:'#f5f2ed',trim:'#f5f2ed',gkPrimary:'#e2b74b'}},
    '우크라이나': {rating:FAST,kit:{primary:'#e6c944',secondary:'#2a75ba',shorts:'#2a75ba',socks:'#e6c944',trim:'#2a75ba',gkPrimary:'#8058b5'}},
    '그리스': {rating:PASS,kit:{primary:'#f3f4f2',secondary:'#3380c4',shorts:'#3380c4',socks:'#f3f4f2',trim:'#3380c4',gkPrimary:'#e7b84b'}},
    '오스트리아': {rating:BALANCED,kit:{primary:'#d5484d',secondary:'#f5f3ee',shorts:'#f5f3ee',socks:'#d5484d',trim:'#f5f3ee',gkPrimary:'#e2b249'}},
    '체코': {rating:SHOT,kit:{primary:'#d44950',secondary:'#2b5599',shorts:'#2b5599',socks:'#d44950',trim:'#f4f1eb',gkPrimary:'#e4b64c'}},
    '슬로베니아': {rating:PASS,kit:{primary:'#f3f3ee',secondary:'#4b95c7',shorts:'#4b95c7',socks:'#f3f3ee',trim:'#4b95c7',gkPrimary:'#e1b448'}},
    '자메이카': {rating:FAST,kit:{primary:'#e8c846',secondary:'#168a56',shorts:'#151b1c',socks:'#e8c846',trim:'#151b1c',gkPrimary:'#8356b4'}},
    '아이슬란드': {rating:BALANCED,kit:{primary:'#3376c1',secondary:'#f2f2ed',shorts:'#3376c1',socks:'#3376c1',trim:'#d44950',gkPrimary:'#e2b54b'}}
  };

  function colorDistance(a,b) {
    const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
    const x=rgb(a),y=rgb(b);
    return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);
  }

  function awayKitFor(kit) {
    const light=colorDistance(kit.primary,'#ffffff')<colorDistance(kit.primary,'#20335d');
    const base=light?'#20335d':'#f5f3ed';
    return {primary:base,secondary:kit.primary,shorts:base,socks:base,trim:light?'#f5f3ed':'#20335d',gkPrimary:kit.gkPrimary};
  }

  function matchKits(home,away) {
    const first=home.kit;
    const second=colorDistance(first.primary,away.kit.primary)<125?away.awayKit:away.kit;
    const keeper=kit=>{
      const shirt=[kit.gkPrimary,'#ecb446','#8756b3','#42b8aa'].find(color=>
        colorDistance(color,first.primary)>100&&colorDistance(color,second.primary)>100);
      return {...kit,gkPrimary:shirt||'#ecb446'};
    };
    return [keeper(first),keeper(second)];
  }

  const SPRITE_KEYS={'대한민국':'korea'};

  const countries = [
    ['🇦🇷','아르헨티나','#62b4ff'],['🇧🇷','브라질','#f5cf35'],['🇫🇷','프랑스','#2261d6'],['🇩🇪','독일','#e4b441'],
    ['🇪🇸','스페인','#df3434'],['🇵🇹','포르투갈','#16874b'],['🇰🇷','대한민국','#ffffff'],['🇯🇵','일본','#e9424d'],
    ['🇺🇸','미국','#397bd2'],['🇲🇽','멕시코','#188354'],['🇨🇦','캐나다','#df4052'],['🇺🇾','우루과이','#73bce9'],
    ['🇨🇴','콜롬비아','#e6ba28'],['🇨🇱','칠레','#d73a42'],['🇳🇱','네덜란드','#f07d2e'],['🇧🇪','벨기에','#e64d4d'],
    ['🇭🇷','크로아티아','#f05458'],['🇮🇹','이탈리아','#319a68'],['🇬🇧','잉글랜드','#eeeeee'],['🇨🇭','스위스','#d93636'],
    ['🇸🇪','스웨덴','#3180dc'],['🇩🇰','덴마크','#df4247'],['🇳🇴','노르웨이','#e94c4f'],['🇵🇱','폴란드','#eeeeee'],
    ['🇹🇷','튀르키예','#d94b55'],['🇲🇦','모로코','#d94b55'],['🇸🇳','세네갈','#39a864'],['🇳🇬','나이지리아','#49a863'],
    ['🇬🇭','가나','#e9c53c'],['🇨🇲','카메룬','#4ca75e'],['🇪🇬','이집트','#d94a45'],['🇿🇦','남아공','#43a477'],
    ['🇦🇺','호주','#3976c7'],['🇮🇷','이란','#45a66b'],['🇸🇦','사우디','#55a66b'],['🇶🇦','카타르','#9e526e'],
    ['🇨🇷','코스타리카','#e64b51'],['🇪🇨','에콰도르','#e2be34'],['🇵🇾','파라과이','#e34f56'],['🇻🇪','베네수엘라','#e9be37'],
    ['🇷🇸','세르비아','#de4a51'],['🇺🇦','우크라이나','#e5c943'],['🇬🇷','그리스','#397dcc'],['🇦🇹','오스트리아','#df4e52'],
    ['🇨🇿','체코','#df5053'],['🇸🇮','슬로베니아','#3980c8'],['🇯🇲','자메이카','#42a366'],['🇮🇸','아이슬란드','#4b82d5']
  ].map(([flag,name,color],id)=>{
    const profile=TEAM_PROFILES[name];
    return {
      id,flag,name,color,
      rating:profile.rating,kit:profile.kit,awayKit:awayKitFor(profile.kit),
      spriteKey:SPRITE_KEYS[name]||null
    };
  });

  const canvas = document.querySelector('#pitch');
  const ctx = canvas.getContext('2d');
  const screen = document.querySelector('#screen');
  const hud = document.querySelector('#hud');
  const hint = document.querySelector('#hint');
  const dragHint = document.querySelector('#drag-hint');
  const tackleButton = document.querySelector('#tackle-button');
  const $ = (selector) => document.querySelector(selector);
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  const random = (min,max) => min + Math.random() * (max-min);
  const roundNames = ['32강','16강','8강','4강','결승'];
  const formation = [
    [0,0,5.2,'GK'],[-22,25,5.5,'DF'],[-8,19,5.8,'DF'],[8,19,5.8,'DF'],[22,25,5.5,'DF'],
    [-19,49,6.2,'MF'],[-6,43,6.4,'MF'],[7,43,6.4,'MF'],[19,49,6.2,'MF'],[-9,70,6.7,'FW'],[9,70,6.7,'FW']
  ];
  const store = {
    get(key,fallback) { try { const v=localStorage.getItem(key); return v===null?fallback:JSON.parse(v); } catch { return fallback; } },
    set(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} }
  };

  const playerSprites={};
  const loadPlayerSprite=file=>{
    if(typeof file!=='string'||file.includes('..'))return null;
    const image=new Image();image.src=`assets/players/${file}`;return image;
  };
  fetch('assets/players/manifest.json').then(response=>response.json()).then(manifest=>{
    for(const [teamKey,teamManifest] of Object.entries(manifest||{})){
      const states={};
      for(const state of ['idle','run','kick','shot']){
        const mapping=teamManifest?.[state]||{};
        states[state]={
          field:(Array.isArray(mapping.field)?mapping.field:[]).map(loadPlayerSprite).filter(Boolean),
          goalkeeper:loadPlayerSprite(mapping.goalkeeper)
        };
      }
      playerSprites[teamKey]=states;
    }
  }).catch(()=>{});

  function teamSprite(p,state) {
    const key=p.team?.spriteKey;
    if(!key)return null;
    const mapping=playerSprites[key]?.[state];
    const image=p.role==='GK'?mapping?.goalkeeper:mapping?.field?.[p.index%3];
    return image?.complete&&image.naturalWidth>0?image:null;
  }

  let appScreen='home', selectedCountry=6, mode='practice', cupRound=Number(store.get('kkoma-cup-round',0))||0;
  let tutorialSeen=Boolean(store.get('kkoma-tutorial-done',false));
  let muted=Boolean(store.get('kkoma-muted',false)), size={w:0,h:0,dpr:1}, game=null, lastFrame=0, audioContext=null, cameraY=52.5;
  let pointer=null, messageTimer=0;

  function resize() {
    const rect=canvas.getBoundingClientRect(); size.w=rect.width; size.h=rect.height; size.dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(size.w*size.dpr); canvas.height=Math.round(size.h*size.dpr);
    ctx.setTransform(size.dpr,0,0,size.dpr,0,0);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  function logo() {
    return `<svg class="ball-logo" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="53" fill="#fff" stroke="#d6e6c8" stroke-width="4"/><path d="m60 25 17 12-6 20H49l-6-20zM28 49l15-12 6 20-15 12zM92 49 77 37l-6 20 15 12zM49 57h22l12 17-9 19H46l-9-19zM28 69l15 5 3 19-18-10zM92 69l-15 5-3 19 18-10z" fill="#122e27"/><path d="M60 25v-8m33 32 9-4M27 49l-8-4m66 49 7 8m-64 0 7-8" stroke="#ffcc39" stroke-width="5" stroke-linecap="round"/></svg>`;
  }

  function showHome() {
    appScreen='home'; game=null; pointer=null; hud.classList.add('hidden'); hint.classList.add('hidden'); dragHint.classList.add('hidden'); tackleButton.classList.add('hidden'); screen.className='screen menu-screen';
    screen.innerHTML=`<div>${logo()}<h1 class="title">꼬마 축구<br>월드컵</h1><p class="subtitle">공을 몰고 달려서 골을 넣어봐!</p><div class="button-stack"><button class="game-button" data-action="team">⚽ 경기 시작</button><button class="game-button secondary" data-action="tutorial">🎓 ${tutorialSeen?'조작법 다시 보기':'처음 하는 법'}</button><button class="game-button ghost" data-action="cup">🏆 월드컵 이어하기</button></div><p class="fineprint">휴대폰을 세로로 들고 한 손가락으로 플레이해요</p></div>`;
  }

  const tutorialPages=[
    {icon:'👆',title:'이동',body:'천천히 끌어 보세요.'},
    {icon:'🤝',title:'패스',body:'공을 가진 뒤 친구 쪽으로 빠르게 밀어요.'},
    {icon:'🥅',title:'슛',body:'골대를 향해 길게 밀어요.'},
    {icon:'🛡️',title:'태클',body:'상대가 공을 가지면 태클 버튼을 눌러요.'}
  ];

  function showTutorial(step=0) {
    const index=clamp(Number(step)||0,0,tutorialPages.length-1),page=tutorialPages[index];
    appScreen='tutorial'; game=null; pointer=null; hud.classList.add('hidden'); hint.classList.add('hidden'); dragHint.classList.add('hidden'); tackleButton.classList.add('hidden');
    screen.className='screen menu-screen';
    const dots=tutorialPages.map((_,i)=>i===index?'●':'○').join('');
    screen.innerHTML=`<div class="panel tutorial-card"><p class="tutorial-step">조작 연습 ${index+1} / ${tutorialPages.length}</p><div class="tutorial-emoji">${page.icon}</div><h2 class="selection-title">${page.title}</h2><p class="tutorial-body">${page.body}</p><div class="tutorial-dots">${dots}</div><div class="button-stack" style="margin:auto">${index<tutorialPages.length-1?`<button class="game-button" data-action="tutorial-next" data-step="${index+1}">다음 ▶</button>`:'<button class="game-button" data-action="tutorial-finish">이제 경기해 볼래!</button>'}${index>0?`<button class="game-button ghost" data-action="tutorial-prev" data-step="${index-1}">◀ 이전</button>`:''}<button class="game-button ghost" data-action="tutorial-skip">건너뛰기</button></div></div>`;
  }

  function skillDots(value) {
    const filled=value>=1.015?4:value>=.985?3:2;
    return '●'.repeat(filled)+'○'.repeat(4-filled);
  }

  function showTeams(nextMode) {
    mode=nextMode; appScreen='teams'; tackleButton.classList.add('hidden'); screen.className='screen';
    const chosen=countries[selectedCountry];
    screen.innerHTML=`<div class="panel"><h2 class="selection-title">우리 팀을 골라요</h2><p class="selection-note">좋아하는 나라를 선택해 주세요</p><div id="team-grid" class="team-grid">${countries.map(t=>`<button class="team-card${t.id===selectedCountry?' selected':''}" data-team="${t.id}" aria-pressed="${t.id===selectedCountry}"><span class="flag">${t.flag}</span>${t.name}</button>`).join('')}</div><p class="badge team-skills">${chosen.flag} ${chosen.name}<span class="skill-row"><span>속도<br>${skillDots(chosen.rating.speed)}</span><span>패스<br>${skillDots(chosen.rating.pass)}</span><span>슛<br>${skillDots(chosen.rating.shot)}</span></span></p><div class="button-stack" style="margin:14px auto 0"><button class="game-button" data-action="play">${nextMode==='cup'?'🏆 '+roundNames[cupRound]+' 시작':'⚽ 연습 경기 시작'}</button><button class="game-button ghost" data-action="home">뒤로</button></div></div>`;
  }

  function chooseOpponent() {
    const choices=countries.filter(t=>t.id!==selectedCountry);
    return choices[Math.floor(Math.random()*choices.length)];
  }

  function makeTeam(team,side,attackDir) {
    const attackingEnd=(side===0?(attackDir<0?0:105):(attackDir<0?105:0));
    const defendingEnd=attackingEnd===0?105:0;
    return formation.map(([fx,fy,speed,role],index)=>{
      const baseDepth=role==='GK'?5:fy;
      const y=defendingEnd===0?baseDepth:105-baseDepth;
      return {x:fx,y,homeX:fx,homeY:y,speed:(role==='GK'?3.6:speed)*team.rating.speed,role,side,index,team,color:team.color,targetX:fx,targetY:y,runX:0,runY:0,nextDecisionAt:0};
    });
  }

  function startMatch() {
    const home=countries[selectedCountry], away=chooseOpponent();
    game={home,away,kits:matchKits(home,away),mode,round:cupRound,roundName:mode==='cup'?roundNames[cupRound]:'연습',difficulty:mode==='cup'?.55+cupRound*.12:.18,
      players:[...makeTeam(home,0,-1),...makeTeam(away,1,-1)],ball:{x:0,y:52.5,vx:0,vy:0,owner:null,lastKicker:null,kickLockUntil:0},score:[0,0],elapsed:0,period:1,attackDir:-1,
      controlled:6,aim:null,ended:false,paused:false,lastTouch:0,nextTackleAt:0,manualTackleReadyAt:0};
    resetPositions(0);cameraY=52.5;
    appScreen='match'; screen.innerHTML=''; screen.className='screen'; hud.classList.remove('hidden'); dragHint.classList.remove('hidden'); tackleButton.classList.remove('hidden');
    updateHud(); toast(mode==='cup'?`${roundNames[cupRound]} · ${home.name} vs ${away.name}`:`${home.name} vs ${away.name}`);
  }

  function updateHud() {
    if(!game)return;
    $('#home-team-label').textContent=game.home.name; $('#away-team-label').textContent=game.away.name;
    $('#home-score').textContent=game.score[0]; $('#away-score').textContent=game.score[1];
    $('#period-label').textContent=game.period===1?'전반':'후반';
    const elapsedInHalf=game.elapsed%75, remaining=Math.ceil(75-elapsedInHalf);
    $('#clock').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
    const tackleReady=game.ball.owner?.side===1;
    if(tackleButton.classList.contains('ready')!==tackleReady){
      tackleButton.classList[tackleReady?'add':'remove']('ready');
      tackleButton.setAttribute('aria-label',tackleReady?'상대가 공을 가졌어요. 태클 가능':'상대가 공을 가졌을 때 태클');
    }
    const controlHint=tackleReady?'공을 가진 상대 쪽으로 태클!':game.ball.owner?.side===0?'끌기 이동 · 친구 쪽 패스 · 골대 쪽 슛':'공 쪽으로 끌어요 · 상대 공은 태클!';
    if(dragHint.textContent!==controlHint)dragHint.textContent=controlHint;
  }

  function toast(text,duration=1700) {
    hint.textContent=text; hint.classList.remove('hidden'); clearTimeout(messageTimer);
    messageTimer=setTimeout(()=>hint.classList.add('hidden'),duration);
  }

  function pauseGame() {
    if(!game||appScreen!=='match')return;
    clearPointer();appScreen='pause'; game.paused=true; dragHint.classList.add('hidden'); tackleButton.classList.add('hidden'); screen.className='screen';
    screen.innerHTML=`<div class="panel"><span class="badge">${game.mode==='cup'?roundNames[game.round]:'연습 경기'}</span><h2 class="selection-title">잠깐 쉬어가요</h2><p>${game.home.name} ${game.score[0]} : ${game.score[1]} ${game.away.name}</p><div class="button-stack" style="margin:auto"><button class="game-button" data-action="resume">▶ 계속하기</button><button class="game-button secondary" data-action="mute">${muted?'🔇 소리 켜기':'🔊 소리 끄기'}</button><button class="game-button ghost" data-action="retry">다시 시작</button><button class="game-button ghost" data-action="home">처음으로</button></div><p class="small">효과음은 나중에 바뀌어요.</p></div>`;
  }

  function finishMatch() {
    if(!game)return;
    clearPointer();game.ended=true; appScreen='result'; dragHint.classList.add('hidden'); tackleButton.classList.add('hidden');
    const tied=game.score[0]===game.score[1];
    if(game.mode==='cup'&&tied){
      const homePens=Math.floor(random(2,6)),awayPens=Math.floor(random(2,6));
      game.shootout=[homePens,homePens===awayPens?(awayPens===5?awayPens-1:awayPens+1):awayPens];
    }
    const won=game.score[0]>game.score[1]||(game.shootout&&game.shootout[0]>game.shootout[1]);
    const champion=game.mode==='cup'&&won&&game.round===4;
    if(game.mode==='cup'&&won&&!champion){cupRound=Math.min(4,cupRound+1);store.set('kkoma-cup-round',cupRound);}
    if(game.mode==='cup'&&!won){cupRound=game.round;store.set('kkoma-cup-round',cupRound);}
    const heading=game.mode==='practice'?(won?'멋진 승리야!':tied?'무승부야!':'다음엔 이길 수 있어!'):(champion?'월드컵 우승!':won?'다음 라운드 진출!':tied?'승부차기 끝에 아쉬운 패배':'다시 도전해봐!');
    screen.className='screen';
    screen.innerHTML=`<div class="panel"><span class="badge">${game.mode==='cup'?(champion?'🏆 우승':game.roundName+' 종료'):'연습 경기 종료'}</span><h2 class="selection-title">${heading}</h2><div class="result-score">${game.score[0]} : ${game.score[1]}</div>${game.shootout?`<p>승부차기　${game.shootout[0]} : ${game.shootout[1]}</p>`:''}<p>${game.home.flag} ${game.home.name}　vs　${game.away.flag} ${game.away.name}</p><div class="button-stack" style="margin:16px auto 0">${won&&game.mode==='cup'&&!champion?'<button class="game-button" data-action="next">다음 경기 ▶</button>':''}<button class="game-button secondary" data-action="retry">다시 경기</button><button class="game-button ghost" data-action="home">메뉴로</button></div></div>`;
  }

  function moveToward(p,x,y,dt,mult=1) {
    const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy); if(d<.25)return;
    const step=Math.min(d,p.speed*mult*dt); p.x+=dx/d*step;p.y+=dy/d*step;
    if(game&&step>.02)p.runUntil=game.elapsed+.16;
  }

  function nearestPlayer(side,x,y,exclude=null) {
    let best=null,bestD=Infinity;
    for(const p of game.players) if(p.side===side&&p!==exclude){const d=Math.hypot(p.x-x,p.y-y);if(d<bestD){bestD=d;best=p;}}
    return best;
  }

  function nearestPlayers(side,x,y,count=2) {
    return game.players.filter(p=>p.side===side).map(p=>({p,d:Math.hypot(p.x-x,p.y-y)})).sort((a,b)=>a.d-b.d).slice(0,count).map(v=>v.p);
  }

  function attackGoal(side) { return (side===0?game.attackDir:-game.attackDir)<0?0:105; }
  function ownGoal(side) { return attackGoal(side)===0?105:0; }

  function laneRisk(from,to,defendingSide=1-from.side) {
    const ax=from.x,ay=from.y,bx=to.x,by=to.y,vx=bx-ax,vy=by-ay,len2=vx*vx+vy*vy||1;
    let risk=0;
    for(const d of game.players){
      if(d.side!==defendingSide)continue;
      const t=clamp(((d.x-ax)*vx+(d.y-ay)*vy)/len2,0,1);
      const px=ax+vx*t,py=ay+vy*t,dist=Math.hypot(d.x-px,d.y-py);
      if(dist<4.2)risk=Math.max(risk,1-dist/4.2);
    }
    return risk;
  }

  function passTargetFor(p,dx,dy,maxAngle=82) {
    const gesture=Math.hypot(dx,dy); if(gesture<1)return null;
    const ux=dx/gesture,uy=dy/gesture,cosLimit=Math.cos(maxAngle*Math.PI/180);
    let best=null,bestScore=-Infinity;
    for(const mate of game.players){
      if(mate.side!==p.side||mate===p)continue;
      const vx=mate.x-p.x,vy=mate.y-p.y,dist=Math.hypot(vx,vy);
      if(dist<2.5||dist>50)continue;
      const alignment=(vx*ux+vy*uy)/dist;
      if(alignment<cosLimit)continue;
      const progress=(mate.y-p.y)*Math.sign(attackGoal(p.side)-p.y);
      const risk=laneRisk(p,mate);
      const teamPass=p.team?.rating?.pass||1;
      const score=alignment*(5.2*teamPass)+progress*.045-dist*.014-risk*(1.15/teamPass)+(mate.role==='FW'?.25:0);
      if(score>bestScore){bestScore=score;best=mate;}
    }
    return best;
  }

  function isShotGesture(p,dx,dy,length) {
    if(length<3.4||Math.abs(dy)<.1)return false;
    const goalY=attackGoal(p.side),toward=Math.sign(goalY-p.y);
    if(Math.sign(dy)!==toward)return false;
    const t=(goalY-p.y)/dy;
    if(t<=0)return false;
    const projectedX=p.x+dx*t;
    return Math.abs(projectedX)<=18;
  }

  function bestAiPass(p) {
    const dir=Math.sign(attackGoal(p.side)-p.y);
    let best=null,bestScore=-Infinity;
    for(const mate of game.players){
      if(mate.side!==p.side||mate===p||mate.role==='GK')continue;
      const dist=Math.hypot(mate.x-p.x,mate.y-p.y);
      if(dist<5||dist>38)continue;
      const progress=(mate.y-p.y)*dir;
      const risk=laneRisk(p,mate,1-p.side);
      const score=progress*.16-dist*.025-risk*2.2-Math.abs(mate.x)*.008;
      if(score>bestScore){bestScore=score;best=mate;}
    }
    return bestScore>-.8?best:null;
  }

  function kick(p,dx,dy,power,shot) {
    const length=Math.hypot(dx,dy)||1, strength=clamp(power,0,1);
    const ball=game.ball; ball.owner=null; ball.lastKicker=p; ball.kickLockUntil=game.elapsed+.16;
    ball.x=p.x+dx/length*2.45; ball.y=p.y+dy/length*2.45;
    const skill=shot?(p.team?.rating?.shot||1):(p.team?.rating?.pass||1);
    const speed=((shot?35:23)+strength*(shot?28:17))*skill; ball.vx=dx/length*speed;ball.vy=dy/length*speed;game.lastTouch=p.side;
    p.actionStartedAt=game.elapsed;
    p.kickUntil=game.elapsed+(shot?.36:.26);
    p.shotUntil=shot?game.elapsed+.36:0;
    sfx(shot?'kick':'pass');
  }

  function resetPositions(kickoffSide=0) {
    for(let i=0;i<game.players.length;i++){
      const side=i<11?0:1, idx=i%11, team=side===0?game.home:game.away;
      const clone=makeTeam(team,side,game.attackDir)[idx];Object.assign(game.players[i],clone);
    }
    const taker=game.players[kickoffSide===0?6:17];taker.x=0;taker.y=52.5;
    game.ball.x=0;game.ball.y=52.5;game.ball.vx=game.ball.vy=0;game.ball.owner=taker;game.ball.lastKicker=null;game.ball.kickLockUntil=0;
    game.controlled=kickoffSide===0?taker.index:6; game.aim=null;
  }

  function scoreGoal(side) {
    game.score[side]++;updateHud();sfx('goal');
    toast(side===0?'골! 정말 멋져!':'상대 팀이 득점했어!',2200);
    resetPositions(side===0?1:0);
  }

  function updateMatch(dt) {
    if(!game||game.paused||game.ended)return;
    game.elapsed+=dt;
    cameraY+=(game.ball.y-cameraY)*(1-Math.exp(-2.2*dt));
    if(game.elapsed>=150){game.elapsed=150;updateHud();finishMatch();return;}
    if(game.elapsed>=75&&game.period===1){game.period=2;game.attackDir=1;resetPositions(1);toast('후반 시작! 진영이 바뀌었어');}
    const ball=game.ball, owner=ball.owner;

    for(const p of game.players){
      if(p.side===0&&pointer?.player===p){
        moveToward(p,p.targetX,p.targetY,dt,1.75);
        if(ball.owner===p){ball.x=p.x;ball.y=p.y-attackDirectionY(0)*1.7;}
        continue;
      }
      if(p.side===0&&game.elapsed<(p.manualUntil||0)){
        moveToward(p,p.targetX,p.targetY,dt,1.7);
        if(ball.owner===p){ball.x=p.x;ball.y=p.y-attackDirectionY(0)*1.7;}
        continue;
      }
      if(p.role==='GK'){
        const gy=ownGoal(p.side), threatX=ball.x;
        moveToward(p,clamp(threatX,-12,12),gy<20?5:100,dt,.78);
        continue;
      }
      if(owner===p){
        if(p.side===1){
          const goal=attackGoal(1),nearestHome=nearestPlayer(0,p.x,p.y);
          const pressure=nearestHome?Math.hypot(nearestHome.x-p.x,nearestHome.y-p.y):99;
          const distGoal=Math.abs(goal-p.y);
          const shotLaneRisk=laneRisk(p,{x:clamp(-p.x*.18,-4,4),y:goal},0);
          if(game.elapsed>=(p.nextDecisionAt||0)){
            if(distGoal<19&&Math.abs(p.x)<21&&shotLaneRisk<.58){
              const aimX=clamp(-p.x*.16+random(-5.2,5.2),-8.5,8.5);
              kick(p,aimX-p.x,goal-p.y,.56+game.difficulty*.035,true);
              p.nextDecisionAt=game.elapsed+1.05;
              continue;
            }
            if(pressure<4.3||shotLaneRisk>.74||Math.random()<.09){
              const mate=bestAiPass(p);
              if(mate){
                const leadY=mate.y+Math.sign(goal-mate.y)*2;
                const dist=Math.hypot(mate.x-p.x,leadY-p.y);
                kick(p,mate.x-p.x,leadY-p.y,clamp(.28+dist/42,.32,.9),false);
                p.nextDecisionAt=game.elapsed+.58;
                continue;
              }
            }
            p.nextDecisionAt=game.elapsed+random(.52,.92);
          }
          let goalX=clamp(-p.x*.18,-4,4);
          if(pressure<7&&nearestHome)goalX=clamp(p.x+(p.x-nearestHome.x)*.7,-22,22);
          moveToward(p,goalX,goal,dt,.47+game.difficulty*.03);
          ball.x=p.x;ball.y=p.y;
          continue;
        }
        ball.x=p.x;ball.y=p.y-attackDirectionY(0)*1.7;
        continue;
      }

      if(!owner){
        if(p===nearestPlayer(p.side,ball.x,ball.y))moveToward(p,ball.x,ball.y,dt,1.2);
        else moveToward(p,p.homeX,p.homeY,dt,.58);
      }else if(owner.side!==p.side){
        const chasers=nearestPlayers(p.side,owner.x,owner.y,2);
        if(p===chasers[0])moveToward(p,owner.x,owner.y,dt,p.side===1?.72:1.12);
        else if(p===chasers[1]){
          const coverY=clamp(owner.y+Math.sign(attackGoal(owner.side)-owner.y)*7,4,101);
          moveToward(p,owner.x,coverY,dt,p.side===1?.62:.86);
        }else moveToward(p,p.homeX+(owner.x-p.homeX)*.22,p.homeY+(owner.y-p.homeY)*.2,dt,p.side===1?.5:.58);
      }else{
        const forward=attackGoal(p.side),dir=Math.sign(forward-owner.y);
        const targetY=clamp(owner.y+dir*(p.role==='FW'?13:9),8,97);
        const laneOffset=(p.index%2?8:-8)+(p.index%3-1)*2;
        moveToward(p,clamp(owner.x+laneOffset,-29,29),targetY,dt,.68);
      }
    }

    if(ball.owner?.side===1){
      const charging=game.players.find(p=>p.side===0&&game.elapsed<(p.tackleUntil||0));
      if(charging){
        charging.targetX=ball.owner.x;charging.targetY=ball.owner.y;
        if(Math.hypot(charging.x-ball.owner.x,charging.y-ball.owner.y)<2.8)completeManualTackle(charging);
      }
    }

    if(ball.owner){
      const carrier=ball.owner,defender=nearestPlayer(1-carrier.side,carrier.x,carrier.y);
      if(defender&&game.elapsed>=(game.nextTackleAt||0)){
        const d=Math.hypot(defender.x-carrier.x,defender.y-carrier.y);
        if(d<1.6&&Math.random()<dt*(carrier.side===0?.26:.7)){
          ball.owner=defender;ball.vx=ball.vy=0;game.lastTouch=defender.side;game.nextTackleAt=game.elapsed+(carrier.side===0?1.45:.68);
          if(defender.side===0){game.controlled=defender.index;toast('공을 빼앗았어!',900);}
        }
      }
    }

    if(!ball.owner){
      ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
      const friction=Math.pow(.986,dt*60);ball.vx*=friction;ball.vy*=friction;
      if(Math.hypot(ball.vx,ball.vy)<1.55)ball.vx=ball.vy=0;

      let receiver=null,bestD=Infinity;
      for(const p of game.players){
        if(p===ball.lastKicker&&game.elapsed<ball.kickLockUntil)continue;
        const d=Math.hypot(p.x-ball.x,p.y-ball.y);
        if(d<2.18&&d<bestD){bestD=d;receiver=p;}
      }
      if(receiver){
        ball.owner=receiver;ball.vx=ball.vy=0;
        if(receiver.side===0){
          game.controlled=receiver.index;
          receiver.targetX=receiver.x;
          receiver.targetY=clamp(receiver.y+Math.sign(attackGoal(0)-receiver.y)*2.4,2,103);
          receiver.manualUntil=game.elapsed+.22;
        }
      }
    }

    if(ball.y<0||ball.y>105){
      const end=ball.y<0?0:105;
      const scoringSide=attackGoal(0)===end?0:1;
      if(Math.abs(ball.x)<9.2)scoreGoal(scoringSide);
      else {
        ball.y=end===0?1:104;ball.vy*=-.32;ball.vx*=.62;game.lastTouch=1-game.lastTouch;
        toast('공이 골라인 밖으로 나갔어',850);
      }
    }
    if(Math.abs(ball.x)>34){
      ball.x=clamp(ball.x,-33,33);ball.vx*=-.38;ball.vy*=.72;toast('터치라인에서 다시 시작해요',850);
    }
    updateHud();
  }


  function completeManualTackle(defender) {
    const carrier=game?.ball?.owner;
    if(!carrier||carrier.side!==1)return false;
    game.ball.owner=defender;game.ball.vx=game.ball.vy=0;game.ball.lastKicker=null;game.lastTouch=0;
    game.controlled=defender.index;game.nextTackleAt=game.elapsed+.7;game.manualTackleReadyAt=game.elapsed+.75;
    defender.tackleUntil=0;defender.targetX=defender.x;defender.targetY=defender.y;
    toast('태클 성공! 공을 빼앗았어!',950);sfx('pass');return true;
  }

  function tryManualTackle() {
    if(!game||appScreen!=='match'||game.paused||game.ended)return false;
    if(game.elapsed<(game.manualTackleReadyAt||0)){toast('조금만 기다렸다 다시 태클!',650);return false;}
    const carrier=game.ball.owner;
    if(!carrier||carrier.side!==1){toast('상대가 공을 가졌을 때 태클!',850);return false;}
    const defender=nearestPlayer(0,carrier.x,carrier.y);
    if(!defender)return false;
    game.controlled=defender.index;
    defender.targetX=carrier.x;defender.targetY=carrier.y;defender.manualUntil=game.elapsed+.75;defender.tackleUntil=game.elapsed+.75;
    const distance=Math.hypot(defender.x-carrier.x,defender.y-carrier.y);
    game.manualTackleReadyAt=game.elapsed+.35;
    if(distance<=5.2)return completeManualTackle(defender);
    toast('가까운 선수가 공으로 달려가요!',800);return false;
  }

  function attackDirectionY(side) { return Math.sign(attackGoal(side)-52.5); }
  const CAMERA_SPAN=62;
  function cameraStart() { return clamp(cameraY-CAMERA_SPAN/2,0,105-CAMERA_SPAN); }
  function project(x,y) {
    const top=78, bottom=size.h-4, depth=(y-cameraStart())/CAMERA_SPAN, perspective=.78+depth*.34;
    return {x:size.w/2+x*(size.w*.46/34)*perspective,y:top+(bottom-top)*depth,scale:perspective};
  }
  function unproject(px,py) {
    const depth=clamp((py-78)/(size.h-82),0,1), y=cameraStart()+depth*CAMERA_SPAN, perspective=.78+depth*.34;
    return {x:clamp((px-size.w/2)/(size.w*.46/34*perspective),-34,34),y};
  }

  function drawStadiumBackground() {
    const {w,h}=size;
    const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#64d8c1');sky.addColorStop(.28,'#17866d');sky.addColorStop(.44,'#0a513f');sky.addColorStop(1,'#06402e');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#ffffff16';ctx.beginPath();ctx.moveTo(w*.15,0);ctx.lineTo(w*.31,0);ctx.lineTo(w*.53,h*.4);ctx.lineTo(w*.42,h*.4);ctx.fill();
    ctx.beginPath();ctx.moveTo(w*.72,0);ctx.lineTo(w*.85,0);ctx.lineTo(w*.6,h*.36);ctx.lineTo(w*.52,h*.36);ctx.fill();
    ctx.fillStyle='#174a42';ctx.fillRect(0,62,w,Math.max(20,h*.07));
    for(let row=0;row<3;row++){
      ctx.fillStyle=row%2?'#276359':'#34776a';ctx.fillRect(0,63+row*8,w,6);
      for(let x=5;x<w;x+=14){ctx.fillStyle=['#e4a548','#df644d','#e9db83'][((x+row*9)/14|0)%3];ctx.fillRect(x,65+row*8,7,4);}
    }
  }

  function drawPitchSurface(start,end) {
    const tl=project(-34,start),tr=project(34,start),bl=project(-34,end),br=project(34,end);
    ctx.beginPath();ctx.moveTo(tl.x,tl.y);ctx.lineTo(tr.x,tr.y);ctx.lineTo(br.x,br.y);ctx.lineTo(bl.x,bl.y);ctx.closePath();ctx.fillStyle='#1e9d4d';ctx.fill();
    for(let y=Math.floor(start/10.5)*10.5,index=0;y<end;y+=10.5,index++){
      if(index%2)continue;const a=project(-34,Math.max(start,y)),b=project(34,Math.max(start,y)),c=project(34,Math.min(end,y+10.5)),d=project(-34,Math.min(end,y+10.5));
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fillStyle='#ffffff0b';ctx.fill();
    }
    ctx.fillStyle='#d5eeb6';
    for(const [edge,other] of [[tl,bl],[tr,br]]){
      ctx.beginPath();ctx.moveTo(edge.x,edge.y);ctx.lineTo(other.x,other.y);ctx.lineTo(other.x+(other.x<size.w/2?-8:8),other.y);ctx.lineTo(edge.x+(edge.x<size.w/2?-5:5),edge.y);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle='#45b3a2';
    for(let i=0;i<8;i++){
      const y=start+(end-start)*(i+.5)/8,p=project(i%2?-34:34,y),out=i%2?-11:11;
      ctx.fillRect(p.x+out,p.y-2,5,4);
    }
  }

  function drawFieldLines(start,end) {
    ctx.strokeStyle='#d8f6d9';ctx.lineWidth=1.3;ctx.globalAlpha=.88;
    const line=(coords)=>{ctx.beginPath();coords.forEach(([x,y],i)=>{const p=project(x,y);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.stroke();};
    line([[-34,start],[34,start],[34,end],[-34,end],[-34,start]]);
    if(start<=52.5&&end>=52.5)line([[-34,52.5],[34,52.5]]);
    for(const [cx,cy,rx,ry] of [[0,52.5,10,8],[0,7,18,10],[0,98,18,10]]){
      if(cy+ry<start||cy-ry>end)continue;
      ctx.beginPath();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,p=project(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}ctx.stroke();
    }
    if(start<17)line([[-19,0],[19,0],[19,16],[-19,16],[-19,0]]);
    if(end>88)line([[-19,105],[19,105],[19,89],[-19,89],[-19,105]]);
    if(start<4)line([[-9,0],[9,0],[9,3],[-9,3],[-9,0]]);
    if(end>101)line([[-9,105],[9,105],[9,102],[-9,102],[-9,105]]);
    ctx.globalAlpha=1;
    if(start<=2)drawGoal(0);if(end>=103)drawGoal(105);
  }

  function drawField() {
    const start=cameraStart(),end=start+CAMERA_SPAN;
    drawStadiumBackground();drawPitchSurface(start,end);drawFieldLines(start,end);
  }

  function drawGoal(y) {
    const a=project(-9,y),b=project(9,y), depth=y<50?1:-1;
    ctx.strokeStyle='#e8fff2';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x+depth*7,b.y+depth*4);ctx.lineTo(a.x+depth*7,a.y+depth*4);ctx.closePath();ctx.stroke();
    ctx.strokeStyle='#ffffff88';ctx.lineWidth=1;for(let i=1;i<6;i++){const x=a.x+(b.x-a.x)*i/6;ctx.beginPath();ctx.moveTo(x,a.y);ctx.lineTo(x+depth*6,a.y+depth*4);ctx.stroke();}
    for(let i=1;i<3;i++){const t=i/3;ctx.beginPath();ctx.moveTo(a.x+depth*7*t,a.y+depth*4*t);ctx.lineTo(b.x+depth*7*t,b.y+depth*4*t);ctx.stroke();}
  }

  function drawPlayer(p) {
    const pt=project(p.x,p.y),radius=8.5*pt.scale+(p.role==='GK'?1:0);
    const kit=game?.kits?.[p.side]||p.team?.kit||{primary:p.color||'#d5ff45',secondary:'#ffffff',shorts:'#17352f',socks:p.color||'#d5ff45',trim:'#ffffff',gkPrimary:'#f4c542'};
    const shirt=p.role==='GK'?kit.gkPrimary:kit.primary;
    ctx.fillStyle='#002b1f75';ctx.beginPath();ctx.ellipse(pt.x,pt.y+radius*.85,radius*1.25,radius*.45,0,0,Math.PI*2);ctx.fill();

    const state=game&&p.shotUntil>game.elapsed?'shot':game&&p.kickUntil>game.elapsed?'kick':game&&p.runUntil>game.elapsed?'run':'idle';
    const image=teamSprite(p,state);
    const hasSprite=Boolean(image);
    let spriteTop=null;
    if(hasSprite){
      const duration=state==='shot'?.36:state==='kick'?.26:0;
      const progress=duration?clamp((game.elapsed-(p.actionStartedAt??game.elapsed))/duration,0,1):0;
      const actionScale=state==='shot'?1+.045*Math.sin(progress*Math.PI):state==='kick'?1+.025*Math.sin(progress*Math.PI):1;
      const width=radius*2.9*actionScale,height=radius*3.15*actionScale,bottom=pt.y+radius*1.65;
      const top=bottom-height*134/136;
      spriteTop=bottom-height*132/136;
      ctx.drawImage(image,pt.x-width/2,top,width,height);
    }

    if(!hasSprite){
      // shirt
      ctx.fillStyle=shirt;ctx.strokeStyle=kit.trim||'#fff';ctx.lineWidth=1.2*pt.scale;
      ctx.beginPath();ctx.roundRect(pt.x-radius*.7,pt.y-radius*.15,radius*1.4,radius*.92,radius*.42);ctx.fill();ctx.stroke();

      // simple national-kit accent
      ctx.fillStyle=kit.secondary;ctx.globalAlpha=.9;
      ctx.fillRect(pt.x-radius*.08,pt.y-radius*.1,radius*.16,radius*.72);
      ctx.globalAlpha=1;

      // shorts
      ctx.fillStyle=kit.shorts;ctx.beginPath();ctx.roundRect(pt.x-radius*.62,pt.y+radius*.58,radius*1.24,radius*.48,radius*.18);ctx.fill();

      // socks/legs
      ctx.strokeStyle=kit.socks;ctx.lineWidth=2.1*pt.scale;
      ctx.beginPath();ctx.moveTo(pt.x-radius*.28,pt.y+radius*.95);ctx.lineTo(pt.x-radius*.3,pt.y+radius*1.28);
      ctx.moveTo(pt.x+radius*.28,pt.y+radius*.95);ctx.lineTo(pt.x+radius*.3,pt.y+radius*1.28);ctx.stroke();

      // head
      if(!hasSprite){
        ctx.fillStyle='#ffd7a4';ctx.beginPath();ctx.arc(pt.x,pt.y-radius*.5,radius*.53,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#234839';ctx.beginPath();ctx.arc(pt.x,pt.y-radius*.63,radius*.55,Math.PI,Math.PI*2);ctx.fill();
      }
      if(p.role==='GK'){
        ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(pt.x-radius*.9,pt.y+radius*.35,radius*.28,0,Math.PI*2);ctx.arc(pt.x+radius*.9,pt.y+radius*.35,radius*.28,0,Math.PI*2);ctx.fill();
      }
    }

    if(game&&p===game.ball.owner){
      ctx.strokeStyle='#ffec63';ctx.lineWidth=2;ctx.beginPath();
      ctx.arc(pt.x,pt.y,hasSprite?radius*1.55:radius+4,0,Math.PI*2);ctx.stroke();
    }
    if(game&&p.side===0&&p.index===game.controlled){
      const markerY=hasSprite&&Number.isFinite(spriteTop)?spriteTop-2:pt.y-radius-5;
      ctx.fillStyle='#ffffff';ctx.beginPath();
      ctx.moveTo(pt.x,markerY);ctx.lineTo(pt.x-4,markerY-6);ctx.lineTo(pt.x+4,markerY-6);ctx.fill();
    }
  }

  function drawBall() {
    if(!game)return;const pt=project(game.ball.x,game.ball.y),r=4*pt.scale;
    ctx.fillStyle='#00372988';ctx.beginPath();ctx.ellipse(pt.x,pt.y+r*1.2,r*1.45,r*.6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.strokeStyle='#253b34';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pt.x,pt.y-r*.5,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#26362f';ctx.beginPath();ctx.arc(pt.x,pt.y-r*.5,r*.36,0,Math.PI*2);ctx.fill();
  }

  function drawAim() {
    if(!game?.aim)return;
    const a=project(game.aim.x,game.aim.y),b=project(game.aim.toX,game.aim.toY);
    const color=game.aim.kind==='shot'?'#ffcf59':game.aim.kind==='pass'?'#a9f7ff':'#ffff9c';

    // white line = actual finger drag position
    if(Number.isFinite(game.aim.rawScreenX)&&Number.isFinite(game.aim.rawScreenY)){
      ctx.save();
      ctx.strokeStyle='#ffffffb8';ctx.lineWidth=2;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(game.aim.startScreenX,game.aim.startScreenY);ctx.lineTo(game.aim.rawScreenX,game.aim.rawScreenY);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#ffffffde';ctx.beginPath();ctx.arc(game.aim.rawScreenX,game.aim.rawScreenY,5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#123e36';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(game.aim.rawScreenX,game.aim.rawScreenY,8,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    }

    // colored line = interpreted pass/shot direction
    if(game.aim.kind!=='move'){
      ctx.strokeStyle=color;ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(b.x,b.y,game.aim.kind==='pass'?6:4,0,Math.PI*2);ctx.fill();
    }
    if(game.aim.target){
      const t=project(game.aim.target.x,game.aim.target.y);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,11*t.scale,0,Math.PI*2);ctx.stroke();
    }
  }

  function draw() {
    if(!size.w||!size.h)return;ctx.clearRect(0,0,size.w,size.h);drawField();
    if(game){
      const start=cameraStart(),end=start+CAMERA_SPAN;
      const ordered=[...game.players].filter(p=>p.y>=start-3&&p.y<=end+3).sort((a,b)=>a.y-b.y);ordered.forEach(drawPlayer);drawBall();drawAim();
    }else{
      const preview=[...formation].map(([x,y],i)=>({x:x*.8,y:15+y*.95,side:i%2,color:'#ffb337',index:i}));preview.forEach(p=>drawPlayer(p));
      const ball=project(0,67);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,8,0,Math.PI*2);ctx.fill();
    }
  }

  function frame(now) {
    const dt=Math.min((now-lastFrame)/1000,.05)||0;lastFrame=now;updateMatch(dt);draw();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function canvasPoint(event) { const r=canvas.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top}; }

  function chooseControlledPlayer(world) {
    if(game.ball.owner?.side===0)return game.ball.owner;
    const nearTouch=nearestPlayer(0,world.x,world.y);
    const nearBall=nearestPlayer(0,game.ball.x,game.ball.y);
    if(nearTouch&&Math.hypot(nearTouch.x-world.x,nearTouch.y-world.y)<8.5)return nearTouch;
    return nearBall;
  }

  function gestureMetrics(active,point,time) {
    const px=point.x-active.start.x,py=point.y-active.start.y;
    const distance=Math.hypot(px,py)/size.w;
    const duration=Math.max((time-active.startTime)/1000,.05);
    return {dx:px*active.worldPerPixelX,dy:py*active.worldPerPixelY,distance,speed:distance/duration};
  }

  function resolveGesture(p,{dx,dy,distance,speed}) {
    const length=Math.hypot(dx,dy);
    if(distance<.03||speed<.42)return {kind:'move',dx:0,dy:0,power:0,target:null};
    if(distance>=.12&&speed>=.55&&isShotGesture(p,dx,dy,length)){
      const goalY=attackGoal(p.side),x=clamp(p.x+dx*(goalY-p.y)/dy,-8,8);
      return {kind:'shot',dx:x-p.x,dy:goalY-p.y,power:clamp(length/13,.42,1),target:null};
    }
    const target=passTargetFor(p,dx,dy);
    if(target){
      const leadY=clamp(target.y+Math.sign(attackGoal(p.side)-target.y)*1.8,1,104);
      const pdx=target.x-p.x,pdy=leadY-p.y,dist=Math.hypot(pdx,pdy);
      return {kind:'pass',dx:pdx,dy:pdy,power:clamp(.34+dist/46,.38,.94),target};
    }
    return {kind:'pass',dx,dy,power:clamp(.3+length/18,.36,.9),target:null};
  }

  function clearPointer() {
    pointer=null;
    if(game)game.aim=null;
  }

  canvas.addEventListener('pointerdown',event=>{
    if(appScreen!=='match'||!game||pointer)return;
    event.preventDefault();canvas.setPointerCapture(event.pointerId);
    const startPoint=canvasPoint(event),world=unproject(startPoint.x,startPoint.y),selected=chooseControlledPlayer(world);
    if(!selected)return;
    game.controlled=selected.index;
    const scale=project(selected.x,selected.y).scale;
    pointer={id:event.pointerId,player:selected,origin:{x:selected.x,y:selected.y},start:startPoint,last:startPoint,startTime:event.timeStamp,
      worldPerPixelX:34/(size.w*.46*scale),worldPerPixelY:CAMERA_SPAN/(size.h-82)};
    game.aim={x:selected.x,y:selected.y,toX:selected.x,toY:selected.y,startScreenX:startPoint.x,startScreenY:startPoint.y,rawScreenX:startPoint.x,rawScreenY:startPoint.y,kind:'move',target:null};
    if(!muted)ensureAudio();
  });

  canvas.addEventListener('pointermove',event=>{
    if(!pointer||pointer.id!==event.pointerId||!game)return;event.preventDefault();
    const point=canvasPoint(event),metrics=gestureMetrics(pointer,point,event.timeStamp),delta={x:metrics.dx,y:metrics.dy};
    const dragLength=Math.hypot(delta.x,delta.y),scale=Math.min(1,14/(dragLength||1));
    const p=pointer.player;p.targetX=clamp(pointer.origin.x+delta.x*scale,-33,33);p.targetY=clamp(pointer.origin.y+delta.y*scale,3,102);
    const intent=game.ball.owner===p?resolveGesture(p,metrics):{kind:'move',target:null};
    const aimDx=intent.kind==='pass'&&intent.target?intent.dx:intent.kind==='shot'?intent.dx:delta.x*2;
    const aimDy=intent.kind==='pass'&&intent.target?intent.dy:intent.kind==='shot'?intent.dy:delta.y*2;
    game.aim={x:p.x,y:p.y,toX:clamp(p.x+aimDx,-33,33),toY:clamp(p.y+aimDy,0,105),startScreenX:pointer.start.x,startScreenY:pointer.start.y,
      rawScreenX:point.x,rawScreenY:point.y,kind:intent.kind,target:intent.target||null};
    pointer.last=point;
  });

  function finishPointer(event,cancelled=false) {
    if(!pointer||pointer.id!==event.pointerId||!game)return;
    if(!cancelled)event.preventDefault();
    const p=pointer.player;
    const endPoint=cancelled?pointer.last:canvasPoint(event);
    const metrics=gestureMetrics(pointer,endPoint,event.timeStamp),{dx,dy}=metrics,length=Math.hypot(dx,dy);
    if(!cancelled&&game.ball.owner===p){
      const intent=resolveGesture(p,metrics);
      if(intent.kind==='shot')kick(p,intent.dx,intent.dy,intent.power,true);
      else if(intent.kind==='pass')kick(p,intent.dx,intent.dy,intent.power,false);
    }else if(!cancelled&&length>=1.15){
      p.targetX=clamp(p.x+dx*1.3,-33,33);p.targetY=clamp(p.y+dy*1.3,1,104);p.manualUntil=game.elapsed+1.2;
    }
    clearPointer();
  }

  tackleButton.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();tryManualTackle();});

  canvas.addEventListener('pointerup',event=>finishPointer(event,false));
  canvas.addEventListener('pointercancel',event=>finishPointer(event,true));
  canvas.addEventListener('lostpointercapture',event=>{if(pointer?.id===event.pointerId)clearPointer();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearPointer();pauseGame();}});

  function ensureAudio() {
    if(!audioContext){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(AudioCtx)audioContext=new AudioCtx();}
    if(audioContext?.state==='suspended')audioContext.resume();
  }
  function sfx(type) {
    if(muted)return;ensureAudio();if(!audioContext)return;
    const now=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();
    const freq=type==='goal'?660:type==='kick'?145:220;
    osc.type=type==='goal'?'triangle':'sine';osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(type==='goal'?990:70,now+(type==='goal'?.28:.09));
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(type==='goal'?.09:.07,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+(type==='goal'?.34:.12));
    osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+(type==='goal'?.36:.14));
  }

  screen.addEventListener('click',event=>{
    const teamButton=event.target.closest('[data-team]');
    if(teamButton){selectedCountry=Number(teamButton.dataset.team);showTeams(mode);return;}
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action;
    if(action==='team'){if(!tutorialSeen){mode='practice';showTutorial(0);}else showTeams('practice');}
    else if(action==='tutorial'){mode='practice';showTutorial(0);}
    else if(action==='tutorial-next'||action==='tutorial-prev')showTutorial(Number(button.dataset.step));
    else if(action==='tutorial-finish'){tutorialSeen=true;store.set('kkoma-tutorial-done',true);showTeams('practice');}
    else if(action==='tutorial-skip'){tutorialSeen=true;store.set('kkoma-tutorial-done',true);showTeams('practice');}
    else if(action==='cup')showTeams('cup');
    else if(action==='home')showHome();
    else if(action==='play')startMatch();
    else if(action==='resume'){appScreen='match';game.paused=false;screen.innerHTML='';dragHint.classList.remove('hidden');tackleButton.classList.remove('hidden');}
    else if(action==='mute'){muted=!muted;store.set('kkoma-muted',muted);pauseGame();}
    else if(action==='retry')startMatch();
    else if(action==='next'){showTeams('cup');}
  });
  $('#pause-button').addEventListener('click',pauseGame);
  $('#back-button').addEventListener('click',showHome);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&appScreen==='match')pauseGame();});

  function initialIntro(){showHome();}
  initialIntro();
})();
