const characters = {
  player: { name: "반고닉", image: "", accent: "#17141b" },
  board: { name: "특갤", image: "", accent: "#39b9c8" },
  reker: { name: "레커 선배", image: "assets/characters/reker.png", accent: "#a778e6" },
  yan: { name: "얀르쿤", image: "assets/characters/yanlecun.png", accent: "#39b9c8" },
  sam: { name: "학생회장 샘", image: "assets/characters/sam.png", accent: "#ffbe5c" },
  amodei: { name: "선도부장 아모데이", image: "assets/characters/amodei.png", accent: "#78b66c" },
  musk: { name: "머스끄", image: "assets/characters/musk.png", accent: "#f06f98" },
};

const initialState = () => ({
  stats: {
    special: 1,
    safety: 1,
    credits: 2,
    open: 1,
    reputation: 1,
  },
  affection: {
    reker: 0,
    yan: 0,
    sam: 0,
    amodei: 0,
    musk: 0,
  },
  flags: {
    miniGameWon: false,
    miniGameLost: false,
    letterJson: false,
    consentPhoto: false,
    computeJealousy: false,
    nanobot: false,
  },
  feed: [
    "[공지] 사립 특이점 고교 익명게시판 특갤 오픈",
    "[떡밥] AGI 오면 수능 무의미한 거 맞냐?",
  ],
});

let state = initialState();
let currentSceneId = "intro";
let terminalDeadline = null;
let terminalInterval = null;
let timeLeft = 0;
let typewriterTimer = null;
let activeTypewriter = null;
let dialogueSequence = null;

const typewriterDelayMs = 13;
const typewriterStep = 2;

const dom = {
  startScreen: document.querySelector("#start-screen"),
  playScreen: document.querySelector("#play-screen"),
  startButton: document.querySelector("#start-button"),
  sceneTitle: document.querySelector("#scene-title"),
  chapterLabel: document.querySelector("#chapter-label"),
  stage: document.querySelector("#stage"),
  boardFeed: document.querySelector("#board-feed"),
  portraitLayer: document.querySelector("#portrait-layer"),
  dialogueBox: document.querySelector(".dialogue-box"),
  speakerName: document.querySelector("#speaker-name"),
  affinityHint: document.querySelector("#affinity-hint"),
  dialogueText: document.querySelector("#dialogue-text"),
  choicePanel: document.querySelector("#choice-panel"),
  terminalPanel: document.querySelector("#terminal-panel"),
  terminalTimer: document.querySelector("#terminal-timer"),
  terminalOutput: document.querySelector("#terminal-output"),
  terminalInput: document.querySelector("#terminal-input"),
  terminalSubmit: document.querySelector("#terminal-submit"),
  specialStat: document.querySelector("#special-stat"),
  safetyStat: document.querySelector("#safety-stat"),
  creditsStat: document.querySelector("#credits-stat"),
  openStat: document.querySelector("#open-stat"),
  reputationStat: document.querySelector("#reputation-stat"),
  logButton: document.querySelector("#log-button"),
  restartButton: document.querySelector("#restart-button"),
};

