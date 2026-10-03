import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const listeners={canvas:{},document:{},screen:{}};
const element=()=>{
  const classes=new Set(),attributes=new Map();
  return {classList:{add(...names){names.forEach(name=>classes.add(name));},remove(...names){names.forEach(name=>classes.delete(name));},contains(name){return classes.has(name);}},
    attributes,addEventListener(){},setAttribute(name,value){attributes.set(name,value);},innerHTML:'',textContent:''};
};
const drawImages=[];
const ctx=new Proxy({setTransform(){},drawImage(...args){drawImages.push(args);}},
  {get(target,key){return key in target?target[key]:()=>{};}});
const canvas={...element(),getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),
  setPointerCapture(){},addEventListener(type,fn){listeners.canvas[type]=fn;}};
const screen={...element(),addEventListener(type,fn){listeners.screen[type]=fn;}};
const elements=new Map([['#pitch',canvas],['#screen',screen]]);
const document={hidden:false,querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);},
  addEventListener(type,fn){listeners.document[type]=fn;}};
const storage=new Map([['kkoma-cup-round','2'],['kkoma-muted','true']]);
const spriteManifest=JSON.parse(readFileSync(new URL('../assets/players/manifest.json',import.meta.url),'utf8'));
class ImageStub{constructor(){this.complete=true;this.naturalWidth=128;this.src='';}}
const context={document,window:{},Image:ImageStub,devicePixelRatio:1,ResizeObserver:class{observe(){}},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  requestAnimationFrame(){},setTimeout(){return 1;},clearTimeout(){},fetch:async()=>({json:async()=>spriteManifest})};
const source=readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/\}\)\(\);\s*$/,
  'globalThis.testApi={countries,matchKits,colorDistance,project,startMatch,updateMatch,drawPlayer,playerSprites,tryManualTackle,updateHud,showHome,showTutorial,showTeams,pauseGame,finishMatch,game:()=>game,tackleButton:document.querySelector("#tackle-button"),dragHint:document.querySelector("#drag-hint"),setCamera:y=>{cameraY=y}};})();');
vm.runInNewContext(source,context,{filename:'game.js'});
const t=context.testApi;

assert.equal(t.countries.length,48);
for(const country of t.countries){
  const values=Object.values(country.rating);
  assert.equal(values.length,3,country.name);
  assert.ok(values.every(value=>value>=.94&&value<=1.06),country.name);
  assert.ok(values.reduce((a,b)=>a+b,0)>=2.98&&values.reduce((a,b)=>a+b,0)<=3.06,country.name);
  for(const key of ['primary','secondary','shorts','socks','trim','gkPrimary']){
    assert.match(country.kit[key],/^#[0-9a-f]{6}$/i,`${country.name} ${key}`);
    assert.match(country.awayKit[key],/^#[0-9a-f]{6}$/i,`${country.name} away ${key}`);
  }
}
for(const home of t.countries)for(const away of t.countries){
  if(home===away)continue;
  const kits=t.matchKits(home,away);
  assert.ok(t.colorDistance(kits[0].primary,kits[1].primary)>=100,`${home.name} / ${away.name} clash`);
}

let stamp=1000,id=1;
function setup(x,y,mateX,mateY,attackDir=-1){
  t.startMatch();const game=t.game(),p=game.players[6],mate=game.players[9];
  game.attackDir=attackDir;game.period=attackDir===-1?1:2;
  for(const player of game.players){player.x=player.side===0?32:-32;player.y=player.side===0?96:52;player.homeX=player.x;player.homeY=player.y;}
  p.x=x;p.y=y;mate.x=mateX;mate.y=mateY;
  game.ball.owner=p;game.ball.x=x;game.ball.y=y;game.ball.vx=game.ball.vy=0;
  t.setCamera(y);return {game,p,mate};
}
function event(x,y,time){return {pointerId:id,clientX:x,clientY:y,timeStamp:time,preventDefault(){}};}
function drag(p,dx,dy,duration){
  const start=t.project(p.x,p.y),begin=stamp;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+dx,start.y+dy,begin+duration));
  const preview=t.game().aim;
  assert.equal(preview.startScreenX,start.x);
  assert.equal(preview.startScreenY,start.y);
  assert.equal(preview.rawScreenX,start.x+dx);
  assert.equal(preview.rawScreenY,start.y+dy);
  listeners.canvas.pointerup(event(start.x+dx,start.y+dy,begin+duration+1));
  stamp+=1000;id++;return preview;
}
function toward(p,mate,pixels){
  const a=t.project(p.x,p.y),b=t.project(mate.x,mate.y),length=Math.hypot(b.x-a.x,b.y-a.y);
  return [(b.x-a.x)*pixels/length,(b.y-a.y)*pixels/length];
}
function advance(seconds){for(let n=0;n<seconds*60;n++)t.updateMatch(1/60);}

