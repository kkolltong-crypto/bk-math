// ═══════════════════════════════════════════════════════════════════
// bk 수학 — 학생 앱 + 교사 대시보드 통합
// storage: shared=true (전체 학생 데이터 공유)
// ═══════════════════════════════════════════════════════════════════
const { useState, useEffect, useRef, useCallback } = React;

// ── 소단원 목록 ────────────────────────────────────────────────────
const UNITS_1 = ["정수의 덧셈","정수의 뺄셈","정수와 유리수의 곱셈","정수와 유리수의 나눗셈","문자의 사용과 식의 값","일차식과 수의 곱셈과 나눗셈","일차식의 덧셈과 뺄셈","일차방정식","정비례","반비례"];
const UNITS_2 = ["기본 도형","다각형의 성질","원과 부채꼴","자료의 정리"];
const ALL_UNITS = [...UNITS_1, ...UNITS_2];
const MAX_ROUNDS = 3;

// ── 문제 데이터 (핵심 단원만 수록, 나머지는 동일 구조로 확장 가능) ──
const DB = {
"정수의 덧셈":{qs:[
  {o:{q:"(-3)+(+7)",a:"4",e:"절댓값 차 7-3=4, 큰 쪽(+) → +4"},s:{q:"(-5)+(+9)",a:"4",e:"절댓값 차 9-5=4"}},
  {o:{q:"(-8)+(-5)",a:"-13",e:"음수+음수: 8+5=13 → -13"},s:{q:"(-6)+(-7)",a:"-13",e:"6+7=13 → -13"}},
  {o:{q:"(+6)+(-9)",a:"-3",e:"9-6=3, 큰 쪽(-) → -3"},s:{q:"(+4)+(-7)",a:"-3",e:"7-4=3, 큰 쪽(-) → -3"}},
  {o:{q:"(-4)+(+4)",a:"0",e:"절댓값 같고 부호 반대 → 0"},s:{q:"(-7)+(+7)",a:"0",e:"절댓값 같고 부호 반대 → 0"}},
  {o:{q:"(-12)+(+7)",a:"-5",e:"12-7=5, 큰 쪽(-) → -5"},s:{q:"(-11)+(+6)",a:"-5",e:"11-6=5 → -5"}},
  {o:{q:"(+3)+(-3)+(-2)",a:"-2",e:"3+(-3)=0, 0+(-2)=-2"},s:{q:"(+5)+(-5)+(-3)",a:"-3",e:"5+(-5)=0 → -3"}},
  {o:{q:"(-5)+(-7)+(+3)",a:"-9",e:"(-5)+(-7)=-12, -12+3=-9"},s:{q:"(-4)+(-8)+(+3)",a:"-9",e:"-12+3=-9"}},
  {o:{q:"(+9)+(-13)",a:"-4",e:"13-9=4, 큰 쪽(-) → -4"},s:{q:"(+7)+(-11)",a:"-4",e:"11-7=4 → -4"}},
  {o:{q:"(-6)+(-6)",a:"-12",e:"6+6=12 → -12"},s:{q:"(-7)+(-7)",a:"-14",e:"7+7=14 → -14"}},
  {o:{q:"(+2)+(-8)+(+4)",a:"-2",e:"6+(-8)=-2"},s:{q:"(+3)+(-9)+(+4)",a:"-2",e:"7-9=-2"}},
  {o:{q:"(-15)+(+8)",a:"-7",e:"15-8=7 → -7"},s:{q:"(-13)+(+6)",a:"-7",e:"13-6=7 → -7"}},
  {o:{q:"(+11)+(-4)",a:"7",e:"11-4=7 → +7"},s:{q:"(+9)+(-2)",a:"7",e:"9-2=7 → +7"}},
  {o:{q:"(-7)+(-3)+(+10)",a:"0",e:"-10+10=0"},s:{q:"(-6)+(-4)+(+10)",a:"0",e:"-10+10=0"}},
  {o:{q:"(+4)+(-9)+(+2)",a:"-3",e:"6-9=-3"},s:{q:"(+3)+(-8)+(+2)",a:"-3",e:"5-8=-3"}},
  {o:{q:"(-20)+(+13)",a:"-7",e:"20-13=7 → -7"},s:{q:"(-18)+(+11)",a:"-7",e:"18-11=7 → -7"}},
  {o:{q:"(+6)+(-6)+(-3)",a:"-3",e:"0-3=-3"},s:{q:"(+8)+(-8)+(-5)",a:"-5",e:"0-5=-5"}},
  {o:{q:"(-1)+(-1)+(-1)+(-1)",a:"-4",e:"음수 4개 → -4"},s:{q:"(-2)+(-2)+(-2)+(-2)",a:"-8",e:"음수 4개 → -8"}},
  {o:{q:"(+8)+(-5)+(-8)",a:"-5",e:"0-5=-5"},s:{q:"(+9)+(-4)+(-9)",a:"-4",e:"0-4=-4"}},
  {o:{q:"(-3)+(+10)+(-4)",a:"3",e:"-7+10=3"},s:{q:"(-2)+(+8)+(-3)",a:"3",e:"-5+8=3"}},
  {o:{q:"(-100)+(+60)+(+40)",a:"0",e:"100-100=0"},s:{q:"(-50)+(+30)+(+20)",a:"0",e:"50-50=0"}},
]},
"정수의 뺄셈":{qs:[
  {o:{q:"(-3)-(+5)",a:"-8",e:"(-3)+(-5)=-8"},s:{q:"(-4)-(+6)",a:"-10",e:"(-4)+(-6)=-10"}},
  {o:{q:"(+7)-(-4)",a:"11",e:"(+7)+(+4)=11"},s:{q:"(+9)-(-3)",a:"12",e:"(+9)+(+3)=12"}},
  {o:{q:"(-6)-(-9)",a:"3",e:"(-6)+(+9)=3"},s:{q:"(-5)-(-8)",a:"3",e:"(-5)+(+8)=3"}},
  {o:{q:"(+2)-(+8)",a:"-6",e:"(+2)+(-8)=-6"},s:{q:"(+3)-(+9)",a:"-6",e:"(+3)+(-9)=-6"}},
  {o:{q:"(-5)-(-5)",a:"0",e:"(-5)+(+5)=0"},s:{q:"(-7)-(-7)",a:"0",e:"(-7)+(+7)=0"}},
  {o:{q:"(-4)-(+7)",a:"-11",e:"(-4)+(-7)=-11"},s:{q:"(-5)-(+8)",a:"-13",e:"(-5)+(-8)=-13"}},
  {o:{q:"(+3)-(-3)",a:"6",e:"(+3)+(+3)=6"},s:{q:"(+4)-(-4)",a:"8",e:"(+4)+(+4)=8"}},
  {o:{q:"(-9)-(+1)",a:"-10",e:"(-9)+(-1)=-10"},s:{q:"(-8)-(+2)",a:"-10",e:"(-8)+(-2)=-10"}},
  {o:{q:"(+5)-(+12)",a:"-7",e:"(+5)+(-12)=-7"},s:{q:"(+6)-(+13)",a:"-7",e:"(+6)+(-13)=-7"}},
  {o:{q:"(-8)-(-3)",a:"-5",e:"(-8)+(+3)=-5"},s:{q:"(-9)-(-4)",a:"-5",e:"(-9)+(+4)=-5"}},
  {o:{q:"(-2)-(+6)",a:"-8",e:"(-2)+(-6)=-8"},s:{q:"(-3)-(+5)",a:"-8",e:"(-3)+(-5)=-8"}},
  {o:{q:"(+10)-(-3)",a:"13",e:"(+10)+(+3)=13"},s:{q:"(+11)-(-2)",a:"13",e:"(+11)+(+2)=13"}},
  {o:{q:"(-7)-(-4)",a:"-3",e:"(-7)+(+4)=-3"},s:{q:"(-8)-(-5)",a:"-3",e:"(-8)+(+5)=-3"}},
  {o:{q:"(+4)-(+11)",a:"-7",e:"(+4)+(-11)=-7"},s:{q:"(+3)-(+10)",a:"-7",e:"(+3)+(-10)=-7"}},
  {o:{q:"(-3)-(-3)",a:"0",e:"(-3)+(+3)=0"},s:{q:"(-6)-(-6)",a:"0",e:"(-6)+(+6)=0"}},
  {o:{q:"(+6)-(-2)",a:"8",e:"(+6)+(+2)=8"},s:{q:"(+5)-(-3)",a:"8",e:"(+5)+(+3)=8"}},
  {o:{q:"(-5)-(+5)",a:"-10",e:"(-5)+(-5)=-10"},s:{q:"(-6)-(+6)",a:"-12",e:"(-6)+(-6)=-12"}},
  {o:{q:"(+1)-(-9)",a:"10",e:"(+1)+(+9)=10"},s:{q:"(+2)-(-8)",a:"10",e:"(+2)+(+8)=10"}},
  {o:{q:"(-4)-(-6)",a:"2",e:"(-4)+(+6)=2"},s:{q:"(-3)-(-5)",a:"2",e:"(-3)+(+5)=2"}},
  {o:{q:"(+8)-(+15)",a:"-7",e:"(+8)+(-15)=-7"},s:{q:"(+9)-(+16)",a:"-7",e:"(+9)+(-16)=-7"}},
]},
"일차방정식":{qs:[
  {o:{q:"2x+3=7",a:"x=2",e:"2x=4, x=2"},s:{q:"3x+2=8",a:"x=2",e:"3x=6, x=2"}},
  {o:{q:"3x-5=1",a:"x=2",e:"3x=6, x=2"},s:{q:"4x-3=5",a:"x=2",e:"4x=8, x=2"}},
  {o:{q:"-2x+6=0",a:"x=3",e:"-2x=-6, x=3"},s:{q:"-3x+9=0",a:"x=3",e:"-3x=-9, x=3"}},
  {o:{q:"4x+1=-7",a:"x=-2",e:"4x=-8, x=-2"},s:{q:"5x+2=-8",a:"x=-2",e:"5x=-10, x=-2"}},
  {o:{q:"5-3x=14",a:"x=-3",e:"-3x=9, x=-3"},s:{q:"7-2x=13",a:"x=-3",e:"-2x=6, x=-3"}},
  {o:{q:"x+7=3",a:"x=-4",e:"x=3-7=-4"},s:{q:"x+9=5",a:"x=-4",e:"x=5-9=-4"}},
  {o:{q:"2x-1=-5",a:"x=-2",e:"2x=-4, x=-2"},s:{q:"3x-2=-8",a:"x=-2",e:"3x=-6, x=-2"}},
  {o:{q:"3x+9=0",a:"x=-3",e:"3x=-9, x=-3"},s:{q:"2x+8=0",a:"x=-4",e:"2x=-8, x=-4"}},
  {o:{q:"5x=20",a:"x=4",e:"x=4"},s:{q:"6x=24",a:"x=4",e:"x=4"}},
  {o:{q:"-4x=12",a:"x=-3",e:"x=-3"},s:{q:"-3x=9",a:"x=-3",e:"x=-3"}},
  {o:{q:"2x+5=x+8",a:"x=3",e:"x=3"},s:{q:"3x+4=x+8",a:"x=2",e:"2x=4, x=2"}},
  {o:{q:"3x-2=x+6",a:"x=4",e:"2x=8, x=4"},s:{q:"4x-3=x+9",a:"x=4",e:"3x=12, x=4"}},
  {o:{q:"4x+3=2x-1",a:"x=-2",e:"2x=-4, x=-2"},s:{q:"5x+4=3x-2",a:"x=-3",e:"2x=-6, x=-3"}},
  {o:{q:"x÷2+1=4",a:"x=6",e:"x/2=3, x=6"},s:{q:"x÷3+1=4",a:"x=9",e:"x/3=3, x=9"}},
  {o:{q:"x÷3-2=-1",a:"x=3",e:"x/3=1, x=3"},s:{q:"x÷2-3=-1",a:"x=4",e:"x/2=2, x=4"}},
  {o:{q:"2(x+1)=8",a:"x=3",e:"2x+2=8, x=3"},s:{q:"3(x+1)=9",a:"x=2",e:"3x+3=9, x=2"}},
  {o:{q:"3(x-2)=6",a:"x=4",e:"3x-6=6, x=4"},s:{q:"2(x-3)=4",a:"x=5",e:"2x-6=4, x=5"}},
  {o:{q:"-2(x+3)=4",a:"x=-5",e:"-2x-6=4, x=-5"},s:{q:"-3(x+2)=6",a:"x=-4",e:"-3x-6=6, x=-4"}},
  {o:{q:"x+2x=9",a:"x=3",e:"3x=9, x=3"},s:{q:"x+3x=12",a:"x=3",e:"4x=12, x=3"}},
  {o:{q:"4x-x+2=11",a:"x=3",e:"3x=9, x=3"},s:{q:"5x-2x+1=10",a:"x=3",e:"3x=9, x=3"}},
]},
"정비례":{qs:[
  {o:{q:"y=3x, x=4일 때 y",a:"12",e:"3×4=12"},s:{q:"y=4x, x=3일 때 y",a:"12",e:"4×3=12"}},
  {o:{q:"y=-2x, x=3일 때 y",a:"-6",e:"-2×3=-6"},s:{q:"y=-3x, x=2일 때 y",a:"-6",e:"-3×2=-6"}},
  {o:{q:"y=-2x, x=-3일 때 y",a:"6",e:"-2×(-3)=6"},s:{q:"y=-4x, x=-2일 때 y",a:"8",e:"-4×(-2)=8"}},
  {o:{q:"y=ax, x=2→y=8. a의 값",a:"4",e:"8=2a → a=4"},s:{q:"y=ax, x=3→y=12. a의 값",a:"4",e:"12=3a → a=4"}},
  {o:{q:"y=ax, x=-1→y=3. a의 값",a:"-3",e:"3=-a → a=-3"},s:{q:"y=ax, x=-2→y=6. a의 값",a:"-3",e:"6=-2a → a=-3"}},
  {o:{q:"y=2x, y=10일 때 x",a:"5",e:"10=2x → x=5"},s:{q:"y=5x, y=20일 때 x",a:"4",e:"20=5x → x=4"}},
  {o:{q:"y=-3x, y=12일 때 x",a:"-4",e:"12=-3x → x=-4"},s:{q:"y=-2x, y=8일 때 x",a:"-4",e:"8=-2x → x=-4"}},
  {o:{q:"y=x/2, x=6일 때 y",a:"3",e:"6/2=3"},s:{q:"y=x/3, x=9일 때 y",a:"3",e:"9/3=3"}},
  {o:{q:"y=2x가 (3,?)을 지날 때",a:"(3,6)",e:"y=6"},s:{q:"y=3x가 (2,?)을 지날 때",a:"(2,6)",e:"y=6"}},
  {o:{q:"y=-x가 (-4,?)을 지날 때",a:"(-4,4)",e:"y=4"},s:{q:"y=-2x가 (-2,?)을 지날 때",a:"(-2,4)",e:"y=4"}},
  {o:{q:"y=5x, x 1 증가 시 y 변화량",a:"5",e:"비례상수=5"},s:{q:"y=-5x, x 1 증가 시 y 변화량",a:"-5",e:"비례상수=-5"}},
  {o:{q:"정비례, x=3→y=6. x=5일 때 y",a:"10",e:"a=2, y=10"},s:{q:"정비례, x=2→y=6. x=4일 때 y",a:"12",e:"a=3, y=12"}},
  {o:{q:"y=(3/2)x, x=4일 때 y",a:"6",e:"(3/2)×4=6"},s:{q:"y=(2/3)x, x=6일 때 y",a:"4",e:"(2/3)×6=4"}},
  {o:{q:"y=ax가 (2,8)을 지날 때 a",a:"4",e:"8=2a → a=4"},s:{q:"y=ax가 (3,9)를 지날 때 a",a:"3",e:"9=3a → a=3"}},
  {o:{q:"y=ax가 (-2,-6)을 지날 때 a",a:"3",e:"-6=-2a → a=3"},s:{q:"y=ax가 (-3,-9)를 지날 때 a",a:"3",e:"-9=-3a → a=3"}},
  {o:{q:"y=4x, x=3과 x=-1일 때 y의 합",a:"8",e:"12-4=8"},s:{q:"y=3x, x=4와 x=-2일 때 y의 합",a:"6",e:"12-6=6"}},
  {o:{q:"x:y=1:3이면 a의 값",a:"3",e:"y/x=3"},s:{q:"x:y=1:5이면 a의 값",a:"5",e:"y/x=5"}},
  {o:{q:"y=(-1/2)x, x=8일 때 y",a:"-4",e:"(-1/2)×8=-4"},s:{q:"y=(-1/3)x, x=9일 때 y",a:"-3",e:"(-1/3)×9=-3"}},
  {o:{q:"y=ax, (2,-4). x=-3일 때 y",a:"6",e:"a=-2, y=6"},s:{q:"y=ax, (3,-6). x=-2일 때 y",a:"4",e:"a=-2, y=4"}},
  {o:{q:"y=2x, x가 2배→y의 변화",a:"2배가 된다",e:"비례"},s:{q:"y=3x, x가 3배→y의 변화",a:"3배가 된다",e:"비례"}},
]},
"반비례":{qs:[
  {o:{q:"y=12/x, x=4일 때 y",a:"3",e:"12÷4=3"},s:{q:"y=12/x, x=6일 때 y",a:"2",e:"12÷6=2"}},
  {o:{q:"y=-6/x, x=2일 때 y",a:"-3",e:"-6÷2=-3"},s:{q:"y=-8/x, x=4일 때 y",a:"-2",e:"-8÷4=-2"}},
  {o:{q:"y=12/x, x=-3일 때 y",a:"-4",e:"12÷(-3)=-4"},s:{q:"y=12/x, x=-4일 때 y",a:"-3",e:"12÷(-4)=-3"}},
  {o:{q:"y=-6/x, x=-2일 때 y",a:"3",e:"-6÷(-2)=3"},s:{q:"y=-8/x, x=-2일 때 y",a:"4",e:"-8÷(-2)=4"}},
  {o:{q:"y=a/x, x=3→y=4. a의 값",a:"12",e:"4=a/3 → a=12"},s:{q:"y=a/x, x=2→y=5. a의 값",a:"10",e:"5=a/2 → a=10"}},
  {o:{q:"y=a/x, x=-2→y=3. a의 값",a:"-6",e:"3=a/(-2) → a=-6"},s:{q:"y=a/x, x=-3→y=2. a의 값",a:"-6",e:"2=a/(-3) → a=-6"}},
  {o:{q:"y=20/x, y=5일 때 x",a:"4",e:"5=20/x → x=4"},s:{q:"y=15/x, y=3일 때 x",a:"5",e:"3=15/x → x=5"}},
  {o:{q:"y=-12/x, y=-4일 때 x",a:"3",e:"-4=-12/x → x=3"},s:{q:"y=-15/x, y=-5일 때 x",a:"3",e:"-5=-15/x → x=3"}},
  {o:{q:"반비례, x=2→y=8. x=4일 때 y",a:"4",e:"xy=16 → y=4"},s:{q:"반비례, x=3→y=6. x=9일 때 y",a:"2",e:"xy=18 → y=2"}},
  {o:{q:"y=6/x에서 xy의 값",a:"6",e:"xy=6"},s:{q:"y=10/x에서 xy의 값",a:"10",e:"xy=10"}},
  {o:{q:"y=a/x가 (2,-3)을 지날 때 a",a:"-6",e:"-3=a/2 → a=-6"},s:{q:"y=a/x가 (3,-4)를 지날 때 a",a:"-12",e:"-4=a/3 → a=-12"}},
  {o:{q:"y=a/x가 (-2,5)를 지날 때 a",a:"-10",e:"5=a/(-2) → a=-10"},s:{q:"y=a/x가 (-3,4)를 지날 때 a",a:"-12",e:"4=a/(-3) → a=-12"}},
  {o:{q:"y=-4/x, x 2배→y의 변화",a:"1/2배가 된다",e:"반비례: x 2배→y 1/2배"},s:{q:"y=6/x, x 3배→y의 변화",a:"1/3배가 된다",e:"x 3배→y 1/3배"}},
  {o:{q:"반비례 y=a/x, x=-1→y=7. a",a:"-7",e:"7=a/(-1) → a=-7"},s:{q:"반비례 y=a/x, x=-1→y=5. a",a:"-5",e:"5=a/(-1) → a=-5"}},
  {o:{q:"y=18/x, x=2와 x=-3 때 y의 합",a:"3",e:"9+(-6)=3"},s:{q:"y=12/x, x=3와 x=-4 때 y의 합",a:"1",e:"4+(-3)=1"}},
  {o:{q:"y=a/x, x=4→y=-2. x=8일 때 y",a:"-1",e:"a=-8, y=-1"},s:{q:"y=a/x, x=6→y=-2. x=3일 때 y",a:"-4",e:"a=-12, y=-4"}},
  {o:{q:"y=k/x가 (4,3)일 때, (-6,?)의 y",a:"-2",e:"k=12, y=-2"},s:{q:"y=k/x가 (3,4)일 때, (-6,?)의 y",a:"-2",e:"k=12, y=-2"}},
  {o:{q:"y=(-10)/x, x=5일 때 y",a:"-2",e:"-10/5=-2"},s:{q:"y=(-15)/x, x=5일 때 y",a:"-3",e:"-15/5=-3"}},
  {o:{q:"xy=-8인 반비례, x=4일 때 y",a:"-2",e:"y=-8/4=-2"},s:{q:"xy=-9인 반비례, x=3일 때 y",a:"-3",e:"y=-9/3=-3"}},
  {o:{q:"y=a/x, x=2→y=-4. y=2일 때 x",a:"-4",e:"a=-8, 2=-8/x → x=-4"},s:{q:"y=a/x, x=3→y=-2. y=3일 때 x",a:"-2",e:"a=-6, 3=-6/x → x=-2"}},
]},
};
// 나머지 단원 — 정수의 덧셈 데이터 재사용 (실제 배포 시 각 단원 데이터로 교체)
["정수와 유리수의 곱셈","정수와 유리수의 나눗셈","문자의 사용과 식의 값","일차식과 수의 곱셈과 나눗셈","일차식의 덧셈과 뺄셈","기본 도형","다각형의 성질","원과 부채꼴","자료의 정리"].forEach(k=>{if(!DB[k])DB[k]={qs:DB["정수의 덧셈"].qs};});