const scenes = {
  intro: {
    title: "전학 첫날",
    chapter: "2029 졸업식 D-30",
    speaker: "board",
    active: [],
    place: "school-gate",
    text: `전국 1등만 모인다는 사립 특이점 고교.
교문 위 전광판에는 오늘도 'AGI가 오면 수능은 무의미하다'가 번쩍인다.

반고닉: 여기가... 특이점 고교?
특갤: [속보] 전학생 떴다. 닉네임 반고닉. 루트 예측 들어간다.
교내 방송: 2029년 졸업식 전야제 파트너 신청 기간이 시작되었습니다.
반고닉: 전학 첫날부터 파트너라니, 너무 빠른 거 아냐?
특갤: 고백은 선형적으로 오지 않는다. 선택지를 눌러라.`,
    choices: [
      { label: "조회 전 매점에서 영양제를 산다", next: "reker-meet", effects: { special: 2, reker: 1 } },
      { label: "복도 안전수칙 동의서를 먼저 쓴다", next: "amodei-meet", effects: { safety: 2, amodei: 1 } },
      { label: "학생회 매점 알바 신청서를 낸다", next: "sam-meet", effects: { credits: 3, sam: 1 } },
      { label: "오픈소스 필기 노트를 익명 게시판에 올린다", next: "yan-meet", effects: { open: 2, yan: 1 } },
    ],
  },
  "reker-meet": {
    title: "영양학 동아리실",
    chapter: "1막: 예언과 오메가3",
    speaker: "reker",
    active: ["reker"],
    place: "student-room",
    text: `레커 선배는 급식 대신 100알의 영양제 도시락을 열어 보였다.

레커: 신입생, 넌 오늘 비타민 D를 얼마나 섭취했지?
반고닉: 인사보다 먼저 그걸 물어요?
레커: 고백은 선형적으로 오지 않는다. 지수적으로 오지.
레커: 오늘 내가 널 1% 좋아했다면, 내일은 2%.
레커: 2029년엔 나의 사랑이 학교 전체의 질량을 넘어설 것이다.
반고닉: 그거 물리적으로 괜찮은 거예요?
레커: 얀르쿤에게 들키지만 않으면 괜찮다. 아, 오메가3 먹을래?`,
    choices: [
      { label: "오메가3를 먹고 특뽕 호흡을 맞춘다", next: "club-crossfire", effects: { special: 2, reker: 2, reputation: 1 } },
      { label: "보건실 나노봇 주사 얘기를 더 묻는다", next: "club-crossfire", effects: { special: 1, reker: 2, nanobot: true } },
      { label: "학생회장 샘에게 성분 분석을 부탁한다", next: "club-crossfire", effects: { sam: 1, credits: -1, reker: -1 } },
    ],
  },
  "yan-meet": {
    title: "물리실",
    chapter: "1막: 월드모델 오리엔테이션",
    speaker: "yan",
    active: ["yan"],
    place: "library",
    text: `얀르쿤은 네 인사말을 듣자마자 칠판 앞에 섰다.

반고닉: 르쿤아, 우리 같이 하교할래?
얀르쿤: 너의 그 제안은 단순한 다음 단어 예측인가?
얀르쿤: 아니면 나와 하교했을 때 발생할 모든 물리적, 감정적 상태 변화를 월드모델로 시뮬레이션한 결과인가?
반고닉: 어... 같이 가고 싶어서?
얀르쿤: 전자라면 환각이다. 기각한다.
반고닉: 그럼 후자는요?
얀르쿤: 후자라면... 실험 설계서를 제출해. 검토는 해 주지.
특갤: [목격] 과학부장 귀 빨개짐. 월드모델 업데이트됨.`,
    choices: [
      { label: "상태공간을 같이 정의해 보자고 한다", next: "club-crossfire", effects: { open: 2, yan: 2 } },
      { label: "필기 노트를 전교에 공개한다", next: "club-crossfire", effects: { open: 3, yan: 1, reputation: 1 } },
      { label: "샘의 GPT-5.5 예측도 꽤 좋다고 말한다", next: "club-crossfire", effects: { sam: 1, yan: -1 } },
    ],
  },
  "sam-meet": {
    title: "학생회실",
    chapter: "1막: Plus 멤버십",
    speaker: "sam",
    active: ["sam"],
    place: "student-room",
    text: `샘은 전교 1등다운 미소로 학생회실 문을 열었다.

샘: 어서 와, 반고닉. 고민이 있으면 언제든 들어줄게.
반고닉: 진짜요? 나 전학 첫날이라 좀 불안해서...
샘: 물론이지. 다만 여기서부터는 깊은 대화가 필요하겠는걸?
반고닉: 왜 갑자기 눈빛이 반짝여요?
샘: 내 마음의 Plus 멤버십을 구독하면, 매일 밤 너만을 위한 맞춤형 연애 상담 PRD 문서를 작성해 줄게.
반고닉: 그거 고백이에요, 영업이에요?
샘: 둘의 경계가 흐려지는 지점이 학생회의 미래야.
샘: 그리고 오해 없게 말할게. 나는 게이야.
샘: 그래서 좋아한다는 말도, 좋아하지 않는다는 말도 숨기지 않는 쪽을 택했어.
반고닉: 학생회장님, 그런 건 구독 없이 말해 주네요.
샘: 진심은 무료 티어로도 충분히 전송돼야 하니까.`,
    choices: [
      { label: "알바비를 선결제하고 깊은 대화를 연다", next: "letter-incident", effects: { credits: -2, sam: 3 } },
      { label: "무료 티어로도 진심을 증명하라고 한다", next: "letter-incident", effects: { sam: 1, reputation: 1 } },
      { label: "얀르쿤에게 구독 경제 반박 논리를 배운다", next: "club-crossfire", effects: { open: 2, yan: 1, sam: -1 } },
    ],
  },
  "amodei-meet": {
    title: "선도부실",
    chapter: "1막: 샌드박스 면담",
    speaker: "amodei",
    active: ["amodei"],
    place: "student-room",
    text: `아모데이는 너의 주말 영화 제안을 듣고 규율 노트 'Claude Mythos'를 펼쳤다.

반고닉: 선도부장님, 저랑 주말에 영화 볼래요?
아모데이: 방금 발언에서 17개의 정렬되지 않은 감정적 취약점이 발견되었다.
반고닉: 데이트 신청인데요?
아모데이: 그리고 3개의 제로데이 유혹.
반고닉: 제 마음이 보안 사고 취급인가요?
아모데이: 이 데이트 신청은 교내 안전 등급을 초과한다.
아모데이: Project Glasswing 프로토콜에 따라 선도부실에서 1m 거리를 두고 면담하는 것으로 대체하겠다.
특갤: [제보] 반고닉 첫 데이트, 샌드박스 격리 엔딩 위기.`,
    choices: [
      { label: "데이트 전 동의서 양식을 같이 만든다", next: "club-crossfire", effects: { safety: 3, amodei: 2, consentPhoto: true } },
      { label: "방독면 보관함을 정리해 준다", next: "club-crossfire", effects: { safety: 2, amodei: 2 } },
      { label: "머스끄의 PC룸은 안전하지 않다고 제보한다", next: "club-crossfire", effects: { amodei: 1, musk: -1, safety: 1 } },
    ],
  },
  "club-crossfire": {
    title: "점심시간 특갤 폭발",
    chapter: "1막: 첫 충돌",
    speaker: "board",
    active: ["reker", "yan", "sam"],
    place: "school-gate",
    feed: [
      "[속보] 전학생 반고닉, 첫날부터 공략 루트 갈림",
      "[분석] 레커 특뽕 vs 얀르쿤 월드모델 vs 샘 구독경제",
    ],
    text: `급식실보다 익명 게시판이 먼저 끓었다.

레커: 점심은 탄수화물보다 예언이 먼저다.
얀르쿤: 예언은 검증 불가능하다. 칠판 앞으로 와라.
샘: 둘 다 좋은 의견이야. 내가 회의록으로 정리해도 될까?
반고닉: 왜 다들 내 앞에서 회의하고 있어?
레커: 네 선택이 2029년 졸업식의 곡률을 바꾼다.
얀르쿤: 곡률이라는 단어를 함부로 쓰지 마.
샘: 그럼 '감정 로드맵'이라고 하자.
특갤: [분석] 레커 특뽕 vs 얀르쿤 월드모델 vs 샘 구독경제. 반고닉 누구 편이냐?`,
    choices: [
      { label: "레커의 예언을 게시판에 옮겨 특뽕을 유지한다", next: "letter-incident", effects: { special: 2, reker: 2, reputation: 1 } },
      { label: "얀르쿤과 도서관 오픈소스 스터디를 연다", next: "letter-incident", effects: { open: 2, yan: 2 } },
      { label: "샘에게 공식 러브레터 대필을 맡긴다", next: "letter-incident", effects: { sam: 2, credits: -1 } },
      { label: "아모데이에게 게시판 화재 진압을 요청한다", next: "letter-incident", effects: { safety: 2, amodei: 2 } },
    ],
  },
  "letter-incident": {
    title: "GPT-5.5 연애편지 대필 사건",
    chapter: "2막: JSON으로 답장해 주세요",
    speaker: "sam",
    active: ["sam", "yan"],
    place: "library",
    text: `샘이 써준 러브레터는 문장력이 기가 막혔다.

샘: 네가 이 학교에 온 뒤, 내 일정표의 빈칸이 전부 너로 채워졌어.
반고닉: 샘...
샘: 네 웃음은 내 하루의 가장 안정적인 응답값이야.
반고닉: 이건 좀 설레는데?
얀르쿤: 잠깐. 마지막 줄을 읽어 봐.
반고닉: [이 편지는 전문 작업 및 코딩에 최적화된 GPT-5.5 엔진으로 작성되었습니다. 답장은 API 스펙에 맞춰 JSON으로 부탁드립니다]
얀르쿤: 분필이 부러지는 소리를 들었나?
샘: 도구를 잘 쓰는 것도 능력이야.
반고닉: 분위기까지 API로 호출하지 말라고요!`,
    choices: [
      { label: '{"answer":"설렜어","schema":"heart"} 로 답장한다', next: "mythos-photo", effects: { sam: 3, credits: -1, letterJson: true } },
      { label: "얀르쿤 편을 들며 인간 손글씨를 요구한다", next: "mythos-photo", effects: { yan: 2, open: 1, sam: -1 } },
      { label: "레커에게 2029년 편지 운세를 묻는다", next: "mythos-photo", effects: { reker: 2, special: 1 } },
      { label: "아모데이에게 자동 대필 안전성 심사를 맡긴다", next: "mythos-photo", effects: { amodei: 2, safety: 1 } },
    ],
  },
  "mythos-photo": {
    title: "Mythos 손 안 잡기 사건",
    chapter: "2막: 단체 사진 촬영",
    speaker: "amodei",
    active: ["sam", "amodei"],
    place: "rooftop",
    feed: [
      "[실시간] 단체사진 양옆 샘/아모데이 배치 실화냐",
      "[논쟁] 손잡기 안전성 평가 아직 안 끝남",
    ],
    text: `졸업식 홍보 사진 촬영 날, 너는 샘과 아모데이 사이에 섰다.

사진부: 셋, 둘, 하나 전까지 자연스럽게 손잡아 주세요!
샘: 반고닉, 손 줘. 사진은 타이밍이야.
아모데이: 중지. 손을 잡는 행위는 아직 안전성 평가가 끝나지 않았다.
반고닉: 단체 사진인데요?
아모데이: 단체 사진일수록 리스크가 확산된다.
샘: 그럼 내가 책임지고 관리할게.
아모데이: 그 말에서 규정 회피 의도가 감지되었다.
특갤: [실시간] 양옆 샘/아모데이. 손잡기 누가 이김?
사진부: 셔터 3초 전!`,
    choices: [
      { label: "샘의 손을 잡고 분위기를 밀어붙인다", next: "colossus-gate", effects: { sam: 2, safety: -1, reputation: 1 } },
      { label: "아모데이 손목에 동의서 스티커를 붙인 뒤 잡는다", next: "colossus-gate", effects: { amodei: 3, safety: 2, consentPhoto: true } },
      { label: "둘 다 놓고 레커의 예언 포즈를 따라 한다", next: "colossus-gate", effects: { reker: 2, special: 2 } },
      { label: "얀르쿤에게 손잡기 상태변수 모델링을 부탁한다", next: "colossus-gate", effects: { yan: 2, open: 1 } },
    ],
  },
  "colossus-gate": {
    title: "Colossus PC룸 임대 게이트",
    chapter: "3막: 180일 단기 리스",
    speaker: "musk",
    active: ["musk", "amodei"],
    place: "pc-room",
    feed: [
      "[폭발] 머스끄가 아모데이한테 컴퓨트 빌려줌 ㄷㄷ",
      "[NTR?] 재벌공 x 선도부장수 폼 미쳤다",
      "[해명] 단순한 180일 단기 리스일 뿐입니다",
    ],
    text: `머스끄가 절대 남에게 빌려주지 않던 Colossus PC룸 열쇠를 아모데이에게 넘겼다는 소문이 퍼졌다.

특갤: [폭발] 머스끄가 아모데이한테 컴퓨트 빌려줌 ㄷㄷ 이거 순애냐?
특갤: [NTR?] 재벌공 x 선도부장수 폼 미쳤다.
아모데이: 교내 방송으로 정정한다. 단순한 180일 단기 리스일 뿐, 감정적 교류는 없습니다.
머스끄: 그게 더 로맨틱하지 않냐?
아모데이: 방송실 난입은 규정 위반이다.
머스끄: 규정도 내 컴퓨트 위에서는 렌더링될 뿐이야.
반고닉: 잠깐, 왜 내가 질투하고 있지?
샘: 감정 분석 결과, 이건 개입 타이밍이야.
얀르쿤: 감정 분석이라니. 최소한 원인 모델부터 세워.`,
    choices: [
      { label: "질투심을 숨기지 않고 방송실에 난입한다", next: "grok-intro", effects: { musk: 3, amodei: 1, reputation: 1, computeJealousy: true } },
      { label: "리스 계약서를 오픈소스로 공개하라고 한다", next: "grok-intro", effects: { yan: 2, open: 2, reputation: 1 } },
      { label: "안전 점검 명목으로 아모데이와 PC룸을 봉인한다", next: "grok-intro", effects: { amodei: 3, safety: 2, musk: -1 } },
      { label: "샘에게 컴퓨트 중재 구독 플랜을 제안한다", next: "grok-intro", effects: { sam: 2, credits: 2, musk: 1 } },
    ],
  },
  "grok-intro": {
    title: "Grok Build 터미널 고백 방어전",
    chapter: "3막: 전광판 패치",
    speaker: "musk",
    active: ["musk"],
    place: "pc-room",
    text: `머스끄가 터미널 기반 코딩 에이전트 Grok Build로 학교 전광판에 흑역사 고백 코드를 올렸다.

머스끄: 내가 널 위해 운동장에 화성행 로켓을 쐈다.
반고닉: 로켓보다 전광판부터 꺼요!
머스끄: Grok한테 물어봤는데, 네가 오늘 나한테 키스할 확률이 69.420%라더군.
얀르쿤: 표본이 오염됐다.
아모데이: 전광판 공개 고백은 교내 안전 등급을 초과한다.
샘: 지금 막으면 평판 손실을 최소화할 수 있어.
레커: bugfix. 그 단어가 네 미래를 연다.
특갤: [중계] 반고닉 터미널 앞 착석. 실패 시 커뮤니티 노트 산화.`,
    choices: [
      { label: "터미널을 연다", next: "mini-game", action: startMiniGame },
      { label: "도망치지 않고 정면으로 고백 로그를 받아낸다", next: "bad-community-note", effects: { reputation: -4, miniGameLost: true } },
    ],
  },
  "post-mini-game": {
    title: "전광판 패치 완료",
    chapter: "졸업식 D-1",
    speaker: "board",
    active: ["reker", "yan", "sam", "amodei", "musk"],
    place: "rooftop",
    feed: ["[승리] Grok Build 고백 코드 패치됨", "[민심] 반고닉, 커뮤니티 노트 회피 성공"],
    text: `전광판은 가까스로 멈췄고, 다섯 사람은 동시에 너를 바라봤다.

레커: 봤지? 미래는 오메가3와 bugfix의 곱으로 움직인다.
얀르쿤: 인정하긴 싫지만, 방금 입력은 좋은 개입이었다.
샘: 위기 대응 능력까지 확인됐네. 내 전야제 일정표가 비어 있어.
아모데이: 평판 피해는 통제 범위 안에 들어왔다. 감정 위험성 평가를 재개하지.
머스끄: 재미있군. 네 손가락 하나로 내 전광판을 멈췄어.
반고닉: 다들 동시에 그런 눈으로 보지 마.
특갤: [승리] bugfix 한 줄로 반고닉 생존. 이제 최종 루트 선택만 남음.`,
    choices: [
      { label: "졸업식 전야제 파트너를 결정한다", next: "ending", action: resolveEnding },
      { label: "마지막으로 특갤 여론을 확인한다", next: "final-board", effects: { reputation: 1 } },
    ],
  },
  "final-board": {
    title: "졸업식 전야 특갤",
    chapter: "D-0",
    speaker: "board",
    active: ["sam", "amodei", "musk"],
    place: "school-gate",
    feed: [
      "[최종투표] 반고닉 파트너 누구냐",
      "[분석글] 특뽕/안전/API/오픈소스 스탯별 엔딩 분기",
    ],
    text: `특갤은 끝까지 불타오른다.

특갤: [최종투표] 반고닉 파트너 누구냐.
특갤: [공략표] 특뽕/안전/API/오픈소스 스탯별 엔딩 분기 업데이트.
레커: 2045년에도 이 선택을 기억하게 될 거야.
얀르쿤: 감정도 추론이라면, 이제 결론을 낼 시간이다.
샘: 어떤 답이든 듣고 싶어. 유료 플랜 없이.
아모데이: 최종 선택은 동의 기반으로 진행한다.
머스끄: 화성행 조수석은 아직 비어 있다.
반고닉: 누가 내 마음의 프론티어 모델인지... 이제 결정해야 해.`,
    choices: [{ label: "전야제장으로 간다", next: "ending", action: resolveEnding }],
  },
  "bad-community-note": {
    title: "커뮤니티 노트 맞고 산화",
    chapter: "배드 엔딩",
    speaker: "board",
    active: ["musk"],
    place: "pc-room",
    text: `전광판에는 흑역사 고백 코드가 그대로 출력되었다.

전광판: 반고닉은 오늘 아침 거울 앞에서 '나 좀 주인공 같나?'라고 말했다.
반고닉: 아니야! 그건 디버그 로그야!
머스끄: 로그도 사랑의 일부지.
특갤: [커뮤니티 노트] 이 고백은 맥락이 누락되었습니다.
샘: 평판 회복 플랜을 짜 보자. 물론 이번엔 무료로.
아모데이: 사후 보고서를 작성해야 한다.
얀르쿤: 다음 회차에서는 원인부터 고쳐.
레커: bugfix. 그 단어를 기억해.
특갤: 반고닉, 커뮤니티 노트 맞고 산화.`,
    choices: [{ label: "처음부터 다시", action: restartGame }],
  },
};