for(let n=0;n<20;n++){
  const {game,p,mate}=setup(0,55,5+(n%3),50-(n%2));
  const [dx,dy]=toward(p,mate,25+n%5),preview=drag(p,dx,dy,75);
  assert.equal(preview.kind,'pass',`short pass ${n}`);
  assert.equal(preview.target,mate,`short target ${n}`);
  assert.equal(game.ball.lastKicker,p);
  advance(.7);assert.equal(game.ball.owner,mate,`short receive ${n}`);
}
for(let n=0;n<20;n++){
  const {game,p,mate}=setup(-10,62,9+(n%3),48-(n%3));
  const [dx,dy]=toward(p,mate,48+n%8),preview=drag(p,dx,dy,95);
  assert.equal(preview.kind,'pass',`diagonal pass ${n}`);
  assert.equal(preview.target,mate,`diagonal target ${n}`);
  advance(1.4);assert.equal(game.ball.owner,mate,`diagonal receive ${n}`);
}
for(let n=0;n<20;n++){
  const {game,p,mate}=setup(20,68,-16-(n%3),41-(n%3));
  const [dx,dy]=toward(p,mate,90+n%8),preview=drag(p,dx,dy,130);
  assert.equal(preview.kind,'pass',`long pass ${n}`);
  assert.equal(preview.target,mate,`long target ${n}`);
  advance(2.4);assert.equal(game.ball.owner,mate,`long receive ${n}`);
}
for(const [period,dir,y,swipe] of [[1,-1,18,-105],[2,1,87,105]])for(let n=0;n<20;n++){
  const {game,p}=setup((n%5-2)*.7,y,25,50,dir),before=game.score[0];
  const preview=drag(p,(n%5-2)*2,swipe,100);
  assert.equal(preview.kind,'shot',`${period} shot ${n}`);
  assert.equal(preview.toY,dir===-1?0:105);
  advance(1);assert.equal(game.score[0],before+1,`${period} goal ${n}`);
}

