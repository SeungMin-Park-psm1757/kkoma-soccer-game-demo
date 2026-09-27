import { chromium } from 'playwright-core';

const browser=await chromium.launch({channel:'chrome',headless:true});
const viewports=[[360,800],[390,844],[412,915]];

for(const [width,height] of viewports){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8000',{waitUntil:'networkidle'});
  await page.click('[data-action="team"]');
  await page.click('[data-team="6"]');
  await page.click('[data-action="play"]');
  await page.waitForTimeout(900);

  await page.screenshot({path:`visual-qa/korea-idle-${width}x${height}.png`,fullPage:true});

  const start={x:width/2,y:78+(height-82)*0.5};
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move(start.x+28,start.y-18,{steps:10});
  await page.waitForTimeout(180);
  await page.screenshot({path:`visual-qa/korea-run-${width}x${height}.png`,fullPage:true});
  await page.mouse.up();

  await page.close();
}
await browser.close();