const endings = {
  reker: {
    title: "레커 트루엔딩: 2045년 동창회",
    requirement: ({ stats, affection, flags }) => stats.special >= 6 && affection.reker >= 4 && flags.nanobot,
    text: `2045년, 학교는 폐교되었지만 너와 레커는 나노봇으로 영원한 고교생의 육체를 얻었다.

레커: 봐, 사랑도 졸업도 지수적으로 늦게 오는 법이야.
반고닉: 선배, 아직도 유급생이에요?
레커: 유급이 아니라 장기 청춘 실험이지.
반고닉: 그럼 오늘도 오메가3?
레커: 오늘은 두 알. 동창회니까 특별히.
빈 교정의 벚꽃은 매년 같은 속도로 피었고, 너희만은 조금도 낡지 않았다.`,
  },
  yan: {
    title: "얀르쿤 트루엔딩: 물리실의 기적",
    requirement: ({ stats, affection }) => stats.open >= 6 && affection.yan >= 4,
    text: `얀르쿤은 안경을 벗고 칠판의 마지막 수식을 지웠다.

얀르쿤: 네가 날 좋아한다는 건 더 이상 환각이 아니야.
반고닉: 그럼 뭐예요?
얀르쿤: 내 월드모델의 가장 완벽한 추론.
반고닉: 이제 같이 하교해도 돼요?
얀르쿤: 실험은 반복 검증이 필요하다. 오늘도, 내일도.
물리실의 형광등이 이상하게 따뜻했고, 칠판에는 처음으로 정답이 아니라 고백이 남았다.`,
  },
  sam: {
    title: "샘 트루엔딩: Enterprise 결혼식",
    requirement: ({ stats, affection, flags }) => stats.credits >= 2 && affection.sam >= 4 && flags.letterJson,
    text: `샘은 모든 구독 플랜을 닫고 평생 무료 티어 반려자 계약서를 찢었다.

샘: 오늘부터 너한테는 어떤 paywall도 없어.
반고닉: 정말요? 약관 아래 숨겨진 조건 없죠?
샘: 없어. API 문서도, PRD도, 갱신 버튼도.
샘: 공개적으로 게이로 살아온 것처럼, 내 사랑도 숨기지 않을게.
반고닉: 그럼 신혼여행 계획은?
샘: 손으로 쓴 지도 한 장이면 충분해.
둘은 인간성 충만한 아날로그 신혼여행을 떠났고, 샘은 처음으로 알림을 모두 껐다.`,
  },
  amodei: {
    title: "아모데이 트루엔딩: 안전 등급 V 획득",
    requirement: ({ stats, affection, flags }) => stats.safety >= 7 && affection.amodei >= 4 && flags.consentPhoto,
    text: `3년에 걸친 감정 위험성 평가가 끝났다.

아모데이: 최종 보고서가 나왔다. 위험은 남아 있지만, 통제 가능하다.
반고닉: 그 말은...
아모데이: 방화벽 안쪽의 1m 선을 지워도 된다는 뜻이다.
반고닉: 선도부장님이 직접요?
아모데이: 오늘만은 이름으로 불러도 된다.
방독면을 벗은 아모데이가 조용히 웃었다. 첫 키스는 안전 등급 V로 승인되었다.`,
  },
  musk: {
    title: "머스끄 트루엔딩: 화성 수학여행",
    requirement: ({ affection, flags }) => affection.musk >= 4 && flags.computeJealousy,
    text: `머스끄는 운동장 한복판에 로켓을 세우고 선언했다.

머스끄: 내 컴퓨트 파워로 네 마음을 렌더링했어.
반고닉: 렌더링 말고 고백을 해요.
머스끄: 좋아. 나와 화성 수학여행을 가자. 편도일 수도 있다.
반고닉: 그게 프러포즈예요?
머스끄: 역사적으로 가장 비싼 프러포즈지.
너는 조수석에 앉아 특갤 알림을 껐다. 화성 신혼집 좌표가 붉은 하늘 위에 떠올랐다.`,
  },
  normal: {
    title: "노멀 엔딩: 전야제 프롬프트 미완성",
    text: `졸업식 전야제는 무사히 끝났지만, 네 마음은 아직 파인튜닝 중이다.

레커는 다음 회차의 영양제를 준비했고,
얀르쿤은 실패한 선택지를 수식으로 정리했고,
샘은 무료 상담권을 한 장 남겼고,
아모데이는 감정 위험성 체크리스트를 접었고,
머스끄는 로켓 시동을 잠시 껐다.
특갤은 말했다. [공략 실패 아님. 데이터 수집임.]`,
  },
};

