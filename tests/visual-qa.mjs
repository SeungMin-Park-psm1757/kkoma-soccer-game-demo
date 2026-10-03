import { chromium } from 'playwright-core';

const browser=await chromium.launch({channel:'chrome',headless:true});
const viewports=[[360,800],[390,844],[412,915]];
const origin=`http://127.0.0.1:${process.env.PORT||8000}`;

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