// ── 유틸리티 ───────────────────────────────────────────────────────
function shuffle(arr,seed){const a=[...arr];let s=seed;for(let i=a.length-1;i>0;i--){s=(s*1664525+1013904223)&0xffffffff;const j=Math.abs(s)%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function getQs(unit,round){return shuffle(DB[unit].qs,round*997+unit.length*31).slice(0,20);}

// ── 스토리지 키 ────────────────────────────────────────────────────
const KEY_STUDENTS = "bk_students";   // shared: 학생 목록
const KEY_RESULTS  = "bk_results";    // shared: 전체 결과

// ── 색상 팔레트 ────────────────────────────────────────────────────
const C = {
  bg:"#0b0b10", card:"#13131e", card2:"#1a1a2a", border:"#252538",
  text:"#e8e8f5", sub:"#7878a0", accent:"#6c63ff", accentBg:"#1e1b40",
  green:"#3dd68c", red:"#f06a6a", yellow:"#f5c542", blue:"#4ea8de",
  purple:"#a78bfa", pink:"#f472b6",
};

// ════════════════════════════════════════════════════════════════════
// 메인 앱
// ════════════════════════════════════════════════════════════════════
window.BkMathApp = function BkMathApp() {
  const [mode, setMode]           = useState("splash");   // splash|login|quiz|dashboard
  const [student, setStudent]     = useState(null);       // {id, name}
  const [dashTab, setDashTab]     = useState("overview"); // overview|detail|analysis
  const [allResults, setAllResults] = useState({});
  const [loadingStorage, setLoadingStorage] = useState(false);

  // 스토리지에서 전체 결과 로드
  async function loadResults() {
    try {
      const r = await window.storage.get(KEY_RESULTS, true);
      if (r) setAllResults(JSON.parse(r.value));
    } catch { setAllResults({}); }
  }

  // 결과 저장
  async function saveResult(studentId, unit, round, data) {
    try {
      let current = {};
      try { const r = await window.storage.get(KEY_RESULTS, true); if(r) current = JSON.parse(r.value); } catch {}
      if (!current[studentId]) current[studentId] = {};
      if (!current[studentId][unit]) current[studentId][unit] = {};
      current[studentId][unit][`r${round}`] = data;
      await window.storage.set(KEY_RESULTS, JSON.stringify(current), true);
      setAllResults({...current});
    } catch(e) { console.error("저장 오류", e); }
  }

  useEffect(() => { loadResults(); }, []);

  // ── SPLASH ──────────────────────────────────────────────────────
  if (mode === "splash") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,padding:24}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:8}}>📐</div>
        <h1 style={{fontSize:30,fontWeight:900,color:C.text,letterSpacing:"-1px",margin:"0 0 6px"}}>bk 수학</h1>
        <p style={{color:C.sub,fontSize:14}}>양진중학교 기초 수학 향상 프로그램</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:320}}>
        <button onClick={()=>setMode("login")} style={{padding:"18px 0",background:C.accent,color:"#fff",border:"none",borderRadius:16,fontSize:17,fontWeight:800,cursor:"pointer",boxShadow:`0 8px 24px ${C.accent}44`}}>
          학생 로그인 →
        </button>
        <button onClick={()=>{loadResults();setMode("dashboard");}} style={{padding:"16px 0",background:C.card2,color:C.text,border:`1px solid ${C.border}`,borderRadius:16,fontSize:15,fontWeight:700,cursor:"pointer"}}>
          교사 대시보드 📊
        </button>
      </div>
    </div>
  );

  // ── LOGIN ───────────────────────────────────────────────────────
  if (mode === "login") return <LoginScreen onLogin={s=>{setStudent(s);setMode("quiz");}} onBack={()=>setMode("splash")} />;

  // ── QUIZ ────────────────────────────────────────────────────────
  if (mode === "quiz" && student) return (
    <QuizScreen
      student={student}
      allResults={allResults}
      onSave={saveResult}
      onHome={()=>setMode("splash")}
    />
  );

  // ── DASHBOARD ───────────────────────────────────────────────────
  if (mode === "dashboard") return (
    <Dashboard
      allResults={allResults}
      onRefresh={loadResults}
      onBack={()=>setMode("splash")}
      activeTab={dashTab}
      setActiveTab={setDashTab}
    />
  );

  return null;
};

