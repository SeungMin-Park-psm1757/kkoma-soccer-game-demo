import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const listeners={canvas:{},document:{},screen:{}};
const element=()=>{const classes=new Set();return {classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)},
  addEventListener(){},getBoundingClientRect(){return {top:0,bottom:62,left:0,right:0,width:0,height:62};},innerHTML:'',textContent:''};};
const drawImages=[];
const ctx=new Proxy({setTransform(){},drawImage(...args){drawImages.push(args);}},
  {get(target,key){return key in target?target[key]:()=>{};}});
const canvas={...element(),getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),
  setPointerCapture(){},addEventListener(type,fn){listeners.canvas[type]=fn;}};
const screen={...element(),addEventListener(type,fn){listeners.screen[type]=fn;}};
const elements=new Map([['#pitch',canvas],['#screen',screen],['#hud',element()],['#hint',element()],['#drag-hint',element()]]);
const document={hidden:false,querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);},
  addEventListener(type,fn){listeners.document[type]=fn;}};
const storage=new Map([['kkoma-cup-round','2'],['kkoma-muted','true']]);
const spriteManifest=JSON.parse(readFileSync(new URL('../assets/players/manifest.json',import.meta.url),'utf8'));
class ImageStub{constructor(){this.complete=true;this.naturalWidth=128;this.src='';}}
const context={document,window:{},Image:ImageStub,getComputedStyle:()=>({getPropertyValue:()=> '0px'}),devicePixelRatio:1,ResizeObserver:class{observe(){}},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  requestAnimationFrame(){},setTimeout(){return 1;},clearTimeout(){},fetch:async()=>({json:async()=>spriteManifest})};
const source=readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/\}\)\(\);\s*$/,
  'globalThis.testApi={countries,matchKits,colorDistance,project,unproject,startMatch,updateMatch,drawPlayer,playerSprites,resolveTackleGesture,reviewControlledDefender,nearestPlayers,nearestFieldPlayer,beginTackle,attackGoal,ownGoal,pointer:()=>pointer,game:()=>game,setCamera:y=>{cameraY=y}};})();');
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
  const {game,p}=setup(0,18,20,50);
  assert.equal(drag(p,30,-10,900).kind,'move','slow dribble');
  assert.equal(game.ball.owner,p,'dribble retains ball');
  assert.equal(drag(p,0,-110,95).kind,'shot','shot after dribble');
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

// Holding a movement drag keeps advancing toward a moving target until field bounds.
{
  const {game,p}=setup(0,60,8,57),start=t.project(p.x,p.y),begin=stamp;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x,start.y+50,begin+400));
  assert.equal(game.aim.kind,'move','slow drag remains movement');
  advance(4);
  assert.ok(p.y>74,'held drag continues beyond the former 14-unit limit');
  assert.ok(p.y<=103,'carrier and attached ball stay inside the goal line');
  assert.ok(game.players.every(player=>player.x>=-33&&player.x<=33&&player.y>=1&&player.y<=104),'players stay inside the field bounds');
  const heldY=p.y;
  listeners.canvas.pointerup(event(start.x,start.y+50,begin+401));
  advance(.5);
  assert.ok(Math.abs(p.y-heldY)<.3,'attack movement stops when the finger lifts');
  assert.ok(game.ball.y<=105,'attached ball does not cross the own goal line');
}

// Movement follows the unobstructed component along field edges.
{
  const {game,p}=setup(0,60,8,57),start=t.project(p.x,p.y),begin=stamp;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+70,start.y+50,begin+500));
  advance(3);
  assert.ok(p.x<=33&&p.x>0,'horizontal movement respects the sideline');
  assert.ok(p.y>70,'open diagonal component keeps moving beside the sideline');
  listeners.canvas.pointerup(event(start.x+70,start.y+50,begin+501));
  stamp+=1000;
}

function setupDefense(gap=2.8){
  t.startMatch();const game=t.game(),defender=game.players[6],carrier=game.players[17];
  for(const p of game.players){p.x=p.side===0?28:-28;p.y=p.side===0?90:10;p.homeX=p.x;p.homeY=p.y;p.nextDecisionAt=1000;}
  defender.x=0;defender.y=50;defender.homeX=0;defender.homeY=50;
  carrier.x=gap;carrier.y=50;carrier.homeX=gap;carrier.homeY=50;
  const awayKeeper=game.players[11];awayKeeper.x=gap+.1;awayKeeper.y=50;
  game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.ball.vx=game.ball.vy=0;
  game.controlled=defender.index;game.nextTackleAt=1000;game.defenseReviewAt=1000;t.setCamera(50);
  return {game,defender,carrier};
}

