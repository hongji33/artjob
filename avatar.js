/* Illustrated, composable student avatars; all artwork stays local. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const store = window.ArtStore;
  const defaults = {gender:'female',hair:0,outfit:0,hairColor:'#493126',topColor:'#3c786a',bottomColor:'#34435d',skinColor:'#edc3a6',accessory:'none',name:'새싹 디자이너'};
  const palettes = {
    hairColor:['#302a29','#68402a','#aa7041','#36384f','#8a5366','#c29667'],
    topColor:['#3c786a','#557699','#8f6988','#b97261','#cab886','#514f68','#c9c4b3','#405052'],
    bottomColor:['#34435d','#3c3c40','#7f725e','#b4a289','#637569','#71657a'],
    skinColor:['#f3d2ba','#e7b694','#c99372','#92654f']
  };
  const escape = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function validate(value) {
    const p={...defaults};
    if (!value || typeof value!=='object') return p;
    if(['female','male'].includes(value.gender))p.gender=value.gender;
    for(const key of ['hair','outfit'])if(Number.isInteger(value[key])&&value[key]>=0&&value[key]<3)p[key]=value[key];
    for(const key of Object.keys(palettes))if(typeof value[key]==='string'&&/^#[0-9a-f]{6}$/i.test(value[key]))p[key]=value[key];
    if(['none','round','square','headphones'].includes(value.accessory))p.accessory=value.accessory;
    if(typeof value.name==='string'&&value.name.trim())p.name=value.name.trim().slice(0,20);
    return p;
  }
  function get(){const old=store.getItem('artjob_avatar');return validate(store.read('artjob_profile_v1',{...defaults,gender:old==='1'?'male':'female'}))}
  function save(profile){const p=validate(profile);if(!store.setItem('artjob_profile_v1',JSON.stringify(p)))return false;store.setItem('artjob_avatar',p.gender==='male'?'1':'0');window.dispatchEvent(new CustomEvent('artjob-profile-change',{detail:p}));return true}
  const atlases={};
  function atlas(gender){if(!atlases[gender])atlases[gender]=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{delete atlases[gender];reject(new Error('캐릭터 이미지를 불러오지 못했습니다. 다시 시도해 주세요.'))};image.src=new URL(`assets/avatar-${gender}.webp`,base).href});return atlases[gender]}
  const rgb = hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  function tint(data,index,color,brightness,reference){const shade=Math.max(.22,Math.min(1.65,brightness/reference));for(let k=0;k<3;k++)data[index+k]=Math.min(255,color[k]*shade)}
  // Calibrated on the 418px atlas cells. Coordinates follow the original artwork,
  // not skin/hair colour; every outfit has its own face location and head tilt.
  const faceLandmarks={
    female:[[[263,51,286,43,278,8],[191,51,213,43,204,8],[117,51,141,43,131,8]],[[263,51,286,43,278,8],[191,51,213,43,204,8],[117,51,141,43,131,8]],[[263,55,286,47,278,12],[191,55,213,47,204,12],[117,55,141,47,131,12]]],
    male:[[[208,54,230,48,224,10],[186,54,207,48,202,10],[163,54,184,48,178,10]],[[209,55,231,49,225,12],[186,55,207,49,202,12],[163,55,185,49,179,12]],[[208,60,230,54,224,12],[185,60,207,54,201,12],[162,60,184,54,178,12]]]
  };
  async function draw(canvas,profile=get()) {
    const p=validate(profile);const token={};canvas.avatarToken=token;
    const image=await atlas(p.gender);if(canvas.avatarToken!==token)return;
    const cellWidth=Math.round(image.width/3),cellHeight=Math.round(image.height/3);
    const w=Math.round(cellWidth*.64),h=cellHeight;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const cut=document.createElement('canvas');cut.width=cellWidth;cut.height=cellHeight;const cutCtx=cut.getContext('2d',{willReadFrequently:true});cutCtx.drawImage(image,p.outfit*cellWidth,p.hair*cellHeight,cellWidth,cellHeight,0,0,cellWidth,cellHeight);
    const raw=cutCtx.getImageData(0,0,cellWidth,cellHeight).data;let minX=cellWidth,minY=cellHeight,maxX=0,maxY=0;
    for(let y=0;y<cellHeight;y++)for(let x=0;x<cellWidth;x++)if(raw[(y*cellWidth+x)*4+3]>128){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
    let artworkTransform;
    if(maxX>minX&&maxY>minY){const scale=Math.min(w*.84/(maxX-minX+1),h*.94/(maxY-minY+1));const dw=(maxX-minX+1)*scale,dh=(maxY-minY+1)*scale;artworkTransform={scale,dx:(w-dw)/2,dy:(h-dh)/2};ctx.drawImage(cut,minX,minY,maxX-minX+1,maxY-minY+1,artworkTransform.dx,artworkTransform.dy,dw,dh)}
    const pixels=ctx.getImageData(0,0,w,h),d=pixels.data;
    const hair=rgb(p.hairColor),top=rgb(p.topColor),bottom=rgb(p.bottomColor),skin=rgb(p.skinColor);
    let left=w,right=0,upper=h,lower=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<35)continue;left=Math.min(left,x);right=Math.max(right,x);upper=Math.min(upper,y);lower=Math.max(lower,y)}
    const height=Math.max(1,lower-upper);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=(y*w+x)*4;if(d[i+3]<20)continue;
      const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
      if(delta<.045)continue;
      let hue=max===r?((g-b)/delta+6)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;hue/=6;
      const saturation=delta/(max||1),luma=.2126*r+.7152*g+.0722*b,yy=(y-upper)/height;
      if(hue>.30&&hue<.57&&saturation>.14&&yy>.18&&yy<.75)tint(d,i,top,luma,.38);
      else if(hue>.56&&hue<.76&&saturation>.15&&yy>.43)tint(d,i,bottom,luma,.24);
      else if(hue<.13&&saturation>.17&&luma<.46&&yy<.31)tint(d,i,hair,luma,.23);
      else if(hue>.025&&hue<.13&&saturation>.14&&luma>.48&&yy<.76)tint(d,i,skin,luma,.76);
    }
    ctx.putImageData(pixels,0,0);
    const landmarks=faceLandmarks[p.gender][p.hair][p.outfit];
    const map=(x,y)=>({x:(x/418*cellWidth-minX)*artworkTransform.scale+artworkTransform.dx,y:(y/418*cellHeight-minY)*artworkTransform.scale+artworkTransform.dy});
    const eyes=[map(landmarks[0],landmarks[1]),map(landmarks[2],landmarks[3])];
    const crown=map(landmarks[4],landmarks[5]);
    const distance=Math.hypot(eyes[1].x-eyes[0].x,eyes[1].y-eyes[0].y),angle=Math.atan2(eyes[1].y-eyes[0].y,eyes[1].x-eyes[0].x);
    const rx=distance*.39,ry=distance*.31;
    ctx.save();ctx.lineWidth=Math.max(1,distance*.075);ctx.strokeStyle='#393b38';ctx.lineCap='round';ctx.lineJoin='round';
    if(p.accessory==='round'||p.accessory==='square'){
      // Independent paths prevent one lens being joined to or filled over the other.
      for(const eye of eyes){ctx.save();ctx.translate(eye.x,eye.y);ctx.rotate(angle);ctx.beginPath();
        if(p.accessory==='round')ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
        else ctx.roundRect(-rx,-ry,2*rx,2*ry,rx*.23);
        ctx.fillStyle='rgba(217,239,235,.12)';ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.strokeStyle='#ffffffb3';ctx.lineWidth=distance*.035;ctx.moveTo(-rx*.55,-ry*.4);ctx.lineTo(-rx*.15,-ry*.72);ctx.stroke();ctx.restore();
      }
      const ux=Math.cos(angle),uy=Math.sin(angle);
      ctx.beginPath();ctx.moveTo(eyes[0].x+rx*ux,eyes[0].y+rx*uy);ctx.quadraticCurveTo((eyes[0].x+eyes[1].x)/2,(eyes[0].y+eyes[1].y)/2-distance*.12,eyes[1].x-rx*ux,eyes[1].y-rx*uy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(eyes[0].x-rx*ux,eyes[0].y-rx*uy);ctx.lineTo(eyes[0].x-distance*.65,eyes[0].y-distance*.08);ctx.moveTo(eyes[1].x+rx*ux,eyes[1].y+rx*uy);ctx.lineTo(eyes[1].x+distance*.62,eyes[1].y-distance*.12);ctx.stroke();
    }else if(p.accessory==='headphones'){
      const ears=[map(landmarks[0]-13,landmarks[1]+8),map(landmarks[2]+14,landmarks[3]+8)];
      ctx.lineWidth=distance*.19;ctx.strokeStyle='#273d37';ctx.beginPath();ctx.moveTo(ears[0].x,ears[0].y);ctx.bezierCurveTo(ears[0].x-distance*.24,crown.y-distance*.48,ears[1].x+distance*.18,crown.y-distance*.48,ears[1].x,ears[1].y);ctx.stroke();
      ctx.lineWidth=distance*.075;ctx.strokeStyle='#d9bd88';ctx.stroke();
      for(const [i,ear] of ears.entries()){ctx.save();ctx.translate(ear.x,ear.y);ctx.rotate(i===0?-.12:.12);ctx.beginPath();ctx.roundRect(-distance*.20,-distance*.35,distance*.40,distance*.85,distance*.13);const finish=ctx.createLinearGradient(-distance*.2,0,distance*.2,0);finish.addColorStop(0,'#213c35');finish.addColorStop(.55,'#688c78');finish.addColorStop(1,'#2e5145');ctx.fillStyle=finish;ctx.fill();ctx.lineWidth=distance*.055;ctx.strokeStyle='#dac292';ctx.stroke();ctx.restore()}
    }
    canvas.dataset.accessoryGeometry=JSON.stringify({eyes,crown,angle,lensCount:p.accessory==='round'||p.accessory==='square'?2:0});
    ctx.restore();canvas.setAttribute('aria-label',`${p.name} · ${p.gender==='female'?'여학생':'남학생'} 일러스트 캐릭터`);
    canvas.dataset.avatarSignature=JSON.stringify(p);
    return canvas;
  }
  let dialog,draft;
  function mountDialog(){
    if(dialog)return;
    const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('avatar.css',base).href;document.head.append(css);
    dialog=document.createElement('dialog');dialog.className='avatar-dialog';dialog.setAttribute('aria-labelledby','avatar-title');
    dialog.innerHTML=`<header class="avatar-editor-header"><div><span>ART JOB CITY / CHARACTER ATELIER</span><h1 id="avatar-title">이 도시의 주인공은, 나.</h1></div><button type="button" class="avatar-cancel" aria-label="캐릭터 꾸미기 닫기">닫기 ×</button></header><div class="avatar-editor-grid"><section class="avatar-dressing-room"><div class="avatar-editor-kicker">MY CREATIVE IDENTITY</div><div class="avatar-large-preview"><canvas id="avatar-preview" role="img"></canvas><div class="avatar-floor-shadow"></div></div><div class="avatar-preview-caption"><strong id="avatar-preview-name"></strong><span>당신만의 스타일로, 새로운 직업의 세계로.</span></div><p class="avatar-render-error" role="alert"></p></section><section class="avatar-tools"><label class="avatar-name-label">나의 디자이너 이름<input id="avatar-name" maxlength="20" placeholder="어떤 이름으로 불릴까요?"></label><div class="avatar-tool-group"><h2>01 <span>기본 캐릭터</span></h2><div id="avatar-genders" class="avatar-choice-row"></div></div><div class="avatar-tool-group"><h2>02 <span>헤어스타일</span></h2><div id="avatar-hairs" class="avatar-style-grid"></div><h3>헤어 컬러</h3><div id="avatar-hair-colors" class="avatar-palette"></div></div><div class="avatar-tool-group"><h2>03 <span>오늘의 옷</span></h2><div id="avatar-outfits" class="avatar-style-grid"></div><h3>상의 컬러</h3><div id="avatar-top-colors" class="avatar-palette"></div><h3>하의 컬러</h3><div id="avatar-bottom-colors" class="avatar-palette"></div></div><div class="avatar-tool-group"><h2>04 <span>나를 닮은 디테일</span></h2><h3>피부 톤</h3><div id="avatar-skin-colors" class="avatar-palette"></div><h3>액세서리</h3><div id="avatar-accessories" class="avatar-choice-row"></div></div></section></div><footer class="avatar-editor-footer"><p id="avatar-save-status" role="status">나의 캐릭터는 전문가를 만날 때와 작품을 남길 때 함께해요.</p><div><button type="button" class="avatar-reset">처음 스타일로</button><button type="button" id="avatar-save">이 모습으로 출발하기 →</button></div></footer>`;
    document.body.append(dialog);
    dialog.querySelector('.avatar-cancel').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>{document.body.classList.remove('avatar-is-open');document.querySelector('.avatar-customize')?.focus({preventScroll:true})});
    dialog.querySelector('#avatar-name').oninput=e=>{draft.name=e.target.value;dialog.querySelector('#avatar-preview-name').textContent=draft.name||'나의 디자이너'};
    dialog.querySelector('.avatar-reset').onclick=()=>{draft={...defaults,gender:draft.gender};dialog.querySelector('#avatar-name').value=draft.name;updateControls()};
    dialog.querySelector('#avatar-save').onclick=()=>{if(save(draft)){dialog.close()}else dialog.querySelector('#avatar-save-status').textContent='브라우저 저장이 차단되었거나 공간이 부족합니다. 설정을 확인해 주세요.'};
  }
  const hairNames={female:['단정한 단발','내추럴 롱헤어','발랄한 포니테일'],male:['단정한 숏헤어','부드러운 웨이브','자유로운 컬리']};
  const outfitNames=['포근한 후디','캠퍼스 재킷','클래식 카디건'];
  function choices(id,field,values){const box=dialog.querySelector('#'+id);box.replaceChildren();values.forEach(([value,label])=>{const button=document.createElement('button');button.type='button';button.className='avatar-choice';button.dataset.avatarField=field;button.dataset.value=value;button.setAttribute('aria-pressed',String(draft[field]===value));button.textContent=label;button.onclick=()=>{draft[field]=value;updateControls()};box.append(button)})}
  function palette(id,field){const box=dialog.querySelector('#'+id);box.replaceChildren();palettes[field].forEach((color,i)=>{const button=document.createElement('button');button.type='button';button.className='avatar-color';button.style.setProperty('--swatch',color);button.dataset.avatarField=field;button.dataset.value=color;button.setAttribute('aria-label',({hairColor:'헤어',topColor:'상의',bottomColor:'하의',skinColor:'피부'}[field])+` 색상 ${i+1}`);button.setAttribute('aria-pressed',String(draft[field]===color));button.onclick=()=>{draft[field]=color;updateControls()};box.append(button)})}
  function updateControls(){
    choices('avatar-genders','gender',[['female','여학생'],['male','남학생']]);
    choices('avatar-hairs','hair',hairNames[draft.gender].map((label,i)=>[i,label]));
    choices('avatar-outfits','outfit',outfitNames.map((label,i)=>[i,label]));
    choices('avatar-accessories','accessory',[['none','착용 안 함'],['round','동그란 안경'],['square','스퀘어 안경'],['headphones','헤드폰']]);
    for(const [id,field] of [['hair','hairColor'],['top','topColor'],['bottom','bottomColor'],['skin','skinColor']])palette('avatar-'+id+'-colors',field);
    dialog.querySelector('#avatar-preview-name').textContent=draft.name||'나의 디자이너';
    dialog.querySelector('.avatar-render-error').textContent='';
    draw(dialog.querySelector('#avatar-preview'),draft).catch(e=>dialog.querySelector('.avatar-render-error').textContent=e.message);
  }
  function edit(){mountDialog();draft={...get()};dialog.querySelector('#avatar-name').value=draft.name;dialog.querySelector('#avatar-save-status').textContent='나의 캐릭터는 전문가를 만날 때와 작품을 남길 때 함께해요.';updateControls();dialog.showModal();document.body.classList.add('avatar-is-open');dialog.querySelector('#avatar-name').focus({preventScroll:true})}
  function mountProfile(){const host=document.getElementById('myAvatar');if(!host)return;mountDialog();const p=get();host.innerHTML=`<div class="profile-character"><canvas role="img"></canvas></div><div class="profile-copy"><span>MY DESIGNER</span><strong>${escape(p.name)}</strong><small>${p.gender==='female'?'여학생':'남학생'} · 나만의 스타일</small><button type="button" class="avatar-customize">내 캐릭터 꾸미기 ↗</button></div>`;draw(host.querySelector('canvas'),p).catch(()=>{host.querySelector('.profile-copy small').textContent='캐릭터를 불러오지 못했어요. 다시 꾸며 주세요.'});host.querySelector('button').onclick=edit;const passport=document.getElementById('passportName');if(passport)passport.textContent=p.name}
  window.ArtAvatar={get,save,draw,edit,defaults:()=>({...defaults})};
  window.addEventListener('artjob-profile-change',mountProfile);
  mountProfile();
})();
