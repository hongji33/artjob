/* Run against a local static server; no external app services required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.ARTJOB_PLAYWRIGHT_PATH || 'playwright');
const base = (process.env.ARTJOB_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const output = process.env.ARTJOB_TEST_OUTPUT || '/tmp/artjob-brief-checks';
fs.mkdirSync(output, {recursive:true});
(async () => {
  const browser = await chromium.launch({executablePath:process.env.ARTJOB_CHROMIUM || '/usr/bin/chromium', headless:true, args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
    for (const job of [1,2,3,4,5]) {
      const url=base+(job===1?'/furniture/index.html':`/creative.html?job=${job}`);
      await page.goto(url);
      await assert.equal(await page.locator('.brief-dialog').evaluate(d=>d.open),true);
      assert.match(await page.locator('.mail-arrival h1').innerText(),/의뢰인에게서/);
      await page.waitForTimeout(1350);
      await page.screenshot({path:path.join(output,`arrival-${job}.png`)});
      // The artwork must be a successfully decoded local file, not a gradient placeholder.
      const imageURL = await page.locator('.brief-scene').evaluate(el=>getComputedStyle(el).backgroundImage.slice(5,-2));
      const dimensions = await page.evaluate(async src=>{const img=new Image();img.src=src;await img.decode();return [img.naturalWidth,img.naturalHeight]}, imageURL);
      assert.ok(dimensions[0]>=1200);
      await page.getByRole('button',{name:'의뢰 메일 열기'}).click();
      assert.equal(await page.locator('.mentor-encounter').isVisible(),true);
      await page.getByRole('button',{name:'의뢰서 받아 보기'}).click();
      assert.equal(await page.locator('.paper-requirements li').count(),3);
      assert.ok(await page.locator('.expert-intro h2').innerText());
      await page.waitForTimeout(1000);
      await page.screenshot({path:path.join(output,`brief-${job}.png`)});
      await page.getByRole('button',{name:'의뢰 확인 · 디자인 시작하기'}).click();
      assert.equal(await page.locator('.brief-dialog').evaluate(d=>d.open),false);
      await page.locator('[data-brief-check="0"]').check();
      await page.reload();
      assert.equal(await page.locator('.brief-dialog').evaluate(d=>d.open),false);
      assert.equal(await page.locator('[data-brief-check="0"]').isChecked(),true);
      await page.getByRole('button',{name:'의뢰서 다시 보기'}).click();
      assert.equal(await page.locator('.brief-meeting').isVisible(),true);
      // Escape is a keyboard-accessible close operation.
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.brief-dialog').evaluate(d=>d.open),false);
      await page.locator(job===1?'#workName':'#name').fill('의뢰에 답하는 작품 '+job);
      await page.locator('#finish').click();
      await page.waitForFunction(()=>document.getElementById('status').textContent.includes('획득'));
      const mission=await page.evaluate(()=>ArtStore.works().at(-1).mission);
      assert.equal(mission.id,`brief-v1-${job}`);
      assert.equal(mission.checks[0],true);
      console.log(`PASS career ${job}: illustrated office, mail, readable brief, acceptance, reopen, persistence, artwork metadata`);
    }
    await page.goto(base+'/gallery.html');
    assert.equal(await page.locator('.card').count(),5);
    assert.equal(await page.getByText(/^의뢰 · /).count(),5);
    // A smaller tablet and phone can read and accept the entire document.
    for (const width of [1024,768,390]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base+'/furniture/index.html');
      await page.getByRole('button',{name:'의뢰서 다시 보기'}).click();
      assert.equal(await page.locator('.brief-dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false);
      await page.getByRole('button',{name:'의뢰 확인 · 디자인 시작하기'}).scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,`brief-${width}.png`)});
      await page.getByRole('button',{name:'의뢰 확인 · 디자인 시작하기'}).click();
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'의뢰서 다시 보기'}).click();
    assert.equal(await page.locator('.project-paper').evaluate(el=>getComputedStyle(el).animationName),'none');
    assert.deepEqual(errors,[]);
    console.log('PASS gallery mission labels, responsive briefs, reduced-motion mode; browser errors: 0');
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
