import { chromium } from 'playwright-core';

const browser=await chromium.launch({channel:'chrome',headless:true});
const viewports=[[360,800],[390,844],[412,915]];
const origin=`http://127.0.0.1:${process.env.PORT||8000}`;

if(process.argv.includes('--ending-only')){
  for(const [width,height] of viewports){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
    await page.goto(origin,{waitUntil:'networkidle'});
    if(!/꼬마 축구/.test(await page.locator('.title').textContent()||''))throw new Error(`game did not boot at ${width}x${height}`);
    if(await page.evaluate(()=>Object.keys(window.KKOMA_ENDING_CONTENT?.countryStories||{}).length)!==48)throw new Error(`ending stories failed to load at ${width}x${height}`);
    await page.evaluate(()=>{
      const screen=document.querySelector('#screen');screen.className='screen ending-screen';
      const results=Array.from({length:5},(_,index)=>`<li><span>${['32강','16강','8강','4강','결승'][index]} · 🇰🇷 대한민국 vs 🇧🇷 브라질</span><strong>3 : 1</strong></li>`).join('');
      screen.innerHTML=`<article class="panel ending-card"><div class="ending-count">우승 이야기 · 2/8</div><div class="ending-picture">⚽</div><h2 class="selection-title">우승까지 만난 팀들</h2><ol class="ending-results">${results}</ol><div class="ending-message"><p>한 경기씩, 여기까지 왔네!</p></div><div class="ending-actions"><button class="game-button">◀ 이전</button><button class="game-button">다음 ▶</button></div></article>`;
    });
    const card=page.locator('.ending-card'),buttons=page.locator('.ending-actions button');
    const bounds=await card.boundingBox(),buttonBounds=await buttons.last().boundingBox();
    if(!bounds||bounds.y<0||bounds.y+bounds.height>height||!buttonBounds||buttonBounds.y+buttonBounds.height>height)throw new Error(`ending card or controls clipped at ${width}x${height}`);
    await page.locator('.ending-picture').evaluate(node=>{node.removeAttribute('aria-hidden');node.innerHTML='<img class="ending-art" data-ending-image data-fallback="⚽" src="/assets/ending/missing.webp" alt="">';});
    await page.waitForFunction(()=>document.querySelector('.ending-picture')?.textContent.trim()==='⚽');
    await page.screenshot({path:`visual-qa/ending-recap-${width}x${height}.png`,fullPage:true});
    if(pageErrors.length)throw new Error(`browser error at ${width}x${height}: ${pageErrors.join('; ')}`);
    await page.close();
  }
  await browser.close();
  console.log('PASS: ending recap fits 360x800, 390x844, and 412x915');
  process.exit(0);
}

async function openKorea(width,height){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
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
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.click('[data-action="team"]');
  return page;
}

function center(width,height){return {x:width/2,y:78+(height-82)*0.5};}

for(const [width,height] of viewports){
  {
    const page=await openTutorial(width,height);
    await page.screenshot({path:`visual-qa/tutorial-menu-${width}x${height}.png`,fullPage:true});
    const menuBounds=await page.locator('.tutorial-menu').boundingBox();
    if(!menuBounds||menuBounds.y<0||menuBounds.y+menuBounds.height>height)throw new Error(`tutorial menu clipped at ${width}x${height}`);
    await page.click('[data-action="tutorial-step"][data-step="move"]');
    await page.waitForTimeout(100);
    if(await page.locator('#tutorial-overlay').evaluate(node=>node.classList.contains('hidden')))throw new Error(`tutorial overlay missing at ${width}x${height}`);
    await page.screenshot({path:`visual-qa/tutorial-move-${width}x${height}.png`,fullPage:true});
    await page.locator('[data-tutorial-action="menu"]').click();
    await page.click('[data-action="tutorial-step"][data-step="tackle"]');
    await page.waitForTimeout(6100);
    const tackleBounds=await page.locator('#tackle-button').boundingBox();
    if(!tackleBounds||tackleBounds.y<0||tackleBounds.y+tackleBounds.height>height)throw new Error(`tutorial tackle button clipped at ${width}x${height}`);
    await page.screenshot({path:`visual-qa/tutorial-tackle-${width}x${height}.png`,fullPage:true});
    await page.close();
  }
  if(process.argv.includes('--tutorial-only'))continue;

  {
    const page=await openKorea(width,height);
    await page.screenshot({path:`visual-qa/korea-idle-${width}x${height}.png`,fullPage:true});
    const start=center(width,height);
    await page.mouse.move(start.x,start.y);
    await page.mouse.down();
    await page.mouse.move(start.x+28,start.y-18,{steps:10});
    await page.waitForTimeout(180);
    await page.screenshot({path:`visual-qa/korea-run-${width}x${height}.png`,fullPage:true});
    await page.mouse.up();
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
    await page.close();
  }
}
await browser.close();
