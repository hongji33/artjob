const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const{chromium}=require(process.env.ARTJOB_PLAYWRIGHT_PATH||'playwright');
const base=(process.env.ARTJOB_BASE_URL||'http://127.0.0.1:8000').replace(/\/$/,'');const output=process.env.ARTJOB_TEST_OUTPUT||'/tmp/artjob-revision-tests';fs.mkdirSync(output,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.ARTJOB_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 if(!process.env.ARTJOB_PROJECT_ONLY){
 await page.goto(base+'/');
 const accessoryResults=await page.evaluate(async()=>{
  const proof=document.createElement('div');proof.id='accessory-proof';proof.style='position:relative;z-index:100;background:#efe9dc;display:grid;grid-template-columns:repeat(4,180px);width:720px;color:#213b2d;padding:15px';document.body.prepend(proof);const results=[];
  for(const gender of ['female','male'])for(const hair of [0,1,2])for(const outfit of [0,1,2]){
   const original=document.createElement('canvas');await ArtAvatar.draw(original,{...ArtAvatar.defaults(),gender,hair,outfit,accessory:'none'});const originalData=original.getContext('2d').getImageData(0,0,original.width,original.height).data;
   for(const accessory of ['none','round','square','headphones']){
    const cv=document.createElement('canvas');await ArtAvatar.draw(cv,{...ArtAvatar.defaults(),gender,hair,outfit,accessory});const geo=JSON.parse(cv.dataset.accessoryGeometry);const data=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    const changes=geo.eyes.map(eye=>{let count=0;for(let y=Math.floor(eye.y-10);y<=eye.y+10;y++)for(let x=Math.floor(eye.x-15);x<=eye.x+15;x++){const i=(y*cv.width+x)*4;if(i>=0&&i<data.length&&(Math.abs(data[i]-originalData[i])+Math.abs(data[i+1]-originalData[i+1])+Math.abs(data[i+2]-originalData[i+2])>20))count++}return count});
    if(accessory==='round'||accessory==='square')results.push({gender,hair,outfit,accessory,lenses:geo.lensCount,changes});
    const tile=document.createElement('div');tile.style='font:10px sans-serif;padding:5px';const head=document.createElement('canvas');head.width=160;head.height=150;const ctx=head.getContext('2d');const x=Math.min(...geo.eyes.map(e=>e.x))-34,y=geo.crown.y-9;ctx.drawImage(cv,x,y,86,82,0,0,160,150);tile.append(head,document.createTextNode(`${gender} H${hair} O${outfit} ${accessory}`));proof.append(tile);
   }
  }return results;
 });
 for(const result of accessoryResults){assert.equal(result.lenses,2);assert.ok(result.changes.every(n=>n>20),'Both lens areas must actually change: '+JSON.stringify(result))}
 await page.locator('#accessory-proof').screenshot({path:path.join(output,'accessory-contact-sheet.png')});await page.locator('#accessory-proof').evaluate(e=>e.remove());console.log('PASS calibrated two-lens rendering for 18 poses × 2 frame styles; headset contact sheet generated');
 const sizes=[[1440,900],[1280,720],[1024,768],[768,1024],[390,844],[390,667]];
 for(const [width,height]of sizes){await page.setViewportSize({width,height});for(const job of [1,2,3,4,5]){
  await page.goto(base+(job===1?'/furniture/index.html':'/creative.html?job='+job));
  // A prior navigation may have accepted this brief. Restore the arrival state explicitly through a clean binding.
  if(!await page.locator('.brief-dialog').evaluate(d=>d.open)){await page.evaluate(j=>localStorage.removeItem('artjob_brief_v1_'+j),job);await page.reload()}
  assert.equal(await page.locator('.brief-dialog').evaluate(e=>e.scrollHeight<=e.clientHeight+1),true,`mail scroll ${width}x${height}/${job}`);
  const arrivalFits=await page.locator('.mail-arrival').evaluate(e=>{const r=e.getBoundingClientRect(),button=e.querySelector('.mail-open').getBoundingClientRect(),title=e.querySelector('h1').getBoundingClientRect();return title.top>=r.top&&button.bottom<=r.bottom+1});assert.ok(arrivalFits,`arrival content clipped ${width}x${height}/${job}`);
  await page.getByRole('button',{name:'의뢰 메일 열기'}).click();await page.getByRole('button',{name:'의뢰서 받아 보기'}).click();
  const fit=await page.locator('.project-paper').evaluate(e=>{const box=e.getBoundingClientRect(),button=e.querySelector('.brief-accept').getBoundingClientRect();const targets=[...e.querySelectorAll('.paper-letter,.paper-requirements li,.paper-deliverable')];return {scroll:e.scrollHeight,client:e.clientHeight,button:button.bottom<=innerHeight&&button.top>=box.top,text:targets.every(t=>{const r=t.getBoundingClientRect();return r.top>=box.top&&r.bottom<=button.top+1})}});
  assert.ok(fit.scroll<=fit.client+1&&fit.button&&fit.text,`brief not fully visible ${width}x${height}/${job}: ${JSON.stringify(fit)}`);
  if(job===1)await page.screenshot({path:path.join(output,`brief-${width}-${height}.png`)});await page.keyboard.press('Escape');
 }}console.log('PASS full arrival and complete brief without scrolling: 5 careers × 6 desktop/tablet/phone viewports');
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const job of [1,2,3,4,5]){
  await page.goto(base+(job===1?'/furniture/index.html':'/creative.html?job='+job));if(await page.locator('.brief-dialog').evaluate(d=>d.open))await page.keyboard.press('Escape');await page.waitForFunction(()=>Boolean(window.ArtStudio));
  if(job===1){const before=await page.locator('#three').evaluate(c=>c.toDataURL());await page.locator('#dimension-seatWidth').fill('55');await page.locator('#dimension-seatWidth').dispatchEvent('input');assert.equal(await page.evaluate(()=>ArtStudio.getDesign().seatWidth),55);await page.waitForTimeout(100);assert.notEqual(await page.locator('#three').evaluate(c=>c.toDataURL()),before);assert.ok((await page.evaluate(()=>ArtCourse.checks())).some(c=>!c.ok&&c.label.includes('공간')));await page.locator('#dimension-seatWidth').fill('45');await page.locator('#dimension-seatWidth').dispatchEvent('input')}
  else{const kind={2:'shield',3:'sofa',4:'art-field',5:'pocket'}[job];await page.locator(`[data-add-object="${kind}"]`).click();if(job===3){await page.locator('[data-add-object="table"]').click();await page.locator('[data-add-object="shelf"]').click()}if(job===4){await page.locator('[data-add-object="art-rhythm"]').click();await page.locator('[data-add-object="art-line"]').click()}const start=await page.evaluate(()=>ArtStudio.getDesign().objects.at(-1));await page.locator('#artboard').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>ArtStudio.getDesign().objects.at(-1).x),start.x+10);await page.locator('#make-undo').click();assert.equal(await page.evaluate(()=>ArtStudio.getDesign().objects.at(-1).x),start.x);
   await page.locator('[data-make-tool="pen"]').click();const points=await page.locator('#artboard > svg').evaluate(svg=>[svg.createSVGPoint(),svg.createSVGPoint()].map((p,i)=>{p.x=300+i*60;p.y=360+i*25;const s=p.matrixTransform(svg.getScreenCTM());return {x:s.x,y:s.y}}));await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.mouse.move(points[1].x,points[1].y,{steps:8});await page.mouse.up();assert.ok(await page.evaluate(()=>ArtStudio.getDesign().strokes.some(s=>s.points.length>2)));const image=await page.evaluate(()=>ArtStudio.capture());assert.ok(image.startsWith('data:image/png;'));await page.reload();assert.ok(await page.evaluate(()=>ArtStudio.getDesign().objects.length>0));assert.ok(await page.evaluate(()=>ArtStudio.getDesign().strokes.length>0));
  }
  await page.getByRole('button',{name:'프로젝트 데스크',exact:true}).click();await page.locator('[data-desk-tab="3"]').click();await page.locator('.desk-submit').click();assert.match(await page.locator('#desk-status').textContent(),/보완할 기록/);
  await page.locator('[data-desk-tab="0"]').click();for(const [field,value]of Object.entries({user:'쉬는 시간에 공간을 함께 이용하는 중학생을 위한 디자인입니다.',problem:'서로 다른 활동이 겹쳐 불편해지는 문제를 해결하려고 합니다.',concept:'형태와 색의 위계를 정해 기능이 읽히는 디자인을 제안합니다.'}))await page.locator(`[data-journal="${field}"]`).fill(value);
  await page.locator('[data-desk-tab="1"]').click();await page.locator('.research-board img').evaluate(img=>img.decode());assert.equal(await page.locator('.resource-cards article').count(),3);assert.ok(await page.locator('.research-table tbody tr').count()>=3);
  await page.locator('[data-desk-tab="2"]').click();await page.locator('[data-capture="0"]').click();await page.waitForFunction(()=>document.querySelector('[data-snapshot-image="0"] img'));
  await page.evaluate(()=>ArtStudio.applyPatch({[location.pathname.includes('furniture')?'color':'mainColor']:'#a26d54'}));await page.locator('[data-capture="1"]').click();await page.waitForFunction(()=>document.querySelector('[data-snapshot-image="1"] img'));
  await page.locator('[data-journal="improvement"]').fill('시안 A와 B의 색 대비를 비교하고 핵심 부분이 먼저 보이도록 개선했습니다.');
  await page.locator('[data-desk-tab="3"]').click();await page.locator('[data-journal="rationale"]').fill('사용자의 행동을 기준으로 형태와 재료를 정하고 두 시안을 비교했습니다. 실제 사용 조건은 모형과 사용자의 의견으로 더 검토할 계획입니다.');
  const download=page.waitForEvent('download');await page.locator('.desk-export').click();await(await download).saveAs(path.join(output,`proposal-${job}.html`));const html=fs.readFileSync(path.join(output,`proposal-${job}.html`),'utf8');assert.match(html,/시안 비교/);assert.ok((html.match(/data:image\/png/g)||[]).length>=3);assert.match(html,/사용자의 행동/);
  await page.locator('.desk-submit').click();await page.waitForFunction(()=>document.getElementById('desk-status').textContent.includes('배지를 받았습니다'));const work=await page.evaluate(()=>ArtStore.works().at(-1));assert.equal(work.project.submitted,true);assert.equal(work.project.iterations.length,2);await page.screenshot({path:path.join(output,`review-${job}.png`)});
  await page.locator('.desk-close').click();console.log('PASS career',job,'making tools, persistence, references, A/B prototypes, validation, report and submission');
 }
 assert.deepEqual(await page.evaluate(()=>ArtStore.read('artjob_badges',[]).sort()),[1,2,3,4,5]);assert.deepEqual(errors,[]);console.log('PASS all project badges and browser errors: 0');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
