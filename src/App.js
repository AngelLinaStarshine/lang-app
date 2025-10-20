/* eslint-env es2020 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  Globe2, ShieldCheck, Lock, KeyRound, Cpu, Brain, Zap, BookOpen, Languages, Info, Moon, Sun} from "lucide-react";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return { dark, setDark };
}

function DarkToggle() {
  const { dark, setDark } = useDarkMode();
  return (
    <button
      onClick={() => setDark(!dark)}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm backdrop-blur
                 hover:bg-white/80 active:scale-[.98] transition
                 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200"
      title={dark ? "Switch to Light" : "Switch to Dark"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {dark ? "Light" : "Dark"}
    </button>
  );
}


const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lettersOnly = (s) => s.toUpperCase().replace(/[^A-Z]/g, "");

function caesarEncrypt(plain, shift) {
  const P = lettersOnly(plain);
  const k = ((shift % 26) + 26) % 26;
  return [...P].map(ch => {
    const idx = alphabet.indexOf(ch);
    return idx >= 0 ? alphabet[(idx + k) % 26] : ch;
  }).join("");
}
function caesarDecrypt(cipher, shift) {
  return caesarEncrypt(cipher, -shift);
}

function vigenereEncrypt(plain, key) {
  const P = lettersOnly(plain);
  const K = lettersOnly(key);
  if (!K) return P;
  return [...P].map((ch, i) => {
    const s = alphabet.indexOf(K[i % K.length]);
    return alphabet[(alphabet.indexOf(ch) + s) % 26];
  }).join("");
}
function vigenereDecrypt(cipher, key) {
  const C = lettersOnly(cipher);
  const K = lettersOnly(key);
  if (!K) return C;
  return [...C].map((ch, i) => {
    const s = alphabet.indexOf(K[i % K.length]);
    return alphabet[(alphabet.indexOf(ch) - s + 26) % 26];
  }).join("");
}

function isPrime(n){
  if (n<2) return false;
  if (n%2===0) return n===2;
  const r=Math.floor(Math.sqrt(n));
  for (let i=3;i<=r;i+=2){ if(n%i===0) return false; }
  return true;
}
function egcd(a,b){ if(b===0) return [a,1,0]; const [g,x1,y1]=egcd(b,a%b); return [g,y1,x1-Math.floor(a/b)*y1]; }
function modInv(a, m){ const [g,x] = egcd(((a%m)+m)%m, m); if(g!==1) return null; return ((x%m)+m)%m; }
function modExp(base, exp, mod){
  let r=1n, b=BigInt(base)%BigInt(mod), e=BigInt(exp), m=BigInt(mod);
  while(e>0n){ if(e&1n) r=(r*b)%m; b=(b*b)%m; e >>= 1n; }
  return r;
}

function generateToyRSA(){
  const primes=[]; for(let n=11;n<200;n++){ if(isPrime(n)) primes.push(n); }
  const p = primes[Math.floor(Math.random()*primes.length)];
  let q=p; while(q===p){ q = primes[Math.floor(Math.random()*primes.length)]; }
  const n = p*q;
  const phi = (p-1)*(q-1);
  const es = [3,5,17,257,65537].filter(e=> e<phi && egcd(e,phi)[0]===1);
  const e = es[Math.floor(Math.random()*es.length)] ?? 3;
  const d = modInv(e,phi);
  return { p,q,n,phi,e,d };
}

function rsaEncrypt(m, e, n){ return Number(modExp(BigInt(m), BigInt(e), BigInt(n))); }
function rsaDecrypt(c, d, n){ return Number(modExp(BigInt(c), BigInt(d), BigInt(n))); }


function drawLattice(ctx, width, height, basis){
  ctx.clearRect(0,0,width,height);
  ctx.lineWidth = 1; ctx.globalAlpha = 1;

  ctx.strokeStyle = "#e5e7eb"; 
  for(let x=0; x<=width; x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
  for(let y=0; y<=height; y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }
 
  ctx.strokeStyle="#9ca3af"; 
  ctx.beginPath(); ctx.moveTo(width/2,0); ctx.lineTo(width/2,height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,height/2); ctx.lineTo(width,height/2); ctx.stroke();
  const origin = {x: width/2, y: height/2};
  function toCanvas(v){ return { x: origin.x + v[0]*20, y: origin.y - v[1]*20 } }

  ctx.fillStyle = "#1f2937"; 
  for(let i=-10;i<=10;i++){
    for(let j=-10;j<=10;j++){
      const v = [i*basis[0][0] + j*basis[1][0], i*basis[0][1] + j*basis[1][1]];
      const p = toCanvas(v);
      ctx.beginPath(); ctx.arc(p.x,p.y,2,0,2*Math.PI); ctx.fill();
    }
  }

  const b1=toCanvas(basis[0]); const b2=toCanvas(basis[1]);
  ctx.strokeStyle="#2563eb"; 
  ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(b1.x,b1.y); ctx.stroke();
  ctx.strokeStyle="#16a34a"; 
  ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(b2.x,b2.y); ctx.stroke();
}

function Chip({icon:Icon, children}){
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {Icon && <Icon className="h-4 w-4"/>}{children}
    </span>
  );
}

function Section({title, badge, children, right}) {
  return (
    <section className="anim-fade rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        <div className="flex items-center gap-2">{right}{badge}</div>
      </div>
      <div className="text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}


const i18n = {
  en: {
    appTitle: "PQC in Grade 10–11 Mathematics & Computing (MA)",
    learn: "Learn", simulate: "Simulate", assess: "Assess", project: "Project", resources: "Resources",
    heroBlurb: "Explore how math and computing protect our digital world — from Caesar ciphers to CRYSTALS-Kyber.",
    start: "Get Started",
    standards: "Aligned to MA DLCS + HS math standards",
    language: "Language",
    l1: "Classical Cryptography",
    l1p: "Substitution & Vigenère ciphers, frequency analysis, modular arithmetic warm-up.",
    l2: "Modern Public-Key (RSA)",
    l2p: "Keys, modular exponentiation, factoring hardness, toy RSA demo.",
    l3: "Quantum Threat",
    l3p: "Qubits, Shor’s algorithm, and the ‘harvest-now, decrypt-later’ risk.",
    l4: "Lattice & Kyber",
    l4p: "Lattices, short vectors intuition, and Kyber’s key encapsulation.",
    l5: "Ethics & Society",
    l5p: "Privacy, surveillance, equity, and digital citizenship.",
    caesar: "Caesar",
    vigenere: "Vigenère",
    rsa: "Toy RSA",
    lattice: "Lattice Sandbox",
    kyber: "Kyber KEM (Storyboard)",
    plaintext: "Plaintext",
    ciphertext: "Ciphertext",
    key: "Key",
    shift: "Shift",
    encrypt: "Encrypt",
    decrypt: "Decrypt",
    smallIntsOnly: "(Use small integers; demo only)",
    messageAsInt: "Message as small integer",
    primeP: "Prime p",
    primeQ: "Prime q",
    publicE: "Public e",
    modulusN: "Modulus n",
    privateD: "Private d",
    generate: "Generate",
    reset: "Reset",
    quizTitle: "Quick Checks",
    submit: "Submit",
    result: "Result",
    reflection: "Reflection Journal",
    projectBrief: "Culminating Project",
    rubric: "Rubric",
    teacherGuide: "Teacher Guide & Standards",
  },
  es: {
    appTitle: "Criptografía PQC en Grados 10–11 (Massachusetts)",
    learn: "Aprender", simulate: "Simular", assess: "Evaluar", project: "Proyecto", resources: "Recursos",
    heroBlurb: "Explora cómo las matemáticas y la computación protegen el mundo digital — de César a CRYSTALS-Kyber.",
    start: "Comenzar",
    standards: "Alineado con MA DLCS + estándares de matemáticas",
    language: "Idioma",
    l1: "Criptografía clásica",
    l1p: "Sustitución y Vigenère, análisis de frecuencia, aritmética modular.",
    l2: "Criptografía moderna (RSA)",
    l2p: "Claves, exponenciación modular, dificultad de factorizar, demo de RSA.",
    l3: "Amenaza cuántica",
    l3p: "Qubits, algoritmo de Shor y el riesgo ‘cosechar ahora, descifrar después’.",
    l4: "Redes (lattices) & Kyber",
    l4p: "Intuición de vectores cortos y encapsulación de claves de Kyber.",
    l5: "Ética y sociedad",
    l5p: "Privacidad, vigilancia, equidad y ciudadanía digital.",
    caesar: "César",
    vigenere: "Vigenère",
    rsa: "RSA (juguete)",
    lattice: "Lattice",
    kyber: "Kyber KEM (Storyboard)",
    plaintext: "Texto claro",
    ciphertext: "Texto cifrado",
    key: "Clave",
    shift: "Desplazamiento",
    encrypt: "Cifrar",
    decrypt: "Descifrar",
    smallIntsOnly: "(Usa enteros pequeños; demostración)",
    messageAsInt: "Mensaje como entero pequeño",
    primeP: "Primo p",
    primeQ: "Primo q",
    publicE: "Público e",
    modulusN: "Módulo n",
    privateD: "Privado d",
    generate: "Generar",
    reset: "Reiniciar",
    quizTitle: "Comprensiones rápidas",
    submit: "Enviar",
    result: "Resultado",
    reflection: "Diario de reflexión",
    projectBrief: "Proyecto culminante",
    rubric: "Rúbrica",
    teacherGuide: "Guía docente y estándares",
  }
};

function LearnCard({icon:Icon,title,desc,children}){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><Icon className="h-6 w-6 text-slate-700 dark:text-slate-200"/></div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{desc}</p>
      <div className="mt-3 text-slate-700 dark:text-slate-200">{children}</div>
    </div>
  );
}

function CaesarTool({t}){
  const [plain,setPlain]=useState("MEET AT NOON");
  const [shift,setShift]=useState(3);
  const cipher = useMemo(()=> caesarEncrypt(plain, shift), [plain,shift]);
  const dec = useMemo(()=> caesarDecrypt(cipher, shift), [cipher,shift]);
  return (
    <Section title={`${t.caesar} (Shift)`} badge={<Chip icon={Lock}>A1: Modular addition</Chip>} right={<Chip icon={Cpu}>Compute</Chip>}>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.plaintext}</label>
          <textarea value={plain} onChange={e=>setPlain(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows={3}/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.shift}: {shift}</label>
          <input type="range" min={-13} max={13} value={shift} onChange={e=>setShift(parseInt(e.target.value))} className="mt-1 w-full"/>
          <p className="mt-2 text-sm text-slate-500">{t.standards}: MA.HSN-Q.A, HSA-APR; DLCS.CS-CS1</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.ciphertext}</label>
          <textarea value={cipher} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows={3}/>
          <p className="mt-2 text-xs text-slate-500">Decrypt check: {dec}</p>
        </div>
      </div>
    </Section>
  );
}

function VigenereTool({t}){
  const [plain,setPlain]=useState("ATTACK AT DAWN");
  const [key,setKey]=useState("LEMON");
  const cipher = useMemo(()=> vigenereEncrypt(plain, key), [plain,key]);
  const dec = useMemo(()=> vigenereDecrypt(cipher, key), [cipher,key]);
  return (
    <Section title={`${t.vigenere} (Polyalphabetic)`} badge={<Chip icon={KeyRound}>A2: Mod-26 with key</Chip>} right={<Chip icon={Cpu}>Compute</Chip>}>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.plaintext}</label>
          <textarea value={plain} onChange={e=>setPlain(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows={3}/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.key}</label>
          <input value={key} onChange={e=>setKey(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"/>
          <p className="mt-2 text-sm text-slate-500">Frequency analysis challenge: try short vs long keys.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.ciphertext}</label>
          <textarea value={cipher} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows={3}/>
          <p className="mt-2 text-xs text-slate-500">Decrypt check: {dec}</p>
        </div>
      </div>
    </Section>
  );
}

function RSATool({t}){
  const [state,setState]=useState(()=>generateToyRSA());
  const [m,setM]=useState(42);
  const c = useMemo(()=> rsaEncrypt(m, state.e, state.n), [m,state]);
  const m2 = useMemo(()=> rsaDecrypt(c, state.d, state.n), [c,state]);
  return (
    <Section title={`${t.rsa} ${t.smallIntsOnly}`} badge={<Chip icon={ShieldCheck}>Public/Private Keys</Chip>} right={<button className="rounded-lg border border-slate-200 px-3 py-1 text-sm shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={()=>setState(generateToyRSA())}>{t.generate}</button>}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-sm text-slate-700 dark:text-slate-200">{t.primeP}: <b>{state.p}</b>, {t.primeQ}: <b>{state.q}</b></div>
          <div className="text-sm text-slate-700 dark:text-slate-200">{t.modulusN}: <b>{state.n}</b></div>
          <div className="text-sm text-slate-700 dark:text-slate-200">{t.publicE}: <b>{state.e}</b> &nbsp; | &nbsp; {t.privateD}: <b>{state.d}</b></div>
          <p className="text-xs text-slate-500">Security rests on factoring n into p×q being hard (for large primes).</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.messageAsInt}</label>
          <input type="number" value={m} onChange={e=>setM(parseInt(e.target.value||"0"))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"/>
          <p className="mt-2 text-xs text-slate-500">Encode text↔int in class; keep 0 &lt; m &lt; n.</p>
        </div>
        <div className="text-sm">
          <div>C = m^e mod n → <b>{c}</b></div>
          <div>m = C^d mod n → <b>{m2}</b></div>
          <p className="mt-2 text-xs text-slate-500">Shor’s algorithm on a large quantum computer could factor n efficiently → motivates PQC.</p>
        </div>
      </div>
    </Section>
  );
}

function LatticeSandbox({t}){
  const canvasRef = useRef(null);
  const [basis, setBasis] = useState([[2,1],[1,2]]);
  const [target,setTarget]=useState([3,4]);
  const [closest,setClosest]=useState([0,0]);

  useEffect(()=>{
    const cvs = canvasRef.current; if(!cvs) return; const ctx = cvs.getContext("2d");
    drawLattice(ctx, cvs.width, cvs.height, basis);
    const origin = {x: cvs.width/2, y: cvs.height/2};
    const toCanvas = (v)=>({x: origin.x + v[0]*20, y: origin.y - v[1]*20});

    const B = basis;
    let best=[0,0], bestDist=1e9;
    for(let i=-5;i<=5;i++) for(let j=-5;j<=5;j++){
      const v = [i*B[0][0]+j*B[1][0], i*B[0][1]+j*B[1][1]];
      const dx=v[0]-target[0], dy=v[1]-target[1];
      const d=dx*dx+dy*dy; if(d<bestDist){best=v;bestDist=d;}
    }
    setClosest(best);
 
    const tp = toCanvas(target);
    ctx.fillStyle="#dc2626"; ctx.beginPath(); ctx.arc(tp.x,tp.y,5,0,2*Math.PI); ctx.fill();

    const bp = toCanvas(best);
    ctx.fillStyle="#0ea5e9"; ctx.beginPath(); ctx.arc(bp.x,bp.y,5,0,2*Math.PI); ctx.fill();
   
    ctx.strokeStyle="#334155"; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(tp.x,tp.y); ctx.lineTo(bp.x,bp.y); ctx.stroke();
    ctx.setLineDash([]);
  }, [basis, target]);

  return (
    <Section title={`${t.lattice} (Vectors & Shortest Vector Intuition)`} badge={<Chip icon={Brain}>Linear Algebra</Chip>} right={<Chip icon={Zap}>Explore</Chip>}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <canvas ref={canvasRef} width={600} height={360} className="w-full rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"/>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Basis vectors</div>
          <div className="grid grid-cols-2 gap-2">
            {[0,1].map(idx=> (
              <div key={idx} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">b{idx+1} = [x,y]</div>
                <div className="mt-1 flex gap-2">
                  <input type="number" value={basis[idx][0]} onChange={e=>{
                    const v=[...basis[idx]]; v[0]=parseInt(e.target.value||"0"); const B=[...basis]; B[idx]=v; setBasis(B);
                  }} className="w-20 rounded border border-slate-200 p-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"/>
                  <input type="number" value={basis[idx][1]} onChange={e=>{
                    const v=[...basis[idx]]; v[1]=parseInt(e.target.value||"0"); const B=[...basis]; B[idx]=v; setBasis(B);
                  }} className="w-20 rounded border border-slate-200 p-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"/>
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Target vector t = [x,y]</div>
          <div className="flex gap-2">
            <input type="number" value={target[0]} onChange={e=>setTarget([parseInt(e.target.value||"0"), target[1]])} className="w-20 rounded border border-slate-200 p-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"/>
            <input type="number" value={target[1]} onChange={e=>setTarget([target[0], parseInt(e.target.value||"0")])} className="w-20 rounded border border-slate-200 p-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"/>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Closest lattice point (naive search): [{closest[0]}, {closest[1]}]</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Connect to concepts: L(B), SVP, CVP → hardness underlies Kyber.</p>
        </div>
      </div>
    </Section>
  );
}

function KyberStoryboard(){
  const steps = [
    {title: "1. Setup", text: "Alice publishes a Kyber public key (pk); keeps secret key (sk). Keys are lattice-based."},
    {title: "2. Encapsulate", text: "Bob uses pk to create a random shared secret and ciphertext ct, then sends ct to Alice."},
    {title: "3. Decapsulate", text: "Alice uses sk to recover the same shared secret from ct; both now share a symmetric key (e.g., AES-GCM)."},
    {title: "Why Lattices?", text: "Security relies on hardness of Module-LWE over lattices; believed hard even for quantum computers."},
  ];
  return (
    <Section title="CRYSTALS-Kyber KEM (Storyboard)" badge={<Chip icon={ShieldCheck}>PQC</Chip>} right={<Chip icon={Info}>Conceptual Demo</Chip>}>
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((s,i)=> (
          <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.title}</div>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{s.text}</p>
          </div>
        ))}
        <div className="md:col-span-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notes</div>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">
            <li>Teaching storyboard only; no cryptographic library is used.</li>
            <li>Discuss KEM vs. traditional key exchange; why PQC matters.</li>
            <li>Compare key sizes, speed, and security assumptions at a high level.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Assess({t}){
  const [q1,setQ1]=useState("");
  const [q2,setQ2]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const correct = (q1==="B" && q2==="C");
  return (
    <div className="space-y-6">
      <Section title={t.quizTitle} badge={<Chip icon={BookOpen}>Formative</Chip>}>
        <div className="space-y-4">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100">1) Why does RSA become vulnerable on a sufficiently large fault-tolerant quantum computer?</div>
            <div className="mt-2 space-y-1 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="q1" onChange={()=>setQ1("A")} />A) Because AES gets faster</label>
              <label className="flex items-center gap-2"><input type="radio" name="q1" onChange={()=>setQ1("B")} />B) Shor’s algorithm factors n efficiently</label>
              <label className="flex items-center gap-2"><input type="radio" name="q1" onChange={()=>setQ1("C")} />C) Moore’s law stops</label>
            </div>
          </div>
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100">2) In lattice terms, which intuition connects to Kyber’s hardness?</div>
            <div className="mt-2 space-y-1 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="q2" onChange={()=>setQ2("A")} />A) Finding a Caesar shift</label>
              <label className="flex items-center gap-2"><input type="radio" name="q2" onChange={()=>setQ2("B")} />B) Factoring a large integer</label>
              <label className="flex items-center gap-2"><input type="radio" name="q2" onChange={()=>setQ2("C")} />C) Solving certain closest/shortest vector problems is hard</label>
            </div>
          </div>
          <button onClick={()=>setSubmitted(true)} className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">{t.submit}</button>
          {submitted && (
            <div className={`rounded-xl p-3 text-sm ${correct?"bg-green-50 text-green-800":"bg-red-50 text-red-800"}`}>
              {t.result}: {correct?"✅ 2/2":"❌ Try again → Hints in Learn & Simulate."}
            </div>
          )}
        </div>
      </Section>
      <Section title={t.reflection} badge={<Chip icon={Globe2}>Civic & Ethics</Chip>}>
        <p className="text-sm text-slate-700 dark:text-slate-200">Prompt: Describe one way PQC might protect your daily life (e.g., school portal, banking), and one ethical question it raises.</p>
        <textarea className="mt-2 w-full rounded-xl border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows={4} placeholder="Your thoughts…"/>
      </Section>
    </div>
  );
}

function Project({t}){
  return (
    <div className="space-y-6">
      <Section title={t.projectBrief} badge={<Chip icon={Zap}>3–4 min Artifact</Chip>}>
        <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">
          <li>In teams, create a short explainer (slides / video / interactive page) that answers: <i>Why does PQC matter for us?</i></li>
          <li>Include: one classical cipher demo, one RSA insight, one lattice/Kyber intuition, and an ethical consideration.</li>
          <li>Audience: Grade 9 students or families at a school night.</li>
          <li>Accessibility: captions, alt text, plain-language summary.</li>
        </ul>
      </Section>
      <Section title={t.rubric} badge={<Chip icon={ShieldCheck}>Assessment</Chip>}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600 dark:text-slate-300"><th className="p-2">Criteria</th><th className="p-2">Emerging (1)</th><th className="p-2">Proficient (2)</th><th className="p-2">Advanced (3)</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Concept Accuracy</td><td className="p-2">Gaps in basics</td><td className="p-2">Correct core ideas</td><td className="p-2">Nuanced, connections across topics</td></tr>
            <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Mathematical Reasoning</td><td className="p-2">Limited examples</td><td className="p-2">Clear examples (mod, vectors)</td><td className="p-2">Insightful extensions / proofs-lite</td></tr>
            <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Computational Thinking</td><td className="p-2">Basic steps only</td><td className="p-2">Structured algorithms</td><td className="p-2">Optimization & testing mindset</td></tr>
            <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Ethics & Impact</td><td className="p-2">Minimal mention</td><td className="p-2">Clear implications</td><td className="p-2">Balanced, civic-minded analysis</td></tr>
            <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Communication & Accessibility</td><td className="p-2">Hard to follow</td><td className="p-2">Readable, alt text/captions</td><td className="p-2">Multilingual summary, UDL choices</td></tr>
          </tbody>
        </table>
      </Section>
    </div>
  );
}


function Resources({t}){
  return (
    <div className="space-y-6">
      <Section title={t.teacherGuide} badge={<Chip icon={Languages}>Multilingual</Chip>}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <div className="font-semibold">Scope & Sequence (4–6 lessons)</div>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>Classical ciphers & mod arithmetic</li>
              <li>RSA keys & modular exponentiation (toy)</li>
              <li>Quantum risk & ‘harvest now, decrypt later’</li>
              <li>Lattices, SVP/CVP intuition → Kyber KEM</li>
              <li>Ethics, privacy, equity</li>
              <li>Team project (artifact + demo)</li>
            </ol>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <div className="font-semibold">Accommodations & Equity</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Offline options: paper cipher wheels; grid paper for lattices.</li>
              <li>UDL: multiple representations, captions, glossary cards.</li>
              <li>Language access: Spanish glossaries; bilingual examples.</li>
              <li>Device-sharing friendly; short time-boxed activities.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <div className="font-semibold">Standards Mapping (abridged)</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>MA DLCS: Safety/Security (HS-CS-SFE), Computational Thinking (HS-CS-CT), Algorithms (HS-CS-ALG).</li>
              <li>Math: Number & Quantity (HSN-RN, HSN-Q), Algebra (HSA-APR), Functions (HSF-IF), Vectors/Matrices (HSN-VM), Statistics (HSS-IC for risk framing).</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <div className="font-semibold">Safety & Ethics Reminders</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Toy code only; do not use for real security.</li>
              <li>Never print real keys/secrets; discuss authenticated encryption.</li>
              <li>Promote responsible digital citizenship & privacy by design.</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default function App(){
  const [lang,setLang]=useState("en");
  const t = i18n[lang];
  const [tab,setTab]=useState("learn");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600"/>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Chip icon={Globe2}>{t.standards}</Chip>
            <label className="ml-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <Languages className="h-4 w-4"/>{t.language}
              <select className="rounded-lg border border-slate-200 p-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
            <DarkToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Hero */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 p-6 ring-1 ring-inset ring-slate-200 dark:from-slate-800/60 dark:to-slate-800/30 dark:ring-slate-700">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-slate-700 dark:text-slate-200">{t.heroBlurb}</p>
            <div className="flex gap-2">
              <button onClick={()=>setTab("simulate")} className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 active:scale-[.98] transition">{t.start}</button>
              <button onClick={()=>setTab("learn")} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-blue-700 shadow-sm hover:bg-blue-50 active:scale-[.98] transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">{t.learn}</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mb-6 flex flex-wrap gap-2">
          {[
            {id:"learn", label:t.learn, icon:BookOpen},
            {id:"simulate", label:t.simulate, icon:Cpu},
            {id:"assess", label:t.assess, icon:Brain},
            {id:"project", label:t.project, icon:Zap},
            {id:"resources", label:t.resources, icon:Info},
          ].map(x=> (
            <button
              key={x.id}
              onClick={()=>setTab(x.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm ring-1 ring-inset transition
                ${tab===x.id
                  ? "bg-blue-600 text-white ring-blue-600"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"}`}
            >
              <x.icon className="h-4 w-4"/>{x.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        {tab==="learn" && (
          <div className="grid gap-4 md:grid-cols-2">
            <LearnCard icon={Lock} title={t.l1} desc={t.l1p}>
              <ul className="ml-4 list-disc text-sm">
                <li>Shift & polyalphabetic ciphers; why frequency analysis works.</li>
                <li>Modular arithmetic: add, wrap, residues mod 26.</li>
              </ul>
            </LearnCard>
            <LearnCard icon={KeyRound} title={t.l2} desc={t.l2p}>
              <ul className="ml-4 list-disc text-sm">
                <li>Public vs private keys; modular exponentiation.</li>
                <li>Security ⇢ factoring large n is hard (classically).</li>
              </ul>
            </LearnCard>
            <LearnCard icon={Zap} title={t.l3} desc={t.l3p}>
              <ul className="ml-4 list-disc text-sm">
                <li>Shor’s algorithm undermines factoring / discrete log.</li>
                <li>Harvest-now, decrypt-later motivates migration plans.</li>
              </ul>
            </LearnCard>
            <LearnCard icon={ShieldCheck} title={t.l4} desc={t.l4p}>
              <ul className="ml-4 list-disc text-sm">
                <li>Lattices: points from integer combos of basis vectors.</li>
                <li>Hard problems (Module-LWE) underpin Kyber KEM.</li>
              </ul>
            </LearnCard>
            <LearnCard icon={Globe2} title={t.l5} desc={t.l5p}>
              <ul className="ml-4 list-disc text-sm">
                <li>Privacy, surveillance, and equitable access.</li>
                <li>Digital citizenship: safe credentials, MFA, updates.</li>
              </ul>
            </LearnCard>
          </div>
        )}

        {tab==="simulate" && (
          <div className="space-y-6">
            <CaesarTool t={t} />
            <VigenereTool t={t} />
            <RSATool t={t} />
            <LatticeSandbox t={t} />
            <KyberStoryboard />
          </div>
        )}

        {tab==="assess" && <Assess t={t} />}
        {tab==="project" && <Project t={t} />}
        {tab==="resources" && <Resources t={t} />}
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 text-xs text-slate-500 dark:text-slate-400">
          <p>Educational demo. Do not use for real cryptographic security. © {new Date().getFullYear()} PQC in HS Curriculum.</p>
        </div>
      </footer>
    </div>
  );
}
