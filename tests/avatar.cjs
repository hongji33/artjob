const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.ARTJOB_PLAYWRIGHT_PATH||'playwright');
const base=(process.env.ARTJOB_BASE_URL||'http://127.0.0.1:8000').replace(/\/$/,'');
const output=process.env.ARTJOB_TEST_OUTPUT||'/tmp/artjob-avatar-checks';fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.ARTJOB_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.goto(base+'/');await page.getByRole('button',{name:'내 캐릭터 꾸미기'}).click();
  assert.equal(await page.locator('#avatar-genders button').count(),2);
  await page.locator('#avatar-name').fill('하늘 디자이너');
  const snapshots=new Set();
  for(const gender of ['female','male']){
   await page.locator(`[data-avatar-field="gender"][data-value="${gender}"]`).click();
   for(const hair of [0,1,2])for(const outfit of [0,1,2]){
    await page.locator(`[data-avatar-field="hair"][data-value="${hair}"]`).click();
    await page.locator(`[data-avatar-field="outfit"][data-value="${outfit}"]`).click();
    await page.waitForFunction(([gender,hair,outfit])=>{const s=JSON.parse(document.getElementById('avatar-preview').dataset.avatarSignature||'{}');return s.gender===gender&&s.hair===hair&&s.outfit===outfit},[gender,hair,outfit]);
    snapshots.add(await page.locator('#avatar-preview').evaluate(c=>c.toDataURL()));
   }
  }
  assert.equal(snapshots.size,18,'All gender/hairstyle/outfit combinations must have different rendered illustrations');
  for(const field of ['hairColor','topColor','bottomColor','skinColor']){
   const before=await page.locator('#avatar-preview').evaluate(c=>c.toDataURL());
   const button=page.locator(`[data-avatar-field="${field}"]`).nth(1);const value=await button.getAttribute('data-value');await button.click();
   await page.waitForFunction(([key,value])=>JSON.parse(document.getElementById('avatar-preview').dataset.avatarSignature||'{}')[key]===value,[field,value]);
   assert.notEqual(await page.locator('#avatar-preview').evaluate(c=>c.toDataURL()),before,field+' must alter image pixels');
  }
  await page.locator('[data-avatar-field="accessory"][data-value="round"]').click();
  await page.waitForFunction(()=>JSON.parse(document.getElementById('avatar-preview').dataset.avatarSignature||'{}').accessory==='round');
  assert.equal(await page.locator('#avatar-preview').evaluate(c=>c.getBoundingClientRect().bottom<=c.parentElement.getBoundingClientRect().bottom+1),true,'avatar must fit inside the preview');
  await page.screenshot({path:path.join(output,'customizer.png')});await page.locator('#avatar-save').click();
  assert.equal(await page.locator('.profile-copy strong').textContent(),'하늘 디자이너');
  await page.reload();assert.equal(await page.locator('.profile-copy strong').textContent(),'하늘 디자이너');
  await page.getByRole('button',{name:'내 캐릭터 꾸미기'}).click();await page.locator('#avatar-name').fill('저장하지 않은 이름');await page.getByRole('button',{name:'캐릭터 꾸미기 닫기'}).click();
  assert.equal(await page.evaluate(()=>ArtAvatar.get().name),'하늘 디자이너','Cancel must preserve the saved profile');
  await page.getByRole('button',{name:'1층 스튜디오 입장하기'}).click();await page.getByRole('button',{name:'의뢰 메일 열기'}).click();
  await page.waitForFunction(()=>Boolean(document.querySelector('.encounter-avatar').dataset.avatarSignature));
  assert.match(await page.locator('.student-nameplate').innerText(),/하늘 디자이너/);
  assert.equal(await page.locator('.encounter-avatar').evaluate(c=>JSON.parse(c.dataset.avatarSignature).gender),'male');
  await page.waitForTimeout(1000);await page.screenshot({path:path.join(output,'meet-expert.png')});
  await page.getByRole('button',{name:'의뢰서 받아 보기'}).click();await page.getByRole('button',{name:'의뢰 확인 · 디자인 시작하기'}).click();
  await page.waitForSelector('#backs button');await page.locator('#finish').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('획득'));
  assert.equal(await page.evaluate(()=>ArtStore.works().at(-1).creator.name),'하늘 디자이너');
  await page.getByRole('button',{name:'전문가와 다시 만나기'}).click();assert.equal(await page.locator('.mentor-encounter').isVisible(),true);await page.keyboard.press('Escape');
  await page.goto(base+'/gallery.html');assert.equal(await page.getByText('DESIGNED BY 하늘 디자이너').count(),1);
  for(const width of [1024,768,390]){
   await page.setViewportSize({width,height:950});await page.goto(base+'/');await page.getByRole('button',{name:'내 캐릭터 꾸미기'}).click();
   assert.equal(await page.locator('.avatar-dialog').evaluate(d=>d.scrollWidth>d.clientWidth),false,'customizer overflow '+width);
   await page.locator('#avatar-save').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'customizer-'+width+'.png')});await page.locator('#avatar-save').click();
   await page.goto(base+'/furniture/index.html');await page.getByRole('button',{name:'전문가와 다시 만나기'}).click();
   assert.equal(await page.locator('.brief-dialog').evaluate(d=>d.scrollWidth>d.clientWidth),false,'encounter overflow '+width);
   await page.waitForFunction(()=>document.querySelector('.encounter-student').classList.contains('arrived'));assert.equal(await page.locator('.student-greeting').evaluate(e=>e.getBoundingClientRect().right<=innerWidth),true,'student greeting must be fully visible');await page.getByRole('button',{name:'의뢰서 받아 보기'}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'encounter-'+width+'.png')});await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);console.log('PASS 18 illustrated gender/hair/outfit combinations, four palettes, accessories, save/reload/cancel, expert encounter, artwork author, gallery, 1024/768/390px; browser errors 0');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
