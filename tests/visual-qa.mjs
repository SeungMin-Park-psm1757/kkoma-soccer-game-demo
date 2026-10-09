import { chromium } from 'playwright-core';

const browser=await chromium.launch({channel:'chrome',headless:true});
const viewports=[[360,800],[390,844],[412,915]];
const origin=`http://127.0.0.1:${process.env.PORT||8000}`;
const monitoredPages=new WeakMap();
if(process.argv.includes('--national-art-only')){
  const countries=[
    {id:6,name:'대한민국',primary:'#e7263f'},
    {id:1,name:'브라질',primary:'#f7d927'},
    {id:2,name:'프랑스',primary:'#244ea8'},
    {id:7,name:'일본',primary:'#2450a4'},
    {id:3,name:'독일',primary:'#f4f4f4'},
    {id:0,name:'아르헨티나',primary:'#8ecdf4'}
  ];
  for(const country of countries){
    const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    monitorPage(page);
    await page.addInitScript(()=>{
      window.__nationalSpriteDraws=[];
      const drawImage=CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
        if(image?.dataset?.uniformSource)window.__nationalSpriteDraws.push({...image.dataset});
        return drawImage.call(this,image,...args);
      };
    });
    await page.goto(origin,{waitUntil:'networkidle'});
    await page.evaluate(()=>localStorage.setItem('kkoma-tutorial-done','true'));
    await page.reload({waitUntil:'networkidle'});
    await page.click('[data-action="team"]');
    await page.click(`[data-team="${country.id}"]`);
    await page.click('[data-action="play"]');
    await page.waitForTimeout(900);
    const draws=await page.evaluate(()=>window.__nationalSpriteDraws);
    if(!draws.some(sprite=>sprite.teamPrimary===country.primary))throw new Error(`${country.name} generated kit art was not drawn at 390x844`);
    if(!draws.some(sprite=>sprite.uniformSource.endsWith('/idle.webp')||sprite.uniformSource.endsWith('/goalkeeper-idle.webp')))
      throw new Error(`${country.name} idle sprite was not drawn at 390x844`);
    await page.screenshot({path:`visual-qa/national-team-${country.id}-${country.name}.png`,fullPage:true});
    assertNoBrowserErrors(page,`national art ${country.name}`);
    await page.close();
    console.log(`PASS: ${country.name} generated national player art at 390x844`);
  }
  await browser.close();
  process.exit(0);
}
function monitorPage(page){
  const errors=[];monitoredPages.set(page,errors);
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console: ${message.text()}`);});
  page.on('requestfailed',request=>{const failure=request.failure()?.errorText;if(failure!=='net::ERR_ABORTED')errors.push(`requestfailed: ${request.url()} (${failure})`);});
  page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))errors.push(`HTTP ${response.status()}: ${response.url()}`);});
}
function assertNoBrowserErrors(page,label){const errors=monitoredPages.get(page)||[];if(errors.length)throw new Error(`${label}: ${errors.join('; ')}`);}
async function assertTouchLayout(page,width,height,label){
  const result=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>innerWidth||document.body.scrollWidth>innerWidth,
    buttons:[...document.querySelectorAll('button')].filter(button=>getComputedStyle(button).display!=='none'&&button.getClientRects().length).map(button=>({label:button.getAttribute('aria-label')||button.textContent.trim(),className:button.className,scrollable:Boolean(button.closest('.team-grid')),...(()=>{const r=button.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};})()}))
  }));
  if(result.overflow)throw new Error(`${label} has horizontal overflow at ${width}x${height}`);
  for(const button of result.buttons){
    if(button.width<=0||button.height<=0)throw new Error(`${label} has a zero-size button: ${button.label}`);
    if(!button.scrollable&&(button.x<0||button.y<0||button.x+button.width>width||button.y+button.height>height))throw new Error(`${label} button clipped at ${width}x${height}: ${button.label}`);
    if(/game-button|tutorial-tile|team-card|tackle-button|icon-button|tutorial-control/.test(button.className)&&Math.min(button.width,button.height)<44)throw new Error(`${label} important touch target is under 44px: ${button.label}`);
  }
}

if(process.argv.includes('--ending-only')){
  const makeJourney=()=> {
    const opponents=[1,2,3,4,5];
    const wins=opponents.map((awayId,round)=>({
      round,homeId:6,awayId,score:[round===4?2:1,0],shootout:null,
      goalEvents:Array.from({length:round===4?2:1},(_,index)=>({elapsed:12+index*18,side:0,score:[index+1,0]}))
    }));
    return {version:1,current:{startedRound:0,completed:true,wins},lastChampion:{countryId:6,wins,factId:null}};
  };
  const assertFits=async(page,width,height,label)=>{
    const card=page.locator('.ending-card'),bounds=await card.boundingBox();
    if(!bounds||bounds.y<0||bounds.y+bounds.height>height)throw new Error(`${label} card clipped at ${width}x${height}`);
    const actions=page.locator('.ending-actions .game-button');
    const count=await actions.count();
    if(count){
      const buttonBounds=await actions.last().boundingBox();
      if(!buttonBounds||buttonBounds.y+buttonBounds.height>height)throw new Error(`${label} controls clipped at ${width}x${height}`);
    }
  };
  for(const [width,height] of viewports){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    monitorPage(page);
    const journey=makeJourney();
    await page.addInitScript(value=>{
      localStorage.setItem('kkoma-tutorial-done','true');
      localStorage.setItem('kkoma-cup-round','4');
      localStorage.setItem('kkoma-cup-journey-v1',JSON.stringify(value));
    },journey);
    await page.goto(origin,{waitUntil:'networkidle'});
    if(!/꼬마 축구/.test(await page.locator('.title').textContent()||''))throw new Error(`game did not boot at ${width}x${height}`);
    if(!await page.evaluate(()=>new Audio().canPlayType('audio/mpeg')))throw new Error(`browser cannot play MPEG audio at ${width}x${height}`);
    if(await page.evaluate(()=>Object.keys(window.KKOMA_ENDING_CONTENT?.countryStories||{}).length)!==48)throw new Error(`ending stories failed to load at ${width}x${height}`);
    if(!(await page.evaluate(()=>document.fonts.check('16px "Noto Sans CJK KR"'))))throw new Error(`Korean QA font unavailable at ${width}x${height}`);
    await page.click('[data-action="ending-replay"]');
    await page.waitForSelector('.ending-card');
    if(!/1\/7/.test(await page.locator('.ending-count').textContent()||''))throw new Error(`ending did not open on the first Korea card at ${width}x${height}`);
    await assertFits(page,width,height,'ending first');
    await assertTouchLayout(page,width,height,'ending first');
    await page.screenshot({path:`visual-qa/ending-first-${width}x${height}.png`,fullPage:true});

    await page.waitForFunction(()=>document.querySelector('.ending-count')?.textContent.includes('2/7'),null,{timeout:8000});
    if(await page.locator('.ending-results li').count()!==5)throw new Error(`ending recap does not show five wins at ${width}x${height}`);
    await assertFits(page,width,height,'ending recap');
    await assertTouchLayout(page,width,height,'ending recap');
    await page.screenshot({path:`visual-qa/ending-recap-${width}x${height}.png`,fullPage:true});

    await page.click('[data-action="ending-skip"]');
    if(!await page.locator('[data-action="cup-new"]').count()||!await page.locator('[data-action="ending-replay"]').count())throw new Error(`ending final actions missing at ${width}x${height}`);
    await assertFits(page,width,height,'ending final');
    await assertTouchLayout(page,width,height,'ending final');
    await page.screenshot({path:`visual-qa/ending-final-${width}x${height}.png`,fullPage:true});
    assertNoBrowserErrors(page,`ending ${width}x${height}`);
    await page.close();
  }
  await browser.close();
  console.log('PASS: real ending flow fits 360x800, 390x844, and 412x915 with Korean fonts');
  process.exit(0);
}

async function openKorea(width,height){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  monitorPage(page);
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.evaluate(()=>localStorage.setItem('kkoma-tutorial-done','true'));
  await page.reload({waitUntil:'networkidle'});
  await page.click('[data-action="team"]');
  await page.click('[data-team="6"]');
  await page.click('[data-action="play"]');
  await page.waitForTimeout(900);
  return page;
}

async function openTutorial(width,height){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  monitorPage(page);
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.click('[data-action="team"]');
  return page;
}

function center(width,height){return {x:width/2,y:78+(height-82)*0.5};}

for(const [width,height] of viewports){
  {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    monitorPage(page);await page.goto(origin,{waitUntil:'networkidle'});
    await page.screenshot({path:`visual-qa/home-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'home menu');
    await page.evaluate(()=>localStorage.setItem('kkoma-tutorial-done','true'));
    await page.reload({waitUntil:'networkidle'});await page.click('[data-action="team"]');
    await page.screenshot({path:`visual-qa/team-select-${width}x${height}.png`,fullPage:true});
    if(!await page.locator('.team-grid').count())throw new Error(`team selection missing at ${width}x${height}`);
    await assertTouchLayout(page,width,height,'team selection');
    assertNoBrowserErrors(page,`home/team ${width}x${height}`);await page.close();
  }
  {
    const page=await openTutorial(width,height);
    await page.screenshot({path:`visual-qa/tutorial-menu-${width}x${height}.png`,fullPage:true});
    const menuBounds=await page.locator('.tutorial-menu').boundingBox();
    if(!menuBounds||menuBounds.y<0||menuBounds.y+menuBounds.height>height)throw new Error(`tutorial menu clipped at ${width}x${height}`);
    await assertTouchLayout(page,width,height,'tutorial menu');
    await page.click('[data-action="penalty-practice"]');
    await page.waitForFunction(()=>document.querySelector('#drag-hint')?.textContent.includes('페널티킥'));
    await page.screenshot({path:`visual-qa/penalty-setup-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'penalty setup');
    const shotStart={x:width/2,y:78+(height-82)*11/62};
    await page.mouse.move(shotStart.x,shotStart.y);await page.mouse.down();
    await page.mouse.move(shotStart.x+35,shotStart.y-100,{steps:4});await page.mouse.up();
    await page.waitForSelector('[data-action="penalty-again"]',{timeout:3000});
    await page.screenshot({path:`visual-qa/penalty-result-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'penalty result');
    await page.click('[data-action="penalty-again"]');
    await page.waitForFunction(()=>document.querySelector('#drag-hint')?.textContent.includes('페널티킥'));
    await page.locator('#back-button').click();
    await page.click('[data-action="tutorial"]');
    await page.click('[data-action="tutorial-step"][data-step="move"]');
    await page.waitForTimeout(100);
    if(await page.locator('#tutorial-overlay').evaluate(node=>node.classList.contains('hidden')))throw new Error(`tutorial overlay missing at ${width}x${height}`);
    await page.screenshot({path:`visual-qa/tutorial-move-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'tutorial move');
    await page.locator('[data-tutorial-action="menu"]').click();
    await page.click('[data-action="tutorial-step"][data-step="tackle"]');
    await page.waitForTimeout(6100);
    const tackleBounds=await page.locator('#tackle-button').boundingBox();
    if(!tackleBounds||tackleBounds.y<0||tackleBounds.y+tackleBounds.height>height)throw new Error(`tutorial tackle button clipped at ${width}x${height}`);
    await page.screenshot({path:`visual-qa/tutorial-tackle-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'tutorial tackle');
    assertNoBrowserErrors(page,`tutorial ${width}x${height}`);
    await page.close();
  }
  if(process.argv.includes('--tutorial-only'))continue;

  {
    const page=await openKorea(width,height);
    await page.screenshot({path:`visual-qa/korea-idle-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'match idle');
    const start=center(width,height);
    await page.mouse.move(start.x,start.y);
    await page.mouse.down();
    await page.mouse.move(start.x+28,start.y-18,{steps:10});
    await page.waitForTimeout(180);
    await page.screenshot({path:`visual-qa/korea-run-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'match run');
    await page.mouse.up();
    assertNoBrowserErrors(page,`match run ${width}x${height}`);
    await page.close();
  }

  {
    const page=await openKorea(width,height);
    const start=center(width,height);
    await page.mouse.move(start.x,start.y);
    await page.mouse.down();
    await page.mouse.move(start.x+38,start.y-18,{steps:3});
    await page.mouse.up();
    await page.waitForTimeout(80);
    await page.screenshot({path:`visual-qa/korea-pass-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'match pass');
    assertNoBrowserErrors(page,`match pass ${width}x${height}`);
    await page.close();
  }

  {
    const page=await openKorea(width,height);
    const start=center(width,height);
    await page.mouse.move(start.x,start.y);
    await page.mouse.down();
    await page.mouse.move(start.x,start.y-105,{steps:3});
    await page.mouse.up();
    await page.waitForTimeout(90);
    await page.screenshot({path:`visual-qa/korea-forward-intent-${width}x${height}.png`,fullPage:true});
    await assertTouchLayout(page,width,height,'match shot intent');
    assertNoBrowserErrors(page,`match shot intent ${width}x${height}`);
    await page.close();
  }
}
await browser.close();