// ════════════════════════════════════════════════════════════════════
// 로그인 화면
// ════════════════════════════════════════════════════════════════════
function LoginScreen({onLogin, onBack}) {
  const [id, setId]     = useState("");
  const [name, setName] = useState("");
  const [err, setErr]   = useState("");

  function handleLogin() {
    if (!id.trim()) { setErr("학번을 입력하세요"); return; }
    if (!name.trim()) { setErr("이름을 입력하세요"); return; }
    if (!/^\d+$/.test(id.trim())) { setErr("학번은 숫자만 입력하세요"); return; }
    onLogin({ id: id.trim(), name: name.trim() });
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:360}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:20,marginBottom:24}}>←</button>
        <h2 style={{fontSize:24,fontWeight:800,color:C.text,margin:"0 0 6px"}}>로그인</h2>
        <p style={{color:C.sub,fontSize:13,margin:"0 0 28px"}}>학번과 이름을 입력하세요</p>

        <label style={{fontSize:12,fontWeight:700,color:C.sub,letterSpacing:"1px",display:"block",marginBottom:6}}>학번</label>
        <input
          value={id} onChange={e=>setId(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="예) 10101"
          style={{width:"100%",padding:"14px 16px",fontSize:18,fontWeight:700,background:C.card2,border:`2px solid ${C.border}`,borderRadius:12,color:C.text,outline:"none",marginBottom:14,boxSizing:"border-box"}}
        />

        <label style={{fontSize:12,fontWeight:700,color:C.sub,letterSpacing:"1px",display:"block",marginBottom:6}}>이름</label>
        <input
          value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="예) 홍길동"
          style={{width:"100%",padding:"14px 16px",fontSize:18,fontWeight:700,background:C.card2,border:`2px solid ${C.border}`,borderRadius:12,color:C.text,outline:"none",marginBottom:20,boxSizing:"border-box"}}
        />

        {err && <p style={{color:C.red,fontSize:13,marginBottom:12}}>{err}</p>}

        <button onClick={handleLogin} style={{width:"100%",padding:"17px 0",background:C.accent,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:800,cursor:"pointer"}}>
          시작하기 →
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 퀴즈 화면
// ════════════════════════════════════════════════════════════════════
function QuizScreen({student, allResults, onSave, onHome}) {
  const [activeUnit, setActiveUnit] = useState(null);
  const [activeRound, setActiveRound] = useState(0);
  const [sessionQs, setSessionQs]   = useState([]);
  const [cur, setCur]               = useState(0);
  const [inp, setInp]               = useState("");
  const [confirmed, setConfirmed]   = useState(false);
  const [showExp, setShowExp]       = useState(false);
  const [answers, setAnswers]       = useState([]);
  const [tPreset, setTPreset]       = useState(60);
  const [tLeft, setTLeft]           = useState(60);
  const [tRunning, setTRunning]     = useState(false);
  const [screen, setScreen]         = useState("unitsel"); // unitsel|quiz|result
  const [sessionResult, setSessionResult] = useState(null);
  const [saving, setSaving]         = useState(false);
  const timerRef = useRef(null);

  const myResults = allResults[student.id] || {};

  function startSession(unit, round) {
    clearTimer();
    const qs = getQs(unit, round);
    setActiveUnit(unit); setActiveRound(round);
    setSessionQs(qs); setCur(0); setInp(""); setConfirmed(false);
    setShowExp(false); setAnswers(Array(20).fill(null));
    setTLeft(tPreset); setScreen("quiz");
    setTimeout(() => { setTLeft(tPreset); setTRunning(true); }, 80);
  }

  useEffect(() => {
    if (tRunning) {
      timerRef.current = setInterval(() => {
        setTLeft(t => {
          if (t <= 1) { clearTimer(); if (!confirmed) handleConfirm(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [tRunning]);

  function clearTimer() { clearInterval(timerRef.current); setTRunning(false); }

  function handleConfirm(expired = false) {
    clearTimer();
    const val = expired ? "" : inp.trim();
    const q = sessionQs[cur];
    const ok = val.replace(/\s/g,"").toLowerCase() === q.o.a.replace(/\s/g,"").toLowerCase();
    const na = [...answers];
    na[cur] = { inp: val, ok, expired };
    setAnswers(na);
    setConfirmed(true);
  }

  function handleNext() {
    if (cur < sessionQs.length - 1) {
      setCur(c => c + 1); setInp(""); setConfirmed(false); setShowExp(false);
      setTLeft(tPreset); setTRunning(true);
    } else {
      finishSession();
    }
  }

  async function finishSession() {
    clearTimer();
    const correct = answers.filter(a => a?.ok).length;
    const wrong = sessionQs.map((q,i) => answers[i]?.ok === false ? {q, inp: answers[i].inp} : null).filter(Boolean);
    const result = { correct, total: 20, wrong, date: new Date().toLocaleDateString("ko-KR"), studentId: student.id, studentName: student.name };
    setSessionResult(result);
    setSaving(true);
    await onSave(student.id, activeUnit, activeRound, result);
    setSaving(false);
    setScreen("result");
  }

  const q = sessionQs[cur];
  const tc = tLeft > 20 ? C.green : tLeft > 10 ? C.yellow : C.red;

  // ── 단원 선택 ──────────────────────────────────────────────────
  if (screen === "unitsel") return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif",paddingBottom:60}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0 12px",borderBottom:`1px solid ${C.border}`}}>
          <div>
            <span style={{fontSize:11,fontWeight:700,color:C.accent,background:C.accentBg,padding:"3px 10px",borderRadius:20,letterSpacing:"1px"}}>bk 수학</span>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:13,fontWeight:700,color:C.text,margin:0}}>{student.name}</p>
            <p style={{fontSize:11,color:C.sub,margin:0}}>{student.id}</p>
          </div>
        </div>

        <div style={{padding:"20px 0 10px"}}>
          <p style={{fontSize:11,fontWeight:700,color:C.sub,letterSpacing:"1px",marginBottom:6}}>타이머 설정</p>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            {[60,90,120,180].map(s=>(
              <button key={s} onClick={()=>setTPreset(s)} style={{flex:1,padding:"8px 0",borderRadius:9,border:`1.5px solid ${tPreset===s?C.accent:C.border}`,background:tPreset===s?C.accentBg:"none",color:tPreset===s?C.accent:C.sub,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                {s<120?`${s}초`:`${s/60}분`}
              </button>
            ))}
          </div>

          <p style={{fontSize:11,fontWeight:700,color:C.sub,letterSpacing:"1px",marginBottom:8}}>1학기</p>
          {UNITS_1.map(u => <UnitCard key={u} unit={u} myResults={myResults[u]||{}} onStart={startSession} />)}
          <p style={{fontSize:11,fontWeight:700,color:C.sub,letterSpacing:"1px",margin:"14px 0 8px"}}>2학기</p>
          {UNITS_2.map(u => <UnitCard key={u} unit={u} myResults={myResults[u]||{}} onStart={startSession} />)}
        </div>

        <button onClick={onHome} style={{width:"100%",padding:"14px 0",background:"none",border:`1px solid ${C.border}`,color:C.sub,borderRadius:12,fontSize:14,cursor:"pointer",marginTop:8}}>
          홈으로
        </button>
      </div>
    </div>
  );

  // ── 퀴즈 ──────────────────────────────────────────────────────
  if (screen === "quiz" && q) {
    const ans = answers[cur];
    const isOk = confirmed && ans?.ok;
    return (
      <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif",paddingBottom:40}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"0 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0 10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>{clearTimer();setScreen("unitsel");}} style={{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:20}}>←</button>
              <span style={{fontSize:12,color:C.sub}}>{cur+1}/20</span>
            </div>
            <span style={{fontSize:22,fontWeight:800,color:tc,fontVariantNumeric:"tabular-nums"}}>
              {String(Math.floor(tLeft/60)).padStart(2,"0")}:{String(tLeft%60).padStart(2,"0")}
            </span>
            <span style={{fontSize:11,color:C.sub,textAlign:"right"}}>{activeUnit}<br/>{activeRound+1}회차</span>
          </div>
          <div style={{height:4,background:C.border,borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(tLeft/tPreset)*100}%`,background:tc,borderRadius:99,transition:"width 1s linear"}}/>
          </div>
          <div style={{display:"flex",gap:4,margin:"12px 0"}}>
            {sessionQs.map((_,i)=>{const a=answers[i];const bg=i===cur?C.accent:!a?C.border:a.ok?C.green:C.red;return <div key={i} style={{flex:1,height:5,borderRadius:99,background:bg}}/>;} )}
          </div>
          <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px 20px",marginBottom:14}}>
            <p style={{fontSize:11,color:C.sub,fontWeight:700,margin:"0 0 8px"}}>Q{cur+1}</p>
            <p style={{fontSize:22,fontWeight:800,lineHeight:1.4,margin:0}}>{q.o.q}</p>
          </div>
          <p style={{fontSize:11,color:C.sub,fontWeight:700,letterSpacing:"1px",marginBottom:5}}>답 입력</p>
          <input
            value={inp} onChange={e=>!confirmed&&setInp(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!confirmed&&inp.trim()&&handleConfirm()}
            placeholder="답을 입력하세요"
            readOnly={confirmed}
            style={{width:"100%",boxSizing:"border-box",padding:"14px 16px",fontSize:20,fontWeight:800,background:C.card2,border:`2px solid ${confirmed?(isOk?C.green:C.red):C.border}`,borderRadius:13,color:C.text,outline:"none",marginBottom:10}}
          />
          {confirmed && (
            <div style={{background:isOk?`${C.green}18`:`${C.red}18`,border:`1px solid ${isOk?C.green:C.red}`,borderRadius:13,padding:"13px 15px",marginBottom:10}}>
              <p style={{fontWeight:800,color:isOk?C.green:C.red,fontSize:15,margin:"0 0 4px"}}>
                {isOk?"✓ 정답!":ans?.expired?"⏰ 시간 초과":"✗ 오답"}
                {!isOk&&<span style={{fontWeight:400,fontSize:12,color:C.text}}> 정답: {q.o.a}</span>}
              </p>
              {showExp&&<p style={{fontSize:12,color:C.text,lineHeight:1.6,margin:"0 0 4px"}}>{q.o.e}</p>}
              <button onClick={()=>setShowExp(v=>!v)} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:0}}>
                {showExp?"풀이 숨기기":"풀이 보기 ↓"}
              </button>
              {!isOk&&(
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                  <p style={{fontSize:11,color:C.purple,fontWeight:700,margin:"0 0 4px"}}>유사 문항</p>
                  <p style={{fontSize:14,fontWeight:700,margin:"0 0 3px"}}>{q.s.q}</p>
                  <p style={{fontSize:11,color:C.sub}}>정답: {q.s.a} | {q.s.e}</p>
                </div>
              )}
            </div>
          )}
          {!confirmed
            ? <button onClick={()=>inp.trim()&&handleConfirm()} style={{width:"100%",padding:"16px 0",background:inp.trim()?C.accent:C.border,color:inp.trim()?"#fff":C.sub,border:"none",borderRadius:13,fontSize:16,fontWeight:800,cursor:inp.trim()?"pointer":"default"}}>확인</button>
            : <button onClick={handleNext} style={{width:"100%",padding:"16px 0",background:C.accent,color:"#fff",border:"none",borderRadius:13,fontSize:16,fontWeight:800,cursor:"pointer"}}>
                {cur<19?"다음 문제 →":"결과 제출 →"}
              </button>
          }
        </div>
      </div>
    );
  }

  // ── 결과 ──────────────────────────────────────────────────────
  if (screen === "result" && sessionResult) {
    const r = sessionResult;
    const pct = Math.round(r.correct/20*100);
    const passed = pct >= 70;
    return (
      <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif",paddingBottom:60}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"0 14px"}}>
          <div style={{textAlign:"center",padding:"32px 0 20px"}}>
            <div style={{width:120,height:120,borderRadius:"50%",margin:"0 auto 14px",background:`conic-gradient(${passed?C.green:C.red} ${pct*3.6}deg,${C.border} 0deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:94,height:94,borderRadius:"50%",background:C.card,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:26,fontWeight:900,color:passed?C.green:C.red}}>{pct}%</span>
                <span style={{fontSize:11,color:C.sub}}>{r.correct}/20</span>
              </div>
            </div>
            <h2 style={{fontSize:20,fontWeight:800,margin:"0 0 4px"}}>{passed?"🎉 목표 달성!":"💪 재도전 필요"}</h2>
            <p style={{color:C.sub,fontSize:12}}>{activeUnit} · {activeRound+1}회차 · {r.date}</p>
            {saving&&<p style={{color:C.yellow,fontSize:12,marginTop:6}}>결과 저장 중...</p>}
            {!saving&&<p style={{color:C.green,fontSize:12,marginTop:6}}>✓ 선생님께 결과가 전송되었습니다</p>}
          </div>
          {r.wrong?.length>0&&(
            <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",marginBottom:14}}>
              <p style={{fontSize:11,color:C.sub,fontWeight:700,letterSpacing:"1px",marginBottom:10}}>오답 ({r.wrong.length}개)</p>
              {r.wrong.map(({q,inp},i)=>(
                <div key={i} style={{borderBottom:`1px solid ${C.border}`,padding:"9px 0"}}>
                  <p style={{fontSize:14,fontWeight:700,margin:"0 0 3px"}}>{q.o.q}</p>
                  <p style={{fontSize:12,color:C.red,margin:"0 0 2px"}}>내 답: {inp||"(미입력)"}</p>
                  <p style={{fontSize:12,color:C.green,margin:"0 0 2px"}}>정답: {q.o.a}</p>
                  <div style={{background:C.accentBg,borderRadius:8,padding:"7px 10px",marginTop:5}}>
                    <p style={{fontSize:11,color:C.purple,fontWeight:700,margin:"0 0 3px"}}>유사 문항</p>
                    <p style={{fontSize:13,fontWeight:700,margin:"0 0 2px"}}>{q.s.q}</p>
                    <p style={{fontSize:11,color:C.sub,margin:0}}>정답: {q.s.a}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:10}}>
            {activeRound<2&&<button onClick={()=>startSession(activeUnit,activeRound+1)} style={{flex:1,padding:"14px 0",background:C.accent,color:"#fff",border:"none",borderRadius:13,fontSize:14,fontWeight:800,cursor:"pointer"}}>{activeRound+2}회차 →</button>}
            <button onClick={()=>setScreen("unitsel")} style={{flex:1,padding:"14px 0",background:"none",border:`1.5px solid ${C.accent}`,color:C.accent,borderRadius:13,fontSize:14,fontWeight:700,cursor:"pointer"}}>단원 목록</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function UnitCard({unit, myResults, onStart}) {
  const rounds = [0,1,2].map(i => myResults[`r${i}`] || null);
  const best = rounds.filter(Boolean).map(r=>Math.round(r.correct/r.total*100));
  const bestVal = best.length ? Math.max(...best) : null;
  return (
    <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:13,padding:"14px 16px",marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p style={{fontSize:14,fontWeight:700,margin:0}}>{unit}</p>
        {bestVal!==null&&<span style={{fontSize:14,fontWeight:900,color:bestVal>=70?C.green:C.red}}>{bestVal}%</span>}
      </div>
      <div style={{display:"flex",gap:7}}>
        {[0,1,2].map(i=>{
          const r=rounds[i];
          const pct=r?Math.round(r.correct/r.total*100):null;
          const canStart=i===0||rounds[i-1];
          const bc=r?(pct>=70?C.green:C.red):canStart?C.accent:C.border;
          const bg=r?(pct>=70?`${C.green}18`:`${C.red}18`):canStart?C.accentBg:"none";
          const tc=r?(pct>=70?C.green:C.red):canStart?C.accent:C.sub;
          return <button key={i} onClick={()=>canStart&&onStart(unit,i)} style={{flex:1,padding:"9px 0",borderRadius:9,border:`1.5px solid ${bc}`,background:bg,color:tc,fontWeight:700,fontSize:12,cursor:canStart?"pointer":"default"}}>
            {r?`${pct}%`:canStart?`${i+1}회차`:"🔒"}
          </button>;
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 교사 대시보드
// ════════════════════════════════════════════════════════════════════
function Dashboard({allResults, onRefresh, onBack, activeTab, setActiveTab}) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [analysisResult, setAnalysisResult] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // 학생 목록 추출
  const students = Object.keys(allResults).map(id => {
    const units = allResults[id];
    const firstName = Object.values(units)[0];
    const name = firstName ? (Object.values(firstName)[0]?.studentName || id) : id;
    return { id, name };
  }).sort((a,b)=>a.id.localeCompare(b.id));

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  // AI 분석 (3회차 완료 학생)
  async function analyzeStudent(student) {
    setAnalyzing(true);
    const unitData = allResults[student.id] || {};
    const summary = ALL_UNITS.map(u=>{
      const rounds = [0,1,2].map(i=>{const r=unitData[u]?.[`r${i}`];return r?Math.round(r.correct/r.total*100):null;}).filter(v=>v!==null);
      return `${u}: ${rounds.join("% → ")}%`;
    }).join(", ");

    const wrongSummary = ALL_UNITS.map(u=>{
      const rounds = [0,1,2].map(i=>unitData[u]?.[`r${i}`]).filter(Boolean);
      const wrongQs = rounds.flatMap(r=>r.wrong||[]).map(w=>w.q?.o?.q).filter(Boolean);
      const freq = {};
      wrongQs.forEach(q=>{freq[q]=(freq[q]||0)+1;});
      const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([q,n])=>`"${q}"(${n}회)`);
      return top.length ? `${u} 반복 오답: ${top.join(", ")}` : null;
    }).filter(Boolean).join("; ");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:`중학교 1학년 수학 기초학력 부족 학생 "${student.name}"(학번:${student.id})의 소단원별 3회차 정답률 데이터와 반복 오답 패턴을 분석하여 맞춤형 학습 전략을 제시해주세요.

[3회차 정답률 추이]
${summary}

[반복 오답 패턴]
${wrongSummary||"특이 패턴 없음"}

다음 형식으로 간결하게 분석해주세요 (각 항목 2-3문장):
1. 전체 학습 추이 평가
2. 핵심 취약 단원 (최대 3개)
3. 반복 오답 유형 분석
4. 다음 단계 학습 전략 (구체적 행동 지침)
5. 교사 코멘트용 한 줄 요약`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text || "분석 실패";
      setAnalysisResult(prev=>({...prev,[student.id]:text}));
    } catch(e) {
      setAnalysisResult(prev=>({...prev,[student.id]:"분석 중 오류가 발생했습니다."}));
    }
    setAnalyzing(false);
  }

  function getUnitPct(studentId, unit) {
    const rounds = allResults[studentId]?.[unit];
    if (!rounds) return null;
    const vals = [0,1,2].map(i=>rounds[`r${i}`]).filter(Boolean).map(r=>Math.round(r.correct/r.total*100));
    return vals.length ? Math.max(...vals) : null;
  }

  function pctColor(v) { return v===null?"#2a2a3a":v>=80?C.green:v>=60?C.yellow:C.red; }
  function pctBg(v)    { return v===null?"#13131e":v>=80?`${C.green}18`:v>=60?`${C.yellow}18`:`${C.red}18`; }

  // 탭 스타일
  const tabStyle = (t) => ({
    flex:1, padding:"10px 0", border:"none",
    borderBottom:`2px solid ${activeTab===t?C.accent:"transparent"}`,
    background:"none", color:activeTab===t?C.accent:C.sub,
    fontSize:13, fontWeight:700, cursor:"pointer",
  });

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif",paddingBottom:60}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"0 14px"}}>
        {/* 헤더 */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0 0"}}>
          <div>
            <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:20,marginRight:10}}>←</button>
            <span style={{fontSize:17,fontWeight:800}}>교사 대시보드</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:12,color:C.sub}}>학생 {students.length}명</span>
            <button onClick={handleRefresh} style={{padding:"7px 14px",background:C.accentBg,border:`1px solid ${C.accent}`,color:C.accent,borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {refreshing?"로딩...":"새로고침 ↻"}
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,margin:"14px 0 0"}}>
          <button style={tabStyle("overview")} onClick={()=>setActiveTab("overview")}>📊 전체 현황</button>
          <button style={tabStyle("detail")} onClick={()=>setActiveTab("detail")}>👤 학생별 세부</button>
          <button style={tabStyle("analysis")} onClick={()=>setActiveTab("analysis")}>🧠 학습 분석</button>
        </div>

        {/* ── 탭 1: 전체 현황 ────────────────────────────────── */}
        {activeTab==="overview" && (
          <div style={{paddingTop:16,overflowX:"auto"}}>
            {students.length===0
              ? <EmptyState msg="아직 응시한 학생이 없습니다" />
              : <>
                <p style={{fontSize:11,color:C.sub,fontWeight:700,letterSpacing:"1px",marginBottom:12}}>소단원별 최고 정답률 현황 (색상: 🟢80%↑ 🟡60%↑ 🔴60%미만)</p>
                <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",width:"100%",minWidth:700,fontSize:12}}>
                    <thead>
                      <tr>
                        <th style={{padding:"8px 10px",textAlign:"left",color:C.sub,fontWeight:700,borderBottom:`1px solid ${C.border}`,position:"sticky",left:0,background:C.bg,minWidth:80}}>학번</th>
                        <th style={{padding:"8px 6px",textAlign:"left",color:C.sub,fontWeight:700,borderBottom:`1px solid ${C.border}`,minWidth:60}}>이름</th>
                        {ALL_UNITS.map(u=>(
                          <th key={u} style={{padding:"6px 4px",textAlign:"center",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.border}`,minWidth:52,fontSize:10,whiteSpace:"nowrap",overflow:"hidden",maxWidth:56,textOverflow:"ellipsis"}} title={u}>
                            {u.length>5?u.slice(0,5)+"…":u}
                          </th>
                        ))}
                        <th style={{padding:"8px 6px",textAlign:"center",color:C.sub,fontWeight:700,borderBottom:`1px solid ${C.border}`,minWidth:52}}>평균</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s=>{
                        const pcts = ALL_UNITS.map(u=>getUnitPct(s.id,u));
                        const valid = pcts.filter(v=>v!==null);
                        const avg = valid.length ? Math.round(valid.reduce((a,b)=>a+b,0)/valid.length) : null;
                        return (
                          <tr key={s.id} style={{cursor:"pointer"}} onClick={()=>{setSelectedStudent(s);setActiveTab("detail");}}>
                            <td style={{padding:"8px 10px",color:C.sub,fontSize:12,position:"sticky",left:0,background:C.bg,borderBottom:`1px solid ${C.border}`}}>{s.id}</td>
                            <td style={{padding:"8px 6px",fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{s.name}</td>
                            {pcts.map((v,i)=>(
                              <td key={i} style={{padding:"6px 4px",textAlign:"center",borderBottom:`1px solid ${C.border}`}}>
                                {v!==null
                                  ? <span style={{display:"inline-block",padding:"3px 5px",borderRadius:6,background:pctBg(v),color:pctColor(v),fontWeight:700,fontSize:11}}>{v}%</span>
                                  : <span style={{color:C.border,fontSize:14}}>·</span>
                                }
                              </td>
                            ))}
                            <td style={{padding:"6px 8px",textAlign:"center",borderBottom:`1px solid ${C.border}`}}>
                              {avg!==null
                                ? <span style={{fontWeight:900,color:pctColor(avg),fontSize:13}}>{avg}%</span>
                                : <span style={{color:C.border}}>-</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 소단원별 평균 막대 */}
                <div style={{marginTop:24}}>
                  <p style={{fontSize:11,color:C.sub,fontWeight:700,letterSpacing:"1px",marginBottom:12}}>소단원별 반 평균</p>
                  {ALL_UNITS.map(u=>{
                    const vals = students.map(s=>getUnitPct(s.id,u)).filter(v=>v!==null);
                    const avg = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : null;
                    const cnt = vals.length;
                    return (
                      <div key={u} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:13,fontWeight:600}}>{u}</span>
                          <span style={{fontSize:12,color:C.sub}}>{cnt}명 응시 {avg!==null?`· 평균 ${avg}%`:""}</span>
                        </div>
                        <div style={{height:8,background:C.card2,borderRadius:99}}>
                          {avg!==null&&<div style={{height:"100%",width:`${avg}%`,background:pctColor(avg),borderRadius:99,transition:"width 0.6s"}}/>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            }
          </div>
        )}

        {/* ── 탭 2: 학생별 세부 ───────────────────────────────── */}
        {activeTab==="detail" && (
          <div style={{paddingTop:16}}>
            {/* 학생 선택 */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              {students.length===0
                ? <EmptyState msg="아직 응시한 학생이 없습니다" />
                : students.map(s=>(
                  <button key={s.id} onClick={()=>setSelectedStudent(s)} style={{padding:"7px 14px",borderRadius:9,border:`1.5px solid ${selectedStudent?.id===s.id?C.accent:C.border}`,background:selectedStudent?.id===s.id?C.accentBg:"none",color:selectedStudent?.id===s.id?C.accent:C.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                    {s.name} <span style={{fontSize:11,color:C.sub}}>({s.id})</span>
                  </button>
                ))
              }
            </div>

            {selectedStudent && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <h3 style={{fontSize:18,fontWeight:800,margin:"0 0 2px"}}>{selectedStudent.name}</h3>
                    <p style={{fontSize:12,color:C.sub,margin:0}}>학번 {selectedStudent.id}</p>
                  </div>
                  <button onClick={()=>analyzeStudent(selectedStudent)} disabled={analyzing} style={{padding:"9px 16px",background:C.accentBg,border:`1px solid ${C.accent}`,color:C.accent,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                    {analyzing?"AI 분석 중...":"🧠 AI 분석"}
                  </button>
                </div>

                {/* AI 분석 결과 */}
                {analysisResult[selectedStudent.id]&&(
                  <div style={{background:C.accentBg,border:`1px solid ${C.accent}`,borderRadius:14,padding:"16px 18px",marginBottom:16}}>
                    <p style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:"1px",marginBottom:8}}>AI 학습 분석</p>
                    <p style={{fontSize:13,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap",margin:0}}>{analysisResult[selectedStudent.id]}</p>
                  </div>
                )}

                {/* 소단원별 3회차 상세 */}
                {ALL_UNITS.map(u=>{
                  const unitData = allResults[selectedStudent.id]?.[u];
                  if(!unitData) return (
                    <div key={u} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 16px",marginBottom:8,opacity:0.5}}>
                      <p style={{fontSize:13,fontWeight:600,margin:0,color:C.sub}}>{u} — 미응시</p>
                    </div>
                  );
                  const rounds = [0,1,2].map(i=>unitData[`r${i}`]||null);
                  const pcts = rounds.map(r=>r?Math.round(r.correct/r.total*100):null);
                  const trend = pcts.filter(v=>v!==null);
                  const improving = trend.length>=2 && trend[trend.length-1] > trend[0];

                  return (
                    <div key={u} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <p style={{fontSize:14,fontWeight:700,margin:0}}>{u}</p>
                        {trend.length>=2&&<span style={{fontSize:11,color:improving?C.green:C.red,fontWeight:700}}>{improving?"↑ 향상":"↓ 저하"}</span>}
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:10}}>
                        {pcts.map((p,i)=>(
                          <div key={i} style={{flex:1,background:pctBg(p),border:`1px solid ${p!==null?pctColor(p):C.border}`,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                            <p style={{fontSize:10,color:C.sub,margin:"0 0 2px"}}>{i+1}회차</p>
                            <p style={{fontSize:16,fontWeight:900,color:pctColor(p),margin:0}}>{p!==null?`${p}%`:"—"}</p>
                            {rounds[i]&&<p style={{fontSize:10,color:C.sub,margin:"2px 0 0"}}>{rounds[i].correct}/20</p>}
                          </div>
                        ))}
                      </div>

                      {/* 오답 상세 */}
                      {rounds.filter(Boolean).some(r=>r.wrong?.length>0)&&(
                        <details style={{marginTop:4}}>
                          <summary style={{fontSize:12,color:C.sub,cursor:"pointer",padding:"4px 0"}}>오답 목록 보기</summary>
                          {rounds.map((r,ri)=>r?.wrong?.map(({q,inp},qi)=>(
                            <div key={`${ri}-${qi}`} style={{background:C.bg,borderRadius:8,padding:"8px 10px",marginTop:6}}>
                              <p style={{fontSize:11,color:C.sub,margin:"0 0 2px"}}>{ri+1}회차</p>
                              <p style={{fontSize:13,fontWeight:700,margin:"0 0 2px"}}>{q.o.q}</p>
                              <p style={{fontSize:11,color:C.red,margin:"0 0 1px"}}>내 답: {inp||"(미입력)"}</p>
                              <p style={{fontSize:11,color:C.green,margin:0}}>정답: {q.o.a}</p>
                            </div>
                          )))}
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 탭 3: 학습 분석 ────────────────────────────────── */}
        {activeTab==="analysis" && (
          <div style={{paddingTop:16}}>
            <p style={{fontSize:11,color:C.sub,fontWeight:700,letterSpacing:"1px",marginBottom:12}}>3회차 완료 학생 AI 학습 분석</p>
            {students.length===0
              ? <EmptyState msg="아직 응시한 학생이 없습니다" />
              : students.map(s=>{
                const unitData = allResults[s.id]||{};
                const completedUnits = ALL_UNITS.filter(u=>[0,1,2].every(i=>unitData[u]?.[`r${i}`]));
                const totalUnits = Object.keys(unitData).length;
                const hasAny = totalUnits > 0;
                const allPcts = ALL_UNITS.map(u=>{const r=unitData[u];if(!r)return null;const vals=[0,1,2].map(i=>r[`r${i}`]).filter(Boolean).map(r=>Math.round(r.correct/r.total*100));return vals.length?Math.max(...vals):null;}).filter(v=>v!==null);
                const avg = allPcts.length?Math.round(allPcts.reduce((a,b)=>a+b,0)/allPcts.length):null;

                return (
                  <div key={s.id} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div>
                        <p style={{fontSize:16,fontWeight:800,margin:"0 0 2px"}}>{s.name}</p>
                        <p style={{fontSize:12,color:C.sub,margin:0}}>학번 {s.id} · {totalUnits}개 단원 응시 · {completedUnits.length}개 완료</p>
                      </div>
                      <div style={{textAlign:"right"}}>
                        {avg!==null&&<p style={{fontSize:18,fontWeight:900,color:pctColor(avg),margin:0}}>{avg}%</p>}
                        <p style={{fontSize:10,color:C.sub,margin:0}}>전체 평균</p>
                      </div>
                    </div>

                    {/* 미니 소단원 바 */}
                    <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:12}}>
                      {ALL_UNITS.map(u=>{
                        const p=getUnitPct(s.id,u);
                        return <div key={u} title={`${u}: ${p!==null?p+"%":"미응시"}`} style={{width:28,height:28,borderRadius:6,background:pctBg(p),border:`1px solid ${p!==null?pctColor(p):C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:p!==null?pctColor(p):C.border}}>
                          {p!==null?p:"·"}
                        </div>;
                      })}
                    </div>

                    {analysisResult[s.id]
                      ? <div style={{background:C.bg,borderRadius:10,padding:"12px 14px"}}>
                          <p style={{fontSize:11,color:C.accent,fontWeight:700,margin:"0 0 6px"}}>AI 분석 결과</p>
                          <p style={{fontSize:12,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap",margin:0}}>{analysisResult[s.id]}</p>
                        </div>
                      : <button onClick={()=>analyzeStudent(s)} disabled={analyzing} style={{width:"100%",padding:"10px 0",background:hasAny?C.accentBg:"none",border:`1px solid ${hasAny?C.accent:C.border}`,color:hasAny?C.accent:C.sub,borderRadius:10,fontSize:13,fontWeight:700,cursor:hasAny?"pointer":"default"}}>
                          {analyzing?"AI 분석 중...":hasAny?"🧠 AI 학습 분석 실행":"응시 데이터 없음"}
                        </button>
                    }
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({msg}) {
  return <div style={{textAlign:"center",padding:"60px 0",color:C.sub}}>
    <p style={{fontSize:40,marginBottom:12}}>📭</p>
    <p style={{fontSize:14}}>{msg}</p>
  </div>;
}

function pctColor(v) { return v===null?"#2a2a3a":v>=80?C.green:v>=60?C.yellow:C.red; }
function pctBg(v)    { return v===null?"#13131e":v>=80?`${C.green}18`:v>=60?`${C.yellow}18`:`${C.red}18`; }
