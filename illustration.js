/* Painterly starter art with editable palettes and textile patterns. */
(() => {
 'use strict';
 const base=new URL('.',document.currentScript.src),atlases={},cache=new Map();
 function atlas(kind){if(!atlases[kind])atlases[kind]=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{delete atlases[kind];reject(new Error('작업 원화를 불러오지 못했습니다. 새로고침해 주세요.'))};image.src=new URL('assets/starter-'+kind+'.webp',base).href});return atlases[kind]}
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const key=(job,state)=>JSON.stringify([job,state.form,state.detail,state.mainColor,state.accentColor]);
 async function make(job,state){const id=key(job,state);if(cache.has(id))return cache.get(id);const promise=(async()=>{
  const source=await atlas(job===2?'character':'fashion'),cw=Math.round(source.width/3),ch=source.height;
  const part=document.createElement('canvas');part.width=cw;part.height=ch;const cut=part.getContext('2d',{willReadFrequently:true});cut.drawImage(source,state.form*cw,0,cw,ch,0,0,cw,ch);const pixels=cut.getImageData(0,0,cw,ch),d=pixels.data;const main=rgb(state.mainColor),accent=rgb(state.accentColor);let minX=cw,minY=ch,maxX=0,maxY=0;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const i=(y*cw+x)*4;if(d[i+3]<40)continue;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;if(delta<.055)continue;let hue=max===r?((g-b)/delta+6)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;hue/=6;let color,reference;
   if(hue>.30&&hue<.58&&delta/max>.12){color=main;reference=.36;if(job===5&&state.detail===1&&x%24<5)color=accent;if(job===5&&state.detail===2&&Math.hypot(x%24-12,y%24-12)<4)color=accent}
   else if(hue>.09&&hue<.19&&delta/max>.25&&r>.35&&g<r*.9){color=accent;reference=.56}
   if(color){const light=.2126*r+.7152*g+.0722*b,shade=Math.max(.20,Math.min(1.65,light/reference));for(let k=0;k<3;k++)d[i+k]=Math.min(255,color[k]*shade)}
  }
  cut.putImageData(pixels,0,0);const out=document.createElement('canvas');out.width=520;out.height=700;const ctx=out.getContext('2d');const scale=Math.min(460/(maxX-minX+1),660/(maxY-minY+1)),w=(maxX-minX+1)*scale,h=(maxY-minY+1)*scale;ctx.drawImage(part,minX,minY,maxX-minX+1,maxY-minY+1,(520-w)/2,(700-h)/2,w,h);return out.toDataURL('image/png');
 })();cache.set(id,promise);try{const result=await promise;cache.set(id,result);if(cache.size>30)cache.delete(cache.keys().next().value);return result}catch(e){cache.delete(id);throw e}}
 function peek(job,state){const value=cache.get(key(job,state));return typeof value==='string'?value:null}
 window.ArtIllustration={make,peek};
})();