// Defense stays on field players even when the goalkeeper is closer to the carrier.
{
  const {game,carrier}=setupDefense();
  assert.notEqual(t.nearestPlayers(0,carrier.x,carrier.y)[0].role,'GK','goalkeeper is excluded from press roles');
  t.reviewControlledDefender(carrier);
  assert.notEqual(game.players[game.controlled].role,'GK','automatic selection never chooses goalkeeper');
}

// A direction-correct defensive swipe previews and starts one manual tackle.
{
  const {game,defender,carrier}=setupDefense();
  const start=t.project(defender.x,defender.y),begin=stamp;
  listeners.canvas.pointerdown(event(start.x,start.y,begin));
  listeners.canvas.pointermove(event(start.x+35,start.y,begin+60));
  assert.equal(game.aim.kind,'tackle','valid defensive swipe shows tackle preview');
  assert.equal(game.aim.target,carrier,'tackle preview locks onto the current carrier');
  listeners.canvas.pointerup(event(start.x+35,start.y,begin+61));
  assert.ok(game.tackle,'release starts tackle dash');
  for(let n=0;n<30;n++)t.updateMatch(1/120);
  assert.equal(game.ball.owner,defender,'tackle reaches the ball and transfers possession');
  assert.equal(game.tackle,null,'successful tackle ends dash');
  assert.equal(t.beginTackle(defender,carrier),false,'cooldown prevents an immediate second tackle');
  stamp+=1000;
}

for(let n=0;n<20;n++){
  const {game,defender,carrier}=setupDefense(2.8);
  assert.equal(t.beginTackle(defender,carrier),true,`tackle starts ${n}`);
  for(let step=0;step<18;step++)t.updateMatch(1/60);
  assert.equal(game.ball.owner,defender,`tackle contact succeeds ${n}`);
}
for(const fps of [30,60,120]){
  const {game,defender,carrier}=setupDefense(2.8);
  assert.equal(t.beginTackle(defender,carrier),true,`tackle starts at ${fps}fps`);
  for(let step=0;step<Math.ceil(.3*fps);step++)t.updateMatch(1/fps);
  assert.equal(game.ball.owner,defender,`same tackle succeeds at ${fps}fps`);
  stamp+=1000;
}

// Distance and cooldown rules make a bad tackle miss without changing possession.
{
  const {game,defender,carrier}=setupDefense(5.4);
  assert.equal(t.beginTackle(defender,carrier),true,'outer reach can start a tackle');
  for(let n=0;n<30;n++)t.updateMatch(1/120);
  assert.equal(game.ball.owner,carrier,'out-of-reach dash does not steal the ball');
  assert.equal(game.tackle,null,'miss ends after the lunge');
  assert.equal(t.beginTackle(defender,carrier),false,'miss recovery blocks another tackle');
}

// Tap-to-select locks a nearby field defender briefly; cancel never tackles.
{
  const {game,defender,carrier}=setupDefense();
  const chosen=game.players[7];chosen.x=4;chosen.y=50;
  const spot=t.project(chosen.x,chosen.y),begin=stamp;
  listeners.canvas.pointerdown(event(spot.x,spot.y,begin));
  listeners.canvas.pointerup(event(spot.x,spot.y,begin+10));
  assert.equal(game.controlled,chosen.index,'short tap selects the touched defender');
  assert.ok(chosen.userSelectUntil>game.elapsed,'manual defender selection is held briefly');
  const start=t.project(defender.x,defender.y),cancelAt=begin+100;
  listeners.canvas.pointerdown(event(start.x,start.y,cancelAt));
  listeners.canvas.pointermove(event(start.x+35,start.y,cancelAt+60));
  listeners.canvas.pointercancel(event(start.x+35,start.y,cancelAt+61));
  assert.equal(game.tackle,null,'pointercancel cancels tackle');
  assert.equal(game.ball.owner,carrier,'cancelled tackle preserves possession');
  stamp+=1000;
}

// Goal direction is derived from the same attackGoal used by scoring.
{
  const {game}=setup(0,50,6,48);
  assert.equal(t.attackGoal(0),0,'first half attacks toward the north goal');
  assert.equal(t.ownGoal(0),105,'first half defends the south goal');
  game.elapsed=74.99;t.updateMatch(.02);
  assert.equal(game.period,2,'second half starts at halftime');
  assert.equal(t.attackGoal(0),105,'second half arrow follows the reversed attack goal');
  assert.equal(t.ownGoal(0),0,'second half defense arrow follows our goal');
}

console.log('PASS: attack regression, sustained mobile drag, tackle success/miss/cooldown/cancel, defender selection, halftime direction, and sprite fallback');
