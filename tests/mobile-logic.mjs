import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import vm from 'node:vm';

const listeners={canvas:{},document:{},screen:{}};
const element=()=>{
  const classes=new Set(),attributes=new Map();
  return {classList:{add(...names){names.forEach(name=>classes.add(name));},remove(...names){names.forEach(name=>classes.delete(name));},toggle(name,force){if(force===undefined)force=!classes.has(name);force?classes.add(name):classes.delete(name);return force;},contains(name){return classes.has(name);}},
    attributes,addEventListener(){},setAttribute(name,value){attributes.set(name,value);},innerHTML:'',textContent:''};
};
const drawImages=[];
const audioInstances=[];
class AudioStub{
  constructor(){this.src='';this.loop=false;this.volume=1;this.preload='';this.paused=true;this.currentTime=0;audioInstances.push(this);}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
}
let forcedRandom=null;
const vmMath=Object.create(Math);vmMath.random=()=>forcedRandom===null?Math.random():forcedRandom;
const ctx=new Proxy({setTransform(){},drawImage(...args){drawImages.push(args);}},
  {get(target,key){return key in target?target[key]:()=>{};}});
const canvas={...element(),getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),
  setPointerCapture(){},addEventListener(type,fn){listeners.canvas[type]=fn;}};
const screen={...element(),addEventListener(type,fn){listeners.screen[type]=fn;}};
const elements=new Map([['#pitch',canvas],['#screen',screen]]);
const document={hidden:false,querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);},
  addEventListener(type,fn){listeners.document[type]=fn;}};
const storage=new Map([['kkoma-cup-round','2'],['kkoma-muted','false']]);
const spriteManifest=JSON.parse(readFileSync(new URL('../assets/players/manifest.json',import.meta.url),'utf8'));
class ImageStub{constructor(){this.complete=true;this.naturalWidth=128;this.src='';}}
const context={document,window:{},Image:ImageStub,Audio:AudioStub,Math:vmMath,devicePixelRatio:1,ResizeObserver:class{observe(){}},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  requestAnimationFrame(){},setTimeout(){return 1;},clearTimeout(){},fetch:async()=>({json:async()=>spriteManifest})};
const source=readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/\}\)\(\);\s*$/,
  'globalThis.testApi={countries,matchKits,colorDistance,project,startMatch,startTutorialExercise,enterTutorialDestination,resetPositions,resetTutorialScene,updateMatch,drawPlayer,playerSprites,tryManualTackle,updateHud,showHome,showTutorial,showTeams,pauseGame,finishMatch,playMusic,musicTracks,musicState:()=>({mode:musicMode,src:musicAudio?.src,paused:musicAudio?.paused,loop:musicAudio?.loop}),game:()=>game,pointer:()=>pointer,playersInPlay,appScreen:()=>appScreen,tutorialSession:()=>tutorialSession,screen,tutorialOverlay:document.querySelector("#tutorial-overlay"),tackleButton:document.querySelector("#tackle-button"),dragHint:document.querySelector("#drag-hint"),directionHint:document.querySelector("#attack-direction"),setCamera:y=>{cameraY=y}};})();');
vm.runInNewContext(source,context,{filename:'game.js'});
const t=context.testApi;