{
  const {game,p,mate}=setup(0,55,6,49);let [dx,dy]=toward(p,mate,30);
  drag(p,dx,dy,65);game.ball.owner=mate;
  const next=game.players[10];next.x=-8;next.y=42;
  [dx,dy]=toward(mate,next,32);
  assert.equal(drag(mate,dx,dy,65).kind,'pass','pass immediately after pass');
}
{
  const {game,p}=setup(0,80,20,50),start=t.project(p.x,p.y),begin=stamp,startY=p.y;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x,start.y-95,begin+80));
  for(let n=0;n<120;n++)t.updateMatch(1/60);
  assert.ok(p.y<startY-15,'held upward drag keeps moving beyond the old fixed target limit');
  assert.equal(game.ball.owner,p,'held dribble keeps possession before release');
  listeners.canvas.pointercancel(event(start.x,start.y-95,begin+2080));
  id++;stamp+=3000;
}
{
  const {game,p,mate}=setup(0,55,10,50),start=t.project(p.x,p.y),target=t.project(mate.x,mate.y),begin=stamp;
  const dx=target.x-start.x,dy=target.y-start.y,length=Math.hypot(dx,dy),scale=70/length;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+dx*scale,start.y+dy*scale,begin+80));
  for(let n=0;n<72;n++)t.updateMatch(1/60);
  const preview=game.aim;
  assert.equal(preview.kind,'pass','held drag previews release pass even after a long hold');
  listeners.canvas.pointerup(event(start.x+dx*scale,start.y+dy*scale,begin+1280));
  assert.equal(game.ball.lastKicker,p,'releasing a held drag performs the pass');
  id++;stamp+=2000;
}
{
  const {p,mate,game}=setup(0,55,6,49);game.players[17].x=5;game.players[17].y=57;
  const before=Math.hypot(game.players[17].x-p.x,game.players[17].y-p.y);
  game.nextTackleAt=1;t.updateMatch(.1);
  assert.ok(Math.hypot(game.players[17].x-p.x,game.players[17].y-p.y)<before,'opponent approaches');
  const [dx,dy]=toward(p,mate,30);
  assert.equal(drag(p,dx,dy,65).kind,'pass','pass under pressure');
}
{
  const {game,p,mate}=setup(0,18,20,16),s=t.project(p.x,p.y),begin=stamp;
  listeners.canvas.pointerdown(event(s.x,s.y,begin));
  listeners.canvas.pointermove(event(s.x,s.y-105,begin+80));
  assert.equal(game.aim.kind,'shot','shot guide appears during drag');
  assert.equal(game.aim.toY,0,'shot guide reaches goal');
  listeners.canvas.pointermove(event(s.x+85,s.y-12,begin+110));
  assert.equal(game.aim.kind,'pass','guide changes from shot to pass');
  assert.equal(game.aim.target,mate,'pass ring follows selected teammate');
  listeners.canvas.pointermove(event(s.x,s.y-105,begin+140));
  assert.equal(game.aim.kind,'shot','guide changes back to shot');
  listeners.canvas.pointercancel(event(s.x,s.y-105,begin+145));
}
{
  const {p}=setup(0,55,6,49);const s=t.project(p.x,p.y);
  listeners.canvas.pointerdown(event(3,s.y,stamp));
  listeners.canvas.pointermove(event(28,s.y-20,stamp+60));
  assert.equal(t.game().aim.startScreenX,3,'edge start');
  listeners.canvas.pointercancel(event(28,s.y-20,stamp+65));
  assert.equal(t.game().ball.owner,p,'pointercancel does not kick');
  id++;stamp+=1000;
  listeners.canvas.pointerdown(event(s.x,s.y,stamp));
  listeners.canvas.lostpointercapture({pointerId:id});
  listeners.canvas.pointerup(event(s.x+80,s.y-80,stamp+70));
  assert.equal(t.game().ball.owner,p,'lostpointercapture does not kick');
  document.hidden=true;listeners.document.visibilitychange();
  assert.equal(t.game().paused,true,'hidden tab pauses game');
  document.hidden=false;
  listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'resume'}}:null}});
  assert.equal(t.game().paused,false,'resume after tab switch');
}
{
  t.startMatch();const game=t.game(),carrier=game.players[17],defender=game.players[6];
  for(const player of game.players.filter(player=>player.side===0)){player.x=-28;player.y=90;}
  defender.x=0;defender.y=55;carrier.x=2.5;carrier.y=55;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;
  assert.equal(t.tryManualTackle(),true,'manual tackle succeeds in kid-friendly radius');
  assert.equal(game.ball.owner,defender,'manual tackle gives possession to nearest home defender');
}
{
  t.startMatch();const game=t.game(),button=t.tackleButton,homePlayer=game.players[6],awayPlayer=game.players[17];
  game.ball.owner=homePlayer;t.updateHud();
  assert.equal(button.classList.contains('ready'),false,'tackle button is subdued when home has the ball');
  assert.equal(button.attributes.get('aria-label'),'상대가 공을 가졌을 때 태클');
  assert.equal(t.dragHint.textContent,'끌고 있으면 달리기 · 손 떼면 패스 · 골대 쪽은 슛');
  assert.equal(t.tryManualTackle(),false,'tackle press while home has the ball does not steal possession');
  game.ball.owner=awayPlayer;t.updateHud();
  assert.equal(button.classList.contains('ready'),true,'tackle button is highlighted when opponent has the ball');
  assert.equal(button.attributes.get('aria-label'),'상대가 공을 가졌어요. 태클 가능');
  assert.equal(t.dragHint.textContent,'공 가진 상대를 두 번 톡톡 · 태클 버튼도 가능');
  game.ball.owner=homePlayer;t.updateHud();
  assert.equal(button.classList.contains('ready'),false,'tackle state follows possession changes');
  game.ball.owner=null;t.updateHud();
  assert.equal(t.dragHint.textContent,'공 쪽으로 끌고 가요');
}
{
  t.startMatch();const game=t.game(),carrier=game.players[17],defender=game.players[6];
  for(const player of game.players.filter(player=>player.side===0)){player.x=-28;player.y=90;}
  defender.x=0;defender.y=55;carrier.x=12;carrier.y=55;carrier.nextDecisionAt=1000;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;
  assert.equal(t.tryManualTackle(),false,'far tackle starts pressure without instant possession');
  assert.equal(game.ball.owner,carrier,'far tackle preserves possession while defender closes in');
  assert.equal(defender.targetX,carrier.x,'far tackle targets the current carrier');
  assert.equal(t.tryManualTackle(),false,'repeat press during cooldown is harmless');
  const distance=Math.hypot(defender.x-carrier.x,defender.y-carrier.y);
  t.updateMatch(.1);t.updateMatch(.1);
  assert.ok(Math.hypot(defender.x-carrier.x,defender.y-carrier.y)<distance,'manual pressure moves toward the carrier');
  assert.equal(game.ball.owner,carrier,'pressure does not teleport the ball from long range');
}
{
  t.startMatch();const game=t.game(),carrier=game.players[17],defender=game.players[6];
  for(const player of game.players.filter(player=>player.side===0)){player.x=-28;player.y=90;}
  defender.x=0;defender.y=55;carrier.x=2.5;carrier.y=55;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;
  assert.equal(t.tryManualTackle(),true,'near tackle succeeds immediately');
  for(let n=0;n<10;n++)assert.equal(t.tryManualTackle(),false,`repeat tackle ${n} respects cooldown`);
  assert.equal(game.ball.owner,defender,'rapid repeat presses do not toggle possession');
}
{
  t.startMatch();const game=t.game(),carrier=game.players[17],defender=game.players[6];
  for(const player of game.players.filter(player=>player.side===0)){player.x=-28;player.y=90;}
  defender.x=1.8;defender.y=55;carrier.x=0;carrier.y=55;carrier.nextDecisionAt=1000;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;t.updateHud();
  const c=t.project(carrier.x,carrier.y),first=stamp;
  listeners.canvas.pointerdown(event(c.x,c.y,first));
  listeners.canvas.pointerup(event(c.x+2,c.y+1,first+70));
  id++;
  assert.equal(game.ball.owner,carrier,'first tap near carrier does not tackle yet');
  listeners.canvas.pointerdown(event(c.x+3,c.y+2,first+260));
  listeners.canvas.pointerup(event(c.x+4,c.y+2,first+330));
  assert.equal(game.ball.owner,defender,'second nearby tap tackles on mobile');
  id++;stamp+=1200;
}
{
  t.startMatch();const game=t.game(),carrier=game.players[17],defender=game.players[6];
  defender.x=1.5;defender.y=55;carrier.x=0;carrier.y=55;carrier.nextDecisionAt=1000;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;
  const c=t.project(carrier.x,carrier.y),farX=Math.max(5,c.x-150),first=stamp;
  listeners.canvas.pointerdown(event(farX,c.y,first));
  listeners.canvas.pointerup(event(farX,c.y,first+60));id++;
  listeners.canvas.pointerdown(event(farX+2,c.y+1,first+250));
  listeners.canvas.pointerup(event(farX+2,c.y+1,first+310));
  assert.equal(game.ball.owner,carrier,'double tap away from the carrier does not steal');
  id++;stamp+=1200;
}
{
  t.startMatch();let game=t.game();const button=t.tackleButton;
  assert.equal(button.classList.contains('hidden'),false,'tackle button appears in a match');
  t.showTutorial(0);assert.equal(button.classList.contains('hidden'),true,'tackle button is hidden in tutorial');
  t.showTeams('practice');assert.equal(button.classList.contains('hidden'),true,'tackle button is hidden during team selection');
  t.startMatch();game=t.game();const p=game.players[6],point=t.project(p.x,p.y);
  listeners.canvas.pointerdown(event(point.x,point.y,stamp));
  listeners.canvas.pointermove(event(point.x+20,point.y+10,stamp+50));
  assert.ok(game.aim,'drag is active before pause');
  t.pauseGame();
  assert.equal(button.classList.contains('hidden'),true,'tackle button is hidden while paused');
  assert.equal(game.aim,null,'pausing clears a held pointer gesture');
  assert.equal(t.tryManualTackle(),false,'pause blocks manual tackle');
  listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'resume'}}:null}});
  assert.equal(button.classList.contains('hidden'),false,'resume restores tackle button');
  const endPoint=t.project(game.players[6].x,game.players[6].y);
  listeners.canvas.pointerdown(event(endPoint.x,endPoint.y,stamp+100));
  listeners.canvas.pointermove(event(endPoint.x+20,endPoint.y+10,stamp+150));
  t.finishMatch();assert.equal(button.classList.contains('hidden'),true,'tackle button is hidden on result screen');
  assert.equal(game.aim,null,'finishing the match clears a held pointer gesture');
  assert.equal(t.tryManualTackle(),false,'result screen blocks manual tackle');
  t.startMatch();game=t.game();assert.equal(button.classList.contains('hidden'),false,'retry starts with a fresh tackle control');
}
assert.equal(storage.get('kkoma-cup-round'),'2','cup progress preserved');
await new Promise(resolve=>setTimeout(resolve,0));
assert.equal(t.playerSprites.korea.idle.field.length,3,'three Korea field idle sprites load');
assert.ok(t.playerSprites.korea.run.goalkeeper,'Korea goalkeeper run sprite loads');
assert.equal(t.playerSprites.korea.kick.field.length,3,'three Korea pass sprites load');
assert.equal(t.playerSprites.korea.shot.field.length,3,'three Korea shot sprites load');
assert.equal(t.playerSprites.korea.kick.goalkeeper,null,'Korea goalkeeper pass uses Canvas fallback');
assert.equal(t.playerSprites.korea.shot.goalkeeper,null,'Korea goalkeeper shot uses Canvas fallback');
t.startMatch();
const spriteGame=t.game(),fieldPlayer=spriteGame.players.find(player=>player.side===0&&player.role!=='GK');
assert.equal(spriteGame.home.name,'대한민국','sprite match is Korea home');
assert.equal(spriteGame.home.spriteKey,'korea','Korea team resolves generic sprite key');
assert.equal(t.countries.filter(country=>country.spriteKey).length,1,'only teams with production sprites opt in');
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.equal(drawImages.length,1,'loaded idle sprite is rendered');
assert.equal(drawImages[0][0].src,`assets/players/korea/idle-${fieldPlayer.index%3+1}.webp`);
t.playerSprites.korea.idle.field[fieldPlayer.index%3].complete=false;
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.equal(drawImages.length,0,'Canvas fallback is used while sprite is unavailable');
fieldPlayer.shotUntil=spriteGame.elapsed+1;
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.equal(drawImages.length,1,'loaded shot sprite is rendered');
assert.equal(drawImages[0][0].src,`assets/players/korea/shot-${fieldPlayer.index%3+1}.webp`);
fieldPlayer.shotUntil=0;fieldPlayer.kickUntil=spriteGame.elapsed+1;
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.equal(drawImages.length,1,'loaded pass sprite is rendered');
assert.equal(drawImages[0][0].src,`assets/players/korea/pass-${fieldPlayer.index%3+1}.webp`);
t.playerSprites.korea.kick.field[fieldPlayer.index%3].complete=false;
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.equal(drawImages.length,0,'Canvas fallback is used when pass sprite fails to load');
t.playerSprites.korea.kick.field[fieldPlayer.index%3].complete=true;

// Action states must yield back to locomotion without sticking.
fieldPlayer.runUntil=spriteGame.elapsed+2;
fieldPlayer.actionStartedAt=spriteGame.elapsed;
fieldPlayer.kickUntil=spriteGame.elapsed+.26;
fieldPlayer.shotUntil=0;
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.match(drawImages[0][0].src,/\/pass-\d\.webp$/,'pass state takes priority over run');
advance(.3);
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.match(drawImages[0][0].src,/\/run-\d\.webp$/,'pass returns to run');

fieldPlayer.actionStartedAt=spriteGame.elapsed;
fieldPlayer.kickUntil=spriteGame.elapsed+.36;
fieldPlayer.shotUntil=spriteGame.elapsed+.36;
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.match(drawImages[0][0].src,/\/shot-\d\.webp$/,'shot state takes priority over run');
advance(.4);
drawImages.length=0;t.drawPlayer(fieldPlayer);
assert.match(drawImages[0][0].src,/\/run-\d\.webp$/,'shot returns to run');

console.log('PASS: mobile logic, Korea idle/run/pass/shot sprite mapping, action transitions, and unavailable-image fallback');
