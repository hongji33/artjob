/* Shared, local-only narrative briefs for the five career studios. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('.', script.src);
  const job = location.pathname.includes('/furniture/') ? 1 : Number(new URLSearchParams(location.search).get('job'));
  const briefs = {
    1: {slug:'furniture',company:'FORM & GRAIN',department:'가구 디자인 스튜디오',expert:'윤지연',role:'수석 가구 디자이너',client:'한빛중학교 도서관',title:'작은 독서 공간을 위한 의자',greeting:'우리 팀에 온 걸 환영해요. 도서관에서 새 의자를 의뢰했어요. 제가 받은 서류를 함께 살펴볼까요?',letter:'안녕하세요. 창가의 작은 독서 공간에 놓을 의자가 필요합니다. 쉬는 시간에 학생들이 편안하게 책을 읽을 수 있고, 공간을 답답하게 만들지 않는 디자인이면 좋겠어요.',requirements:['오래 앉아 책을 읽는 학생을 위해 등받이와 좌판의 편안함을 고려해 주세요.','작은 공간에 어울리는 실루엣과 안정적인 다리 구조를 선택해 주세요.','소재의 촉감과 관리 방법을 생각하고, 차분한 색에 나만의 포인트를 더해 주세요.'],deliverable:'의자 디자인 1점 + 작품 이름 + 소재와 형태를 선택한 이유',tip:'정답은 하나가 아니에요. 왜 이 형태와 소재를 선택했는지 설명할 수 있는 디자인을 해 보세요.'},
    2: {slug:'character',company:'PIXEL GROVE',department:'게임 캐릭터 아트팀',expert:'강도윤',role:'캐릭터 아트 디렉터',client:'게임 〈그린 시티〉 제작팀',title:'초록 도시를 지키는 새로운 주인공',greeting:'새 게임의 주인공을 함께 만들게 됐군요. 기획팀에서 보낸 캐릭터 의뢰서예요. 플레이어가 어떤 친구를 만나게 될지 상상해 보세요.',letter:'환경을 되살리는 모험 게임을 개발하고 있어요. 플레이어가 첫눈에 알아보고, 함께 모험하고 싶어지는 주인공을 디자인해 주세요.',requirements:['탐험가·로봇·가디언 중 세계관에 어울리는 실루엣을 정해 주세요.','배지와 액세서리로 캐릭터의 역할이나 특별한 능력을 표현해 주세요.','주조색과 강조색이 잘 구분되도록 하고, 그 색을 선택한 이유를 적어 주세요.'],deliverable:'캐릭터 콘셉트 아트 1점 + 이름 + 역할과 디자인 설명',tip:'작게 보아도 구분되는 실루엣이 좋은 출발점이에요. 소품 하나에도 이야기를 담아 보세요.'},
    3: {slug:'spatial',company:'STILL SPACE',department:'공간 디자인 사무소',expert:'서하린',role:'공간 디자이너',client:'한빛중학교 학생자치회',title:'빈 교실을 우리들의 쉼터로',greeting:'좋은 공간은 사람들의 하루를 바꿔요. 학생자치회가 보내온 공간 의뢰서를 드릴게요. 이 방을 누가 어떻게 사용할지 먼저 생각해 봐요.',letter:'비어 있는 교실을 쉬는 시간에 머물 수 있는 공간으로 바꾸려고 합니다. 친구와 이야기하거나 조용히 책을 볼 수 있는 따뜻한 휴게 공간을 제안해 주세요.',requirements:['대화·독서·작업 중 이 공간의 중심 활동을 정해 주세요.','가구 배치와 여백을 보고 사람들이 움직일 동선을 설명해 주세요.','바닥·창·벽의 마감과 색을 조합해 머물고 싶은 분위기를 만들어 주세요.'],deliverable:'공간 디자인 이미지 1점 + 공간 이름 + 사용 방법과 동선 설명',tip:'물건을 많이 채우는 것보다, 사람들이 어떻게 머무는지를 생각하는 게 먼저예요.'},
    4: {slug:'curator',company:'MUSEUM OF TOMORROW',department:'전시 기획실',expert:'이준서',role:'전시 기획자',client:'청소년 아트위크 운영팀',title:'색과 리듬이 만나는 작은 전시',greeting:'전시를 만드는 일은 작품 사이에 이야기를 놓는 일이에요. 운영팀의 제안서를 읽고, 여러분만의 전시를 기획해 주세요.',letter:'청소년 관람객을 위한 작은 추상미술 전시를 준비하고 있어요. 세 작품이 하나의 이야기처럼 느껴지도록 색, 배열, 전시실 분위기를 제안해 주세요.',requirements:['컬러 필드·기하학 리듬·유기적 선 중 전시의 시각 언어를 정해 주세요.','작품의 크기와 순서로 관람객의 시선이 움직이는 흐름을 만들어 주세요.','전시실 분위기와 작품 색의 관계를 생각하고 전시 주제를 설명해 주세요.'],deliverable:'전시 구성 이미지 1점 + 전시 제목 + 기획 의도',tip:'가운데 놓인 작품, 작품 사이의 간격, 벽의 색도 이야기를 전달하는 도구가 돼요.'},
    5: {slug:'fashion',company:'THREAD & TOMORROW',department:'패션 크리에이티브 스튜디오',expert:'차유진',role:'패션 크리에이티브 디렉터',client:'청소년 라이프스타일 컬렉션 팀',title:'내일의 일상을 입다',greeting:'옷은 입는 사람의 이야기를 보여 줘요. 새 컬렉션의 디자인 의뢰서를 가져왔어요. 어떤 하루를 위한 옷인지 상상하며 읽어 보세요.',letter:'청소년의 미래 일상을 위한 의상 한 벌을 제안받고 싶어요. 활동하기 편하면서도 입는 사람의 개성이 드러나는 디자인을 기다립니다.',requirements:['누가 어떤 상황에서 입을 옷인지 정하고 실루엣을 선택해 주세요.','솔리드·스트라이프·도트와 색을 조합해 컬렉션의 개성을 만들어 주세요.','액세서리의 기능과 전체 비례를 살펴보고 디자인 의도를 적어 주세요.'],deliverable:'패션 디자인 이미지 1점 + 의상 이름 + 착용 상황과 디자인 설명',tip:'멋진 옷에는 이유가 있어요. 실루엣과 패턴이 입는 사람의 움직임에 어떤 느낌을 줄까요?'}
  };
  const course=window.ArtCurriculum?.[job];
  if(course)Object.assign(briefs[job]||{}, {client:course.client,title:course.title,letter:course.letter,requirements:course.summary,deliverable:course.deliverable,tip:course.question});
  const brief = briefs[job];
  const avatar=window.ArtAvatar;
  const profile=avatar?.get();
  const designerName=profile?.name||'새싹 디자이너';
  if (!brief) return;
  const readKey = `artjob_brief_v1_${job}`;
  const checkKey = `artjob_brief_checks_v1_${job}`;
  const store = window.ArtStore;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const savedChecks = store.read(checkKey, []);
  let checks = brief.requirements.map((_, i) => Array.isArray(savedChecks) && savedChecks[i] === true);
  const imageURL = new URL(`assets/brief-${brief.slug}.webp`, base).href;
  document.documentElement.style.setProperty('--office-image', `url("${imageURL}")`);
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = new URL('brief.css', base).href;
  document.head.append(stylesheet);
  const envelope = '<svg class="brief-envelope" viewBox="0 0 320 230" aria-hidden="true"><defs><linearGradient id="envelopePaper" x2="0" y2="1"><stop stop-color="#fffaf0"/><stop offset="1" stop-color="#e4d6ba"/></linearGradient></defs><path d="M20 75L160 10L300 75V210H20Z" fill="#d1bc91"/><g class="envelope-letter"><rect x="55" y="20" width="210" height="170" rx="5" fill="#fffaf1"/><path d="M82 50H200M82 68H234M82 86H222M82 112H190" stroke="#a7ad9b" stroke-width="5"/><circle cx="223" cy="143" r="16" fill="#496451"/></g><path d="M20 75L160 160L300 75V210H20Z" fill="url(#envelopePaper)"/><path d="M20 210L133 134Q160 116 187 134L300 210" fill="#f1e6d0"/><circle cx="160" cy="158" r="23" fill="#375647"/><path d="M160 143L164 154L176 158L164 162L160 174L156 162L144 158L156 154Z" fill="#e5cca0"/></svg>';
  const dialog = document.createElement('dialog');
  dialog.className = 'brief-dialog';
  dialog.setAttribute('aria-labelledby', 'brief-mail-title');
  dialog.innerHTML = `
    <div class="brief-scene" style="background-image:url('${imageURL}')"></div>
    <div class="brief-shade"></div>
    <header class="brief-topbar"><a href="${new URL('index.html',base).href}" class="brief-brand">ART JOB CITY <small>YOUR FIRST DAY AT WORK</small></a><span>${escape(brief.company)}<small>${escape(brief.department)}</small></span><button class="brief-close" type="button" aria-label="의뢰서 닫기">닫기 ×</button></header>
    <section class="mail-arrival" aria-label="새 의뢰 메일">
      <div class="mail-kicker"><i></i> NEW PROJECT / 새 의뢰 도착</div>
      ${envelope}
      <p class="mail-from">FROM. ${escape(brief.client)}</p>
      <h1 id="brief-mail-title">의뢰인에게서<br>메일이 왔어요.</h1>
      <p class="mail-message">${escape(brief.expert)} ${escape(brief.role)}가<br>당신에게 첫 번째 프로젝트를 건넵니다.</p>
      <button type="button" class="mail-open">의뢰 메일 열기 <span>↗</span></button>
      <p class="mail-caption">읽고, 상상하고, 나만의 디자인으로 답해 보세요.</p>
    </section>
    <section class="mentor-encounter" hidden aria-label="내 캐릭터와 전문가의 첫 만남">
      <div class="encounter-heading"><span>YOUR FIRST ENCOUNTER / 0${job}</span><h2>${escape(brief.expert)} 전문가를 만나다.</h2><p>${escape(brief.company)} · ${escape(brief.department)}</p></div>
      <div class="encounter-student"><div class="student-greeting">안녕하세요!<br><strong>${escape(designerName)}</strong> 디자이너입니다.</div><canvas class="encounter-avatar" role="img"></canvas><div class="student-floor"></div><div class="student-nameplate"><span>NEW DESIGNER</span><strong>${escape(designerName)}</strong></div></div>
      <div class="encounter-conversation"><span class="encounter-speaker">${escape(brief.expert)} <small>${escape(brief.role)}</small></span><p>“${escape(designerName)} 디자이너, 만나서 반가워요.<br>${escape(brief.greeting)}”</p><div class="encounter-conversation-bottom"><span>함께 만드는 첫 번째 프로젝트</span><button type="button" class="encounter-continue">의뢰서 받아 보기 <b>→</b></button></div></div>
    </section>
    <section class="brief-meeting" hidden>
      <div class="expert-intro"><div class="expert-company">${escape(brief.company)}</div><h2>${escape(brief.expert)} <small>${escape(brief.role)}</small></h2><p>“${escape(brief.greeting)}”</p><span>당신의 디자인 파트너</span></div>
      <article class="project-paper" aria-label="${escape(brief.title)} 의뢰서">
        <div class="paper-heading"><span>PROJECT BRIEF <b>0${job}</b></span><span>DESIGN REQUEST / 01</span></div>
        <div class="paper-stamp">PROJECT 0${job}</div>
        <p class="paper-category">${escape(brief.department)}</p><h2>${escape(brief.title)}</h2>
        <dl class="paper-meta"><div><dt>의뢰인</dt><dd>${escape(brief.client)}</dd></div><div><dt>담당 전문가</dt><dd>${escape(brief.expert)} · ${escape(brief.role)}</dd></div><div><dt>디자이너</dt><dd>${escape(designerName)}, ART JOB CITY의 신입 디자이너</dd></div></dl>
        <p class="paper-letter">${escape(brief.letter)}</p>
        <h3>디자인할 때 생각해 주세요</h3><ol class="paper-requirements">${brief.requirements.map((r,i)=>`<li><span>0${i+1}</span><p>${escape(r)}</p></li>`).join('')}</ol>
        <div class="paper-deliverable"><span>제출할 작품</span><p>${escape(brief.deliverable)}</p></div>
        <p class="paper-tip">핵심 질문 · ${escape(brief.tip)}</p>
        <button type="button" class="brief-accept">의뢰 확인 · 디자인 시작하기 <span>→</span></button>
        <p class="paper-footnote">선택은 자유롭게, 설명은 나답게. 의뢰서는 작업 중에도 다시 볼 수 있어요.</p>
      </article>
    </section>`;
  document.body.append(dialog);
  const meeting = dialog.querySelector('.brief-meeting');
  const encounter = dialog.querySelector('.mentor-encounter');
  const arrival = dialog.querySelector('.mail-arrival');
  const close = dialog.querySelector('.brief-close');
  const firstButton = dialog.querySelector('.mail-open');
  let accepted = store.getItem(readKey) === 'accepted';
  function documentView() {
    arrival.hidden = true; encounter.hidden=true; meeting.hidden = false;
    dialog.classList.remove('is-encounter');
    dialog.classList.add('is-reading');
    const title = dialog.querySelector('.project-paper h2');
    title.id = 'brief-paper-title'; title.tabIndex = -1;
    dialog.setAttribute('aria-labelledby','brief-paper-title');
    title.focus({preventScroll:true});
    close.hidden = !accepted;
    dialog.scrollTop = 0;
    const paper=dialog.querySelector('.project-paper');
    paper.style.animation='';
    // Ensure the document remains readable even if an embedded browser suspends CSS animation timelines.
    window.setTimeout(()=>{paper.style.animation='none';},850);
  }
  function open(reopen = false) {
    if(dialog.open) return;
    dialog.showModal(); document.body.classList.add('brief-is-open');
    if (reopen) documentView();
    else {arrival.hidden=false; meeting.hidden=true; close.hidden=true; firstButton.focus({preventScroll:true});}
  }
  function finish() {
    accepted = true;
    store.setItem(readKey, 'accepted');
    dialog.close();
    document.body.classList.remove('brief-is-open');
    const reopen = document.querySelector('.brief-reopen');
    if (reopen) reopen.focus({preventScroll:true});
  }
  function encounterView(){
    encounter.querySelector('.encounter-student').classList.remove('arrived');
    arrival.hidden=true;meeting.hidden=true;encounter.hidden=false;
    dialog.classList.remove('is-reading');dialog.classList.add('is-encounter');
    close.hidden=!accepted;dialog.scrollTop=0;
    const current=avatar?.get();
    if(current){const name=encounter.querySelector('.student-nameplate strong');name.textContent=current.name;encounter.querySelector('.student-greeting strong').textContent=current.name;avatar.draw(encounter.querySelector('canvas'),current).catch(()=>{encounter.querySelector('.student-greeting').textContent='캐릭터를 불러오지 못했습니다. 다시 꾸며 주세요.'});}
    const heading=encounter.querySelector('h2');heading.id='encounter-title';heading.tabIndex=-1;dialog.setAttribute('aria-labelledby','encounter-title');heading.focus({preventScroll:true});
    window.setTimeout(()=>{encounter.querySelector('.encounter-student').classList.add('arrived')},900);
  }
  function meetAgain(){if(!dialog.open){dialog.showModal();document.body.classList.add('brief-is-open')}encounterView()}
  firstButton.addEventListener('click', encounterView);
  dialog.querySelector('.encounter-continue').addEventListener('click',documentView);
  dialog.querySelector('.brief-accept').addEventListener('click', finish);
  close.addEventListener('click', finish);
  dialog.addEventListener('cancel', event => {
    // A student may dismiss the introduction with Escape and reopen the brief at any time.
    event.preventDefault(); finish();
  });
  dialog.addEventListener('close',()=>document.body.classList.remove('brief-is-open'));
  const nav = document.querySelector('.header .nav');
  const reopen = document.createElement('button');
  reopen.type='button'; reopen.className='brief-reopen'; reopen.textContent='✉ 의뢰서 다시 보기';
  reopen.addEventListener('click',()=>open(true));
  nav?.prepend(reopen);
  const panel = document.createElement('section');
  panel.className='brief-checklist'; panel.setAttribute('aria-labelledby','brief-checklist-title');
  panel.innerHTML=`<div class="eyebrow">YOUR CLIENT'S BRIEF</div><h2 id="brief-checklist-title">${escape(brief.title)}</h2><p class="brief-client">${escape(brief.client)}의 의뢰</p><div class="brief-check-items">${brief.requirements.map((r,i)=>`<label><input type="checkbox" ${checks[i]?'checked':''} data-brief-check="${i}"><span>${escape(r)}</span></label>`).join('')}</div><p class="brief-selfcheck">내가 반영한 조건을 직접 체크해 보세요.</p><button type="button" class="meet-again">전문가와 다시 만나기 ↗</button>`;
  const info=document.querySelector('.info');
  if(info)info.prepend(panel);
  panel.querySelector('.meet-again').addEventListener('click',meetAgain);
  panel.addEventListener('change',event=>{
    const index=event.target.dataset.briefCheck;
    if(index===undefined)return;
    checks[Number(index)]=event.target.checked;
    store.setItem(checkKey,JSON.stringify(checks));
  });
  const stage=document.querySelector('.main')||document.querySelector('.stage-wrap');
  stage?.classList.add('has-office-scene');
  window.ArtBrief={meet:meetAgain,open:()=>open(true),snapshot:()=>({id:`brief-v1-${job}`,title:brief.title,client:brief.client,expert:brief.expert,checks:[...checks]})};
  if(!accepted)open();
})();