assert.equal(typeof t.playMusic,'function','music playback is wired into the game');
// Reproduction: the old tutorial only showed cards and could not launch focused practice.
t.showTutorial();
for(const step of ['move','pass','shot','tackle'])assert.match(t.screen.innerHTML,new RegExp(`data-action="tutorial-step"[^>]*data-step="${step}"`),`${step} practice is selectable`);
assert.match(t.screen.innerHTML,/data-action="tutorial-all"/,'tutorial offers a guided full sequence');
for(const track of [...t.musicTracks.menu,...t.musicTracks.match])assert.ok(existsSync(new URL(`../${track}`,import.meta.url)),`music asset exists: ${track}`);
for(const [mode,tracks] of Object.entries(t.musicTracks)){
  for(let i=0;i<tracks.length;i++){
    forcedRandom=(i+.2)/tracks.length;t.playMusic(mode,true);
    assert.equal(t.musicState().src,tracks[i],`${mode} playlist randomly selects track ${i+1}`);
    assert.equal(t.musicState().mode,mode);
    assert.equal(t.musicState().loop,true,'background music loops');
    assert.equal(t.musicState().paused,false,'selected music starts');
  }
}
forcedRandom=null;
t.startMatch();assert.equal(t.musicState().mode,'match','starting a match switches to match music');
const matchTrack=t.musicState().src;
t.pauseGame();assert.equal(t.musicState().paused,true,'pause stops background music');
listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'resume'}}:null}});
assert.equal(t.musicState().src,matchTrack,'resume keeps the selected match track');
assert.equal(t.musicState().paused,false,'resume restarts background music');
t.pauseGame();
listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'mute'}}:null}});
assert.equal(storage.get('kkoma-muted'),'true','mute setting is persisted');
assert.equal(t.musicState().paused,true,'mute stops background music');
t.playMusic('match');assert.equal(t.musicState().paused,true,'muted music cannot start');
listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'mute'}}:null}});
listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'resume'}}:null}});
assert.equal(t.musicState().paused,false,'unmute and resume restore background music');

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
  const {game,p}=setup(0,55,20,50);
  for(const player of game.players)if(player!==p)player.speed=0;
  const start=t.project(p.x,p.y),begin=stamp;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+65,start.y,begin+80));
  for(let n=0;n<300;n++)t.updateMatch(1/60);
  assert.ok(p.x>20,'a held drag keeps moving past the original 14-unit target');
  assert.ok(p.x<=33,'held drag stays inside the right field boundary');
  assert.equal(game.ball.owner,p,'long held drag keeps the ball');
  listeners.canvas.pointermove(event(start.x-65,start.y,begin+5080));
  for(let n=0;n<60;n++)t.updateMatch(1/60);
  assert.ok(p.x<25,'player can immediately reverse direction after reaching the edge');
  listeners.canvas.pointercancel(event(start.x-65,start.y,begin+6080));
  id++;stamp+=7000;
}
{
  const {game,p}=setup(0,55,20,50),start=t.project(p.x,p.y);
  listeners.canvas.pointerdown(event(start.x,start.y,stamp));
  listeners.canvas.pointermove(event(start.x+35,start.y-15,stamp+50));
  p.manualUntil=game.elapsed+4;p.tackleUntil=game.elapsed+4;p.kickUntil=game.elapsed+4;
  t.resetPositions(1);
  assert.equal(t.pointer(),null,'kickoff resets the active pointer');
  assert.equal(game.aim,null,'kickoff resets the aim guide');
  for(const player of game.players){
    assert.equal(player.manualUntil,0,'kickoff clears manual movement');
    assert.equal(player.tackleUntil,0,'kickoff clears tackle pressure');
    assert.equal(player.kickUntil,0,'kickoff clears stale kick animation');
  }
  assert.equal(game.ball.owner.side,1,'kickoff still assigns the requested side possession');
  id++;stamp+=1000;
}
{
  const {game,p}=setup(0,55,20,50),start=t.project(p.x,p.y);
  for(const player of game.players)if(player!==p)player.speed=0;
  listeners.canvas.pointerdown(event(start.x,start.y,stamp));
  listeners.canvas.pointermove(event(start.x,start.y-1000,stamp+50));
  for(let n=0;n<360;n++)t.updateMatch(1/60);
  assert.ok(p.y>=1&&p.y<=104,'held drag clamps the player inside the full pitch');
  listeners.canvas.pointermove(event(start.x,start.y,stamp+6050));
  for(let n=0;n<60;n++)t.updateMatch(1/60);
  assert.ok(p.y>1,'player can move away from the goal line');
  listeners.canvas.pointercancel(event(start.x,start.y,stamp+7050));
  id++;stamp+=8000;
}
{
  const {game,p,mate}=setup(0,55,10,50),start=t.project(p.x,p.y),target=t.project(mate.x,mate.y),begin=stamp;
  const dx=target.x-start.x,dy=target.y-start.y,length=Math.hypot(dx,dy),scale=70/length;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+dx*scale,start.y+dy*scale,begin+80));
  for(let n=0;n<72;n++)t.updateMatch(1/60);
  const preview=game.aim;
  assert.equal(preview.kind,'pass','held drag previews release pass even after a long hold');
  assert.ok(Math.abs(preview.x-p.x)<.01,'pass guide stays anchored to the moving player while finger is held still');
  listeners.canvas.pointerup(event(start.x+dx*scale,start.y+dy*scale,begin+1280));
  assert.equal(game.ball.lastKicker,p,'releasing a held drag performs the pass');
  id++;stamp+=2000;
}
{
  const {game,p,mate}=setup(0,55,8,50),start=t.project(p.x,p.y),target=t.project(mate.x,mate.y),begin=stamp;
  for(const player of game.players)if(player!==p&&player!==mate)player.speed=0;
  const dx=target.x-start.x,dy=target.y-start.y;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(target.x,target.y,begin+180));
  assert.equal(game.aim.kind,'pass','finger over a teammate shows pass');
  assert.equal(game.aim.target,mate,'the finger position selects its teammate');
  listeners.canvas.pointerup(event(target.x,target.y,begin+181));
  assert.equal(game.ball.lastKicker,p,'release kicks to the teammate shown by the guide');
  assert.equal(game.ball.vx*dx+game.ball.vy*dy>0,true,'the pass travels toward the displayed teammate');
  id++;stamp+=1000;
}
{
  const {game,p}=setup(0,55,20,50),start=t.project(p.x,p.y),begin=stamp;
  for(const player of game.players)if(player!==p)player.speed=0;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+27,start.y,begin+3000));
  listeners.canvas.pointerup(event(start.x+27,start.y,begin+3001));
  assert.equal(game.ball.lastKicker,p,'a slow held gesture still passes on release');
  id++;stamp+=1000;
}
{
  const {game,p}=setup(0,55,20,50),start=t.project(p.x,p.y),begin=stamp;
  for(const player of game.players)if(player!==p)player.speed=0;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x,start.y-100,begin+100));
  assert.equal(game.aim.kind,'pass','pointing at goal from far away previews a pass');
  listeners.canvas.pointercancel(event(start.x,start.y-100,begin+110));
  id++;stamp+=1000;
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
  t.startMatch();const game=t.game(),carrier=game.players[17],defender=game.players[6];
  for(const player of game.players.filter(player=>player.side===0)){player.x=-28;player.y=90;}
  defender.x=0;defender.y=55;carrier.x=2.5;carrier.y=55;carrier.nextDecisionAt=1000;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;
  const start=t.project(defender.x,defender.y),begin=stamp;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+30,start.y,begin+100));
  assert.equal(t.tryManualTackle(),true,'near tackle gains possession during the defensive drag');
  listeners.canvas.pointerup(event(start.x+30,start.y,begin+180));
  assert.equal(game.ball.owner,defender,'releasing a defensive drag keeps the newly won ball');
  assert.notEqual(game.ball.lastKicker,defender,'defensive release does not immediately kick the won ball');
  id++;stamp+=1000;
}
{
  t.startMatch();const game=t.game(),button=t.tackleButton,homePlayer=game.players[6],awayPlayer=game.players[17];
  game.ball.owner=homePlayer;t.updateHud();
  assert.equal(button.classList.contains('ready'),false,'tackle button is subdued when home has the ball');
  assert.equal(button.attributes.get('aria-label'),'상대가 공을 가졌을 때 태클');
  assert.equal(t.dragHint.textContent,'끌고 있으면 달리기 · 손 떼면 패스 · 골대 쪽은 슛');
  assert.equal(t.directionHint.textContent,'↑ 공격　↓ 우리 골대','first-half direction is clear');
  assert.equal(t.tryManualTackle(),false,'tackle press while home has the ball does not steal possession');
  game.ball.owner=awayPlayer;t.updateHud();
  assert.equal(button.classList.contains('ready'),true,'tackle button is highlighted when opponent has the ball');
  assert.equal(button.attributes.get('aria-label'),'상대가 공을 가졌어요. 태클 가능');
  assert.equal(t.dragHint.textContent,'공 가진 상대를 두 번 톡톡 · 태클 버튼도 가능');
  game.attackDir=1;t.updateHud();
  assert.equal(t.directionHint.textContent,'↓ 공격　↑ 우리 골대','second-half direction reverses');
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
  const firstExpiry=defender.manualUntil;
  assert.equal(t.tryManualTackle(),false,'repeat press during cooldown is harmless');
  assert.equal(defender.manualUntil,firstExpiry,'repeat presses do not extend the active tackle');
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
  defender.x=0;defender.y=55;carrier.x=4;carrier.y=55;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;
  assert.equal(t.tryManualTackle(),false,'four units away starts a chase instead of stealing instantly');
  assert.equal(game.ball.owner,carrier,'out-of-contact tackle does not change possession');
}
{
  t.startMatch();const game=t.game(),carrier=game.players[17],defender=game.players[6],keeper=game.players[0];
  for(const player of game.players.filter(player=>player.side===0)){player.x=-28;player.y=90;}
  keeper.x=0;keeper.y=55;defender.x=4;defender.y=55;carrier.x=.5;carrier.y=55;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.elapsed=2;
  assert.equal(t.tryManualTackle(),false,'goalkeeper is not selected as a field tackler');
  assert.equal(defender.targetX,carrier.x,'nearest eligible field player starts the pressure');
  assert.equal(game.ball.owner,carrier,'field player must reach contact to win possession');
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

for(const [side,step,stepsBeforeReady] of [[0,1/60,59],[1,1/30,29]]){
  t.startMatch();const game=t.game(),keeper=game.players.find(player=>player.side===side&&player.role==='GK');
  for(const player of game.players)player.speed=0;
  game.ball.owner=null;game.ball.x=keeper.x;game.ball.y=keeper.y;game.ball.vx=game.ball.vy=0;
  game.ball.lastKicker=game.players.find(player=>player.side!==side);game.elapsed=2;
  t.updateMatch(step);
  assert.equal(game.ball.owner,keeper,`GK ${side} receives the loose ball`);
  assert.equal(game.restart?.kind,'keeper',`GK ${side} starts a timed distribution`);
  if(side===1){
    t.updateHud();
    assert.equal(t.tackleButton.classList.contains('ready'),false,'tackle is unavailable during the opponent keeper restart');
    assert.match(t.tackleButton.attributes.get('aria-label'),/골키퍼/,'keeper restart explains the tackle state');
    assert.equal(t.tryManualTackle(),false,'opponent keeper cannot be pressured during a restart');
    assert.equal(game.manualTackler,null,'restart tackle input does not leave a stale chase');
  }
  for(let n=0;n<stepsBeforeReady;n++)t.updateMatch(step);
  assert.equal(game.ball.owner,keeper,`GK ${side} keeps the ball until one active second`);
  assert.equal(game.ball.lastKicker,null,`GK ${side} does not release early`);
  t.updateMatch(step);t.updateMatch(step);
  assert.equal(game.ball.lastKicker,keeper,`GK ${side} releases once after one active second`);
  assert.equal(game.restart,null,`GK ${side} clears the restart state after release`);
}
{
  t.startMatch();const game=t.game(),keeper=game.players[0],mate=game.players[1];
  for(const player of game.players)player.speed=0;
  mate.x=20;
  game.ball.owner=null;game.ball.x=keeper.x;game.ball.y=keeper.y;game.ball.vx=game.ball.vy=0;
  game.ball.lastKicker=game.players[17];game.elapsed=2;t.updateMatch(1/60);
  const restartReadyAt=game.restart.readyAt;
  for(let n=0;n<32;n++)t.updateMatch(1/60);
  const start=t.project(keeper.x,keeper.y),target=t.project(mate.x,mate.y),begin=stamp++;
  assert.ok(start.y>70&&start.y<800,'keeper is visible during the distribution window');
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(target.x,target.y,begin+100));
  assert.equal(game.aim.target,mate,'keeper restart guide highlights the chosen receiver');
  listeners.canvas.pointerup(event(target.x,target.y,begin+110));id++;
  assert.equal(game.restart.queuedTarget,mate,'release queues the displayed keeper pass');
  for(let n=0;n<12;n++)t.updateMatch(1/60);
  t.pauseGame();const pausedAt=game.elapsed;
  for(let n=0;n<120;n++)t.updateMatch(1/60);
  assert.equal(game.elapsed,pausedAt,'the one-second restart timer stops while paused');
  listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'resume'}}:null}});
  for(let n=0;n<14;n++)t.updateMatch(1/60);
  assert.equal(game.ball.lastKicker,null,'resume keeps the remaining restart time');
  for(let n=0;n<4;n++)t.updateMatch(1/60);
  assert.ok(keeper.actionStartedAt>=restartReadyAt,'queued pass launches after one active second');
  for(let n=0;n<72;n++)t.updateMatch(1/60);
  assert.equal(game.ball.owner,mate,'queued pass reaches the selected teammate');
  assert.equal(game.restart,null,'queued keeper pass clears restart state');
  stamp+=1000;
}
{
  for(const [attackDir,end] of [[-1,0],[1,105]]){
    t.startMatch();const game=t.game();game.attackDir=attackDir;game.period=attackDir<0?1:2;
    for(const player of game.players)player.speed=0;
    game.ball.owner=null;game.ball.x=20;game.ball.y=end===0?-.1:105.1;game.ball.vx=0;game.ball.vy=end===0?-1:1;game.lastTouch=0;
    t.updateMatch(1/60);
    assert.equal(game.restart?.kind,'goalKick',`missed goal line ${end} starts a goal kick`);
    assert.equal(game.restart.side,1,`defending team at goal line ${end} takes the restart`);
    assert.equal(game.ball.vy,0,'the ball stays still while the goal kick is prepared');
    for(let n=0;n<58;n++)t.updateMatch(1/60);
    assert.equal(game.ball.lastKicker,null,'goal kick waits for its preparation second');
    t.updateMatch(1/60);t.updateMatch(1/60);t.updateMatch(1/60);
    assert.equal(game.ball.lastKicker.role,'GK',`goal kick at ${end} uses the goalkeeper distribution`);
    assert.equal(game.restart,null,'goal kick clears its restart state after release');
  }
}
{
  t.showTutorial('cup');
  assert.match(t.screen.innerHTML,/조작 연습/,'tutorial opens its touch-first menu');
  assert.match(t.screen.innerHTML,/처음부터 연습/,'tutorial provides the ordered practice flow');
  t.enterTutorialDestination();
  assert.equal(t.appScreen(),'teams','skip enters team selection');
  assert.match(t.screen.innerHTML,/🏆 .* 시작/,'skip preserves the pending cup destination');
  assert.equal(storage.get('kkoma-cup-round'),'2','tutorial skip preserves saved cup progress');
}
{
  t.showTutorial('cup');t.startTutorialExercise('move','all');
  const game=t.game(),tutorial=game.tutorial,p=tutorial.player,start=t.project(p.x,p.y),begin=stamp++;
  assert.equal(game.mode,'tutorial');assert.equal(game.players.length,22,'tutorial preserves roster indices');
  assert.equal(t.playersInPlay().length,1,'movement scene contains only its active player');
  assert.equal(tutorial.pendingMode,'cup','tutorial records the original cup intent');
  advance(7);assert.equal(t.appScreen(),'match','an untouched tutorial does not fail');
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+125,start.y,begin+80));
  advance(1.2);
  assert.equal(t.appScreen(),'tutorial-result','real player movement completes the move exercise');
  assert.equal(tutorial.phase,'success');
  listeners.canvas.pointerup(event(start.x+125,start.y,begin+90));
  assert.equal(game.ball.lastKicker,null,'movement completion cannot leak a kick on release');
  assert.match(t.screen.innerHTML,/data-action="tutorial-next"/,'sequence offers an explicit next button');
  listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'tutorial-next'}}:null}});
  assert.equal(t.game().tutorial.stepId,'pass','sequence advances only after the next button');
  assert.equal(t.game().tutorial.flow,'all');
}
{
  t.showTutorial('practice');t.startTutorialExercise('pass','single');
  const game=t.game(),tutorial=game.tutorial,p=tutorial.player,mate=game.players[9];
  assert.equal(t.playersInPlay().length,2,'pass scene has only passer and receiver');
  assert.equal(mate.x,6);assert.equal(mate.y,48);
  const a=t.project(p.x,p.y),b=t.project(mate.x,mate.y),begin=stamp++;
  listeners.canvas.pointerdown(event(a.x,a.y,begin));
  listeners.canvas.pointerup(event(a.x,a.y,begin+2));
  assert.equal(tutorial.phase,'playing','a tap cannot complete a pass');
  listeners.canvas.pointerdown(event(a.x,a.y,begin+20));
  listeners.canvas.pointermove(event(b.x,b.y,begin+100));
  listeners.canvas.pointerup(event(b.x,b.y,begin+110));id++;
  assert.equal(game.tutorial.action?.kind,'pass','release executes a real pass');
  assert.equal(game.tutorial.action?.target,mate,'pass target is recorded from the real gesture');
  advance(1.2);
  assert.equal(game.ball.owner,mate,'the selected teammate receives the real ball');
  assert.equal(t.appScreen(),'tutorial-result','only the designated teammate receiving completes pass');
  assert.equal(game.score[0],0,'passing does not alter score');
  assert.doesNotMatch(t.screen.innerHTML,/data-action="tutorial-next"/,'single pass offers a choice instead of auto-advancing');
}
{
  t.showTutorial('practice');t.startTutorialExercise('pass','single');
  const game=t.game(),tutorial=game.tutorial,p=tutorial.player,start=t.project(p.x,p.y),begin=stamp++;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x-130,start.y+80,begin+80));
  listeners.canvas.pointerup(event(start.x-130,start.y+80,begin+90));id++;
  assert.equal(tutorial.action?.kind,'pass','off-target release still follows the real pass path');
  assert.notEqual(tutorial.action.target,game.players[9],'off-target pass cannot receive tutorial credit');
  advance(4.2);
  assert.equal(game.tutorial.stepId,'pass','miss restarts the same exercise');
  assert.equal(game.tutorial.phase,'playing');
  assert.equal(game.tutorial.action,null,'retry clears the prior action');
  assert.equal(game.tutorial.activePlayers.length,2,'retry restores the scene roster');
}
{
  t.showTutorial('practice');t.startTutorialExercise('shot','single');
  const game=t.game(),tutorial=game.tutorial,p=tutorial.player,a=t.project(p.x,p.y),b=t.project(0,0),begin=stamp++;
  assert.equal(t.playersInPlay().length,1,'shot scene excludes every defender and keeper');
  listeners.canvas.pointerdown(event(a.x,a.y,begin));
  listeners.canvas.pointermove(event(b.x,b.y,begin+90));
  assert.equal(game.aim.kind,'shot','goal-directed swipe previews a shot');
  listeners.canvas.pointerup(event(b.x,b.y,begin+100));id++;
  assert.equal(game.tutorial.action?.kind,'shot','shot exercise records the real shot action');
  advance(1.2);
  assert.equal(game.score[0],0,'tutorial goal is not persisted as a match score');
  assert.equal(t.appScreen(),'tutorial-result','only the real goal completes shot practice');
}
{
  t.showTutorial('practice');t.startTutorialExercise('tackle','single');
  const game=t.game(),tutorial=game.tutorial,carrier=game.ball.owner,defender=game.players[6];
  assert.equal(t.playersInPlay().length,2,'tackle scene contains only attacker and defender');
  advance(7);assert.equal(t.appScreen(),'match','tackle demo alone does not steal the ball');
  assert.equal(game.ball.owner,carrier,'automatic pressure is disabled in tackle practice');
  assert.equal(t.tackleButton.classList.contains('hidden'),false,'button appears after the double-tap demo');
  t.pauseGame();listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'resume'}}:null}});
  assert.equal(t.tackleButton.classList.contains('hidden'),false,'resume restores the delayed tackle button');
  const point=t.project(carrier.x,carrier.y),tap=(time)=>{listeners.canvas.pointerdown(event(point.x,point.y,time));listeners.canvas.pointerup(event(point.x,point.y,time+1));id++;};
  tap(stamp);tap(stamp+150);stamp+=1000;
  assert.equal(game.tutorial.action?.kind,'tackle','a real double tap starts a manual tackle');
  assert.equal(game.ball.owner,carrier,'chase does not count before physical contact');
  advance(2.5);
  assert.equal(game.ball.owner,defender,'the existing chase reaches and wins the ball');
  assert.equal(t.appScreen(),'tutorial-result','physical manual tackle completes the exercise');
}
{
  t.showTutorial('cup');t.startTutorialExercise('pass','all');
  const game=t.game();t.finishMatch();assert.equal(game.ended,false,'tutorial cannot enter a normal match result');
  advance(151);assert.equal(t.appScreen(),'match','tutorial has no half-time or full-time timeout');
  t.pauseGame();assert.equal(t.appScreen(),'pause');
  listeners.screen.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'resume'}}:null}});
  assert.equal(t.appScreen(),'match');assert.equal(game.paused,false,'tutorial resumes from its pause screen');
  assert.equal(t.tutorialOverlay.classList.contains('hidden'),false,'resume restores the touch-through tutorial overlay');
  assert.equal(t.musicState().mode,'menu','tutorial resume restores menu music');
  assert.equal(storage.get('kkoma-cup-round'),'2','tutorial play and pause preserve cup progress');
}
console.log('PASS: mobile controls, tutorials, tackling, keeper restarts, randomized music, and Korea sprite fallback');