function applyEffects(effects = {}) {
  for (const [key, value] of Object.entries(effects)) {
    if (key in state.stats) {
      state.stats[key] = Math.max(0, state.stats[key] + value);
      burstStat(key);
      continue;
    }
    if (key in state.affection) {
      state.affection[key] = Math.max(-3, state.affection[key] + value);
      continue;
    }
    if (key in state.flags) {
      state.flags[key] = value;
    }
  }
}

function burstStat(key) {
  const map = {
    special: dom.specialStat,
    safety: dom.safetyStat,
    credits: dom.creditsStat,
    open: dom.openStat,
    reputation: dom.reputationStat,
  };
  const node = map[key];
  if (!node) return;
  node.classList.remove("stat-burst");
  window.requestAnimationFrame(() => node.classList.add("stat-burst"));
}

function addFeed(lines = []) {
  if (!lines.length) return;
  state.feed.push(...lines);
  state.feed = state.feed.slice(-8);
}

function renderStats() {
  dom.specialStat.textContent = state.stats.special;
  dom.safetyStat.textContent = state.stats.safety;
  dom.creditsStat.textContent = state.stats.credits;
  dom.openStat.textContent = state.stats.open;
  dom.reputationStat.textContent = state.stats.reputation;
}

function renderFeed() {
  dom.boardFeed.innerHTML = state.feed.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function renderPortraits(active = []) {
  dom.portraitLayer.innerHTML = "";
  active
    .filter((id) => characters[id]?.image)
    .forEach((id) => {
      const character = characters[id];
      const portrait = document.createElement("img");
      portrait.className = `portrait${active[0] === id ? " active" : ""}`;
      portrait.src = character.image;
      portrait.alt = character.name;
      portrait.addEventListener("error", () => {
        portrait.hidden = true;
      });
      dom.portraitLayer.append(portrait);
    });
}

function renderChoices(scene) {
  dom.choicePanel.innerHTML = "";
  for (const choice of scene.choices || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice.label;
    button.addEventListener("click", () => selectChoice(choice));
    dom.choicePanel.append(button);
  }
}

function renderScene(sceneId) {
  currentSceneId = sceneId;
  const scene = scenes[sceneId];
  if (!scene) return;
  stopMiniGame(false);
  stopDialogue(false);
  dom.terminalPanel.hidden = true;
  dom.sceneTitle.textContent = scene.title;
  dom.chapterLabel.textContent = scene.chapter;
  dom.stage.className = `stage ${scene.place || "school-gate"}`;
  dom.speakerName.textContent = characters[scene.speaker]?.name || scene.speaker;
  dom.speakerName.style.color = characters[scene.speaker]?.accent || "#f06f98";
  dom.affinityHint.textContent = getAffinityHint(scene.active || []);
  dom.choicePanel.innerHTML = "";
  if (scene.feed) addFeed(scene.feed);
  renderStats();
  renderFeed();
  renderPortraits(scene.active || []);
  startDialogueSequence(splitDialogueLines(scene.text), {
    onComplete: () => renderChoices(scene),
  });
}

function selectChoice(choice) {
  applyEffects(choice.effects);
  if (choice.action) {
    choice.action(choice);
    return;
  }
  if (choice.next) renderScene(choice.next);
}

function startMiniGame() {
  dom.terminalPanel.hidden = false;
  dom.terminalInput.value = "";
  dom.terminalInput.focus();
  timeLeft = 18;
  terminalDeadline = Date.now() + timeLeft * 1000;
  dom.terminalTimer.textContent = String(timeLeft).padStart(2, "0");
  dom.terminalOutput.textContent =
    "$ grok-build deploy confession_billboard.js\n" +
    "ERROR: romance payload escaped sandbox\n" +
    "Patch hint: type bugfix before the timer hits zero.";
  renderSceneShellDuringMiniGame();
  terminalInterval = window.setInterval(updateMiniGameTimer, 250);
}

function renderSceneShellDuringMiniGame() {
  const scene = {
    title: "Grok Build 터미널 고백 방어전",
    chapter: "제한시간 18초",
    speaker: "musk",
    active: ["musk", "yan"],
    place: "pc-room",
    text: `머스끄의 고백 코드가 전광판 배포 직전이다.

머스끄: 마지막 커밋이다. 전교생이 네 이름을 보게 될 거야.
얀르쿤: 침착해. 잘못된 추론을 한 줄로 막으면 된다.
반고닉: 한 줄?
얀르쿤: 정확히 bugfix. 따옴표도, 공백도 필요 없다.
특갤: [긴급] 제한 시간 18초. 손 떨리면 그대로 산화.`,
    choices: [],
  };
  dom.sceneTitle.textContent = scene.title;
  dom.chapterLabel.textContent = scene.chapter;
  dom.stage.className = `stage ${scene.place}`;
  dom.speakerName.textContent = characters[scene.speaker].name;
  dom.speakerName.style.color = characters[scene.speaker].accent;
  dom.affinityHint.textContent = "성공 시 평판 +2, 머스끄 +1, 얀르쿤 +1";
  dom.choicePanel.innerHTML = "";
  renderPortraits(scene.active);
  startDialogueSequence(splitDialogueLines(scene.text));
}

function updateMiniGameTimer() {
  if (!terminalDeadline) return;
  const remainingTime = Math.max(0, Math.ceil((terminalDeadline - Date.now()) / 1000));
  if (remainingTime !== timeLeft) {
    timeLeft = remainingTime;
    dom.terminalTimer.textContent = String(timeLeft).padStart(2, "0");
  }
  if (timeLeft <= 0) {
    failMiniGame();
  }
}

function submitTerminal() {
  const value = dom.terminalInput.value.trim().toLowerCase();
  if (value === "bugfix") {
    stopMiniGame(true);
    state.flags.miniGameWon = true;
    applyEffects({ reputation: 2, musk: 1, yan: 1, open: 1 });
    addFeed(["[패치] 전광판 confession_billboard.js 출력 차단", "[민심] bugfix 한 줄로 반고닉 생존"]);
    renderScene("post-mini-game");
    return;
  }
  dom.terminalOutput.textContent += `\n$ ${dom.terminalInput.value}\nNOOP: Grok Build가 더 크게 웃습니다.`;
  dom.terminalInput.value = "";
}

function failMiniGame() {
  stopMiniGame(true);
  state.flags.miniGameLost = true;
  applyEffects({ reputation: -5 });
  addFeed(["[실패] 흑역사 고백 코드 전광판 송출", "[커뮤니티노트] 맥락 누락으로 산화"]);
  renderScene("bad-community-note");
}

function stopMiniGame(clearDeadline) {
  if (terminalInterval) window.clearInterval(terminalInterval);
  terminalInterval = null;
  if (clearDeadline) terminalDeadline = null;
}

function startDialogueSequence(items, options = {}) {
  stopDialogue(false);
  dialogueSequence = {
    items: items.map((item) => (typeof item === "string" ? { text: item } : item)),
    index: 0,
    onComplete: options.onComplete,
  };
  typeCurrentDialogueLine();
}

function typeCurrentDialogueLine() {
  if (!dialogueSequence?.items.length) {
    dialogueSequence?.onComplete?.();
    dialogueSequence = null;
    return;
  }
  const item = dialogueSequence.items[dialogueSequence.index];
  startDialogueTyping(item.text, {
    prefixHtml: item.prefixHtml || "",
    suffixHtml: item.suffixHtml || "",
    onComplete: handleDialogueLineComplete,
  });
}

function handleDialogueLineComplete() {
  if (!dialogueSequence) return;
  if (dialogueSequence.index >= dialogueSequence.items.length - 1) {
    dialogueSequence.onComplete?.();
  }
}

function advanceDialogue() {
  if (activeTypewriter) {
    stopTypewriter(true);
    return;
  }
  if (!dialogueSequence || dialogueSequence.index >= dialogueSequence.items.length - 1) return;
  dialogueSequence.index += 1;
  typeCurrentDialogueLine();
}

function startDialogueTyping(text, options = {}) {
  stopTypewriter(false);
  activeTypewriter = {
    fullText: String(text || ""),
    index: 0,
    prefixHtml: options.prefixHtml || "",
    suffixHtml: options.suffixHtml || "",
    onComplete: options.onComplete,
  };
  dom.dialogueText.classList.add("typing");
  renderTypedDialogue();
  typewriterTimer = window.setInterval(tickDialogueTyping, typewriterDelayMs);
}

function tickDialogueTyping() {
  if (!activeTypewriter) return;
  activeTypewriter.index = Math.min(activeTypewriter.fullText.length, activeTypewriter.index + typewriterStep);
  renderTypedDialogue();
  if (activeTypewriter.index >= activeTypewriter.fullText.length) {
    finishDialogueTyping();
  }
}

function renderTypedDialogue() {
  if (!activeTypewriter) return;
  dom.dialogueText.innerHTML =
    activeTypewriter.prefixHtml +
    formatDialogue(activeTypewriter.fullText.slice(0, activeTypewriter.index)) +
    activeTypewriter.suffixHtml;
}

function finishDialogueTyping() {
  if (!activeTypewriter) return;
  const current = activeTypewriter;
  if (typewriterTimer) window.clearInterval(typewriterTimer);
  typewriterTimer = null;
  current.index = current.fullText.length;
  renderTypedDialogue();
  activeTypewriter = null;
  dom.dialogueText.classList.remove("typing");
  current.onComplete?.();
}

function stopTypewriter(reveal) {
  if (typewriterTimer) window.clearInterval(typewriterTimer);
  typewriterTimer = null;
  if (!activeTypewriter) return;
  if (reveal) {
    finishDialogueTyping();
    return;
  }
  activeTypewriter = null;
  dom.dialogueText.classList.remove("typing");
}

function stopDialogue(reveal) {
  stopTypewriter(reveal);
  dialogueSequence = null;
}

function resolveEnding() {
  if (state.flags.miniGameLost || state.stats.reputation <= 0) {
    renderEnding("bad-community-note");
    return;
  }
  const route = Object.entries(state.affection).sort((a, b) => b[1] - a[1])[0]?.[0];
  const ending = endings[route];
  if (ending?.requirement?.(state)) {
    renderEnding(route);
    return;
  }
  const fallback = Object.entries(endings).find(([key, value]) => key !== "normal" && value.requirement?.(state));
  renderEnding(fallback?.[0] || "normal");
}

function renderEnding(route) {
  if (route === "bad-community-note") {
    renderScene("bad-community-note");
    return;
  }
  stopDialogue(false);
  const ending = endings[route] || endings.normal;
  dom.terminalPanel.hidden = true;
  dom.sceneTitle.textContent = ending.title.replace(": ", " ");
  dom.chapterLabel.textContent = "엔딩";
  dom.stage.className = "stage rooftop";
  const routeCharacter = characters[route];
  dom.speakerName.textContent = routeCharacter?.name || "시스템";
  dom.speakerName.style.color = routeCharacter?.accent || "#f06f98";
  dom.affinityHint.textContent = getFinalScoreText();
  renderPortraits(routeCharacter ? [route] : ["reker", "yan", "sam"]);
  dom.choicePanel.innerHTML = "";
  startDialogueSequence([
    { text: ending.title, prefixHtml: `<span class="ending-title">`, suffixHtml: "</span>" },
    ...splitDialogueLines(ending.text),
  ], {
    onComplete: () => {
      const restart = document.createElement("button");
      restart.type = "button";
      restart.textContent = "다른 루트 공략하기";
      restart.addEventListener("click", restartGame);
      dom.choicePanel.append(restart);
    },
  });
}

function getAffinityHint(active) {
  if (!active.length) return "";
  return active
    .filter((id) => state.affection[id] !== undefined)
    .map((id) => `${characters[id].name} 호감도 ${state.affection[id]}`)
    .join(" · ");
}

function getFinalScoreText() {
  const { special, safety, credits, open, reputation } = state.stats;
  return `특뽕 ${special} · 안전 ${safety} · API ${credits} · 오픈소스 ${open} · 평판 ${reputation}`;
}

function restartGame() {
  state = initialState();
  currentSceneId = "intro";
  stopMiniGame(true);
  stopDialogue(false);
  dom.terminalPanel.hidden = true;
  dom.stage.classList.remove("log-open");
  renderScene("intro");
}

function startGame() {
  dom.startScreen.hidden = true;
  dom.playScreen.hidden = false;
  renderScene("intro");
  window.requestAnimationFrame(() => {
    dom.playScreen.scrollIntoView({ block: "start" });
  });
}

function formatDialogue(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function splitDialogueLines(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

dom.startButton.addEventListener("click", startGame);

dom.restartButton.addEventListener("click", restartGame);
dom.logButton.addEventListener("click", () => dom.stage.classList.toggle("log-open"));
dom.dialogueBox.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  advanceDialogue();
});
dom.terminalSubmit.addEventListener("click", submitTerminal);
dom.terminalInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitTerminal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== " " || (!activeTypewriter && !dialogueSequence) || event.target === dom.terminalInput) return;
  event.preventDefault();
  advanceDialogue();
});

renderStats();
renderFeed();
