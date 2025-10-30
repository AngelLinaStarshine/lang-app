/* eslint-env es2020 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Cpu, ShieldCheck, KeyRound, Lock, Brain, Zap, Info } from "lucide-react";
import {
  Section,
  Chip,
  caesarEncrypt,
  caesarDecrypt,
  vigenereEncrypt,
  vigenereDecrypt,
  generateToyRSA,
  rsaEncrypt,
  rsaDecrypt,
  drawLattice,
} from "../shared";

/* Caesar */
function CaesarTool({ t }) {
  const [plain, setPlain] = useState("MEET AT NOON");
  const [shift, setShift] = useState(3);
  const cipher = useMemo(() => caesarEncrypt(plain, shift), [plain, shift]);
  const dec = useMemo(() => caesarDecrypt(cipher, shift), [cipher, shift]);

  return (
    <Section
      title={`${t.caesar} (Shift)`}
      badge={<Chip icon={Lock}>A1: Modular addition</Chip>}
      right={<Chip icon={Cpu}>Compute</Chip>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">{t.plaintext}</label>
          <textarea
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
            className="mt-1 w-full rounded-lg border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            {t.shift}: {shift}
          </label>
          <input
            type="range"
            min={-13}
            max={13}
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value))}
            className="mt-1 w-full"
          />
          <p className="mt-2 text-sm text-slate-500">
            {t.standards}: MA.HSN-Q.A, HSA-APR; DLCS.CS-CS1
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium">{t.ciphertext}</label>
          <textarea
            value={cipher}
            readOnly
            className="mt-1 w-full rounded-lg border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"
            rows={3}
          />
          <p className="mt-2 text-xs text-slate-500">Decrypt check: {dec}</p>
        </div>
      </div>
    </Section>
  );
}

/* Vigenère */
function VigenereTool({ t }) {
  const [plain, setPlain] = useState("ATTACK AT DAWN");
  const [key, setKey] = useState("LEMON");
  const cipher = useMemo(() => vigenereEncrypt(plain, key), [plain, key]);
  const dec = useMemo(() => vigenereDecrypt(cipher, key), [cipher, key]);

  return (
    <Section
      title={`${t.vigenere} (Polyalphabetic)`}
      badge={<Chip icon={KeyRound}>A2: Mod-26 with key</Chip>}
      right={<Chip icon={Cpu}>Compute</Chip>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">{t.plaintext}</label>
          <textarea
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
            className="mt-1 w-full rounded-lg border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">{t.key}</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 w-full rounded-lg border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"
          />
          <p className="mt-2 text-sm text-slate-500">
            Frequency analysis challenge: try short vs long keys.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium">{t.ciphertext}</label>
          <textarea
            value={cipher}
            readOnly
            className="mt-1 w-full rounded-lg border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"
            rows={3}
          />
          <p className="mt-2 text-xs text-slate-500">Decrypt check: {dec}</p>
        </div>
      </div>
    </Section>
  );
}

/* Toy RSA */
function RSATool({ t }) {
  const [state, setState] = useState(() => generateToyRSA());
  const [m, setM] = useState(42);
  const c = useMemo(() => rsaEncrypt(m, state.e, state.n), [m, state]);
  const m2 = useMemo(() => rsaDecrypt(c, state.d, state.n), [c, state]);

  return (
    <Section
      title={`${t.rsa} ${t.smallIntsOnly}`}
      badge={<Chip icon={ShieldCheck}>Public/Private Keys</Chip>}
      right={
        <button
          onClick={() => setState(generateToyRSA())}
          className="rounded-lg border border-blue-100 bg-blue-50 text-blue-900 px-3 py-1 text-sm shadow-sm hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900"
        >
          {t.generate}
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-sm">
            {t.primeP}: <b>{state.p}</b>, {t.primeQ}: <b>{state.q}</b>
          </div>
          <div className="text-sm">
            {t.modulusN}: <b>{state.n}</b>
          </div>
          <div className="text-sm">
            {t.publicE}: <b>{state.e}</b> &nbsp; | &nbsp; {t.privateD}:{" "}
            <b>{state.d}</b>
          </div>
          <p className="text-xs text-slate-500">
            Security rests on factoring n = p*q being hard (for large primes).
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium">
            {t.messageAsInt}
          </label>
          <input
            type="number"
            value={m}
            onChange={(e) => setM(parseInt(e.target.value || "0"))}
            className="mt-1 w-full rounded-lg border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"
          />
          <p className="mt-2 text-xs text-slate-500">
            Encode text↔int in class; keep 0 &lt; m &lt; n.
          </p>
        </div>
        <div className="text-sm">
          <div>
            C = m<sup>e</sup> mod n = <b>{c}</b>
          </div>
          <div>
            m = C<sup>d</sup> mod n = <b>{m2}</b>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Shor’s algorithm on a large quantum computer could factor n
            efficiently — motivates PQC.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* Lattice + Kyber storyboard */
function LatticeSandbox({ t }) {
  const canvasRef = useRef(null);
  const [basis, setBasis] = useState([[2, 1],[1, 2]]);
  const [target, setTarget] = useState([3, 4]);
  const [closest, setClosest] = useState([0, 0]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    drawLattice(ctx, cvs.width, cvs.height, basis);

    // naive closest search
    let best = [0, 0], bestDist = Infinity;
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const v = [i*basis[0][0]+j*basis[1][0], i*basis[0][1]+j*basis[1][1]];
        const dx = v[0] - target[0], dy = v[1] - target[1];
        const d = dx*dx + dy*dy;
        if (d < bestDist) { best = v; bestDist = d; }
      }
    }
    setClosest(best);

    const origin = { x: cvs.width/2, y: cvs.height/2 };
    const toCanvas = (v) => ({ x: origin.x + v[0]*20, y: origin.y - v[1]*20 });

    const tp = toCanvas(target);
    ctx.fillStyle = "#dc2626";
    ctx.beginPath(); ctx.arc(tp.x, tp.y, 5, 0, 2*Math.PI); ctx.fill();

    const bp = toCanvas(best);
    ctx.fillStyle = "#0ea5e9";
    ctx.beginPath(); ctx.arc(bp.x, bp.y, 5, 0, 2*Math.PI); ctx.fill();

    ctx.strokeStyle = "#334155";
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(bp.x, bp.y); ctx.stroke();
    ctx.setLineDash([]);
  }, [basis, target]);

  return (
    <Section
      title={`${t.lattice} (Vectors & Shortest Vector Intuition)`}
      badge={<Chip icon={Brain}>Linear Algebra</Chip>}
      right={<Chip icon={Zap}>Explore</Chip>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <canvas ref={canvasRef} width={600} height={360}
            className="w-full rounded-xl border bg-white shadow-sm" />
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium">Basis vectors</div>
          <div className="grid grid-cols-2 gap-2">
            {[0,1].map((idx) => (
              <div key={idx} className="rounded-lg border p-2">
                <div className="text-xs text-slate-500">b{idx+1} = [x, y]</div>
                <div className="mt-1 flex gap-2">
                  <input type="number" value={basis[idx][0]}
                    onChange={(e)=>{ const v=[...basis[idx]]; v[0]=parseInt(e.target.value||"0"); const B=[...basis]; B[idx]=v; setBasis(B); }}
                    className="w-20 rounded border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"/>
                  <input type="number" value={basis[idx][1]}
                    onChange={(e)=>{ const v=[...basis[idx]]; v[1]=parseInt(e.target.value||"0"); const B=[...basis]; B[idx]=v; setBasis(B); }}
                    className="w-20 rounded border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"/>
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm font-medium">Target vector t = [x, y]</div>
          <div className="flex gap-2">
            <input type="number" value={target[0]}
              onChange={(e)=>setTarget([parseInt(e.target.value||"0"), target[1]])}
              className="w-20 rounded border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"/>
            <input type="number" value={target[1]}
              onChange={(e)=>setTarget([target[0], parseInt(e.target.value||"0")])}
              className="w-20 rounded border border-blue-100 bg-blue-50 text-blue-900 p-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700"/>
          </div>
          <p className="text-xs text-slate-600">
            Closest lattice point (naive search): [{closest[0]}, {closest[1]}]
          </p>
        </div>
      </div>
    </Section>
  );
}

function KyberStoryboard({ t }) {
  const steps = [
    { title: "1. Setup", text: "Alice publishes a Kyber public key (pk); keeps secret key (sk). Keys are lattice-based." },
    { title: "2. Encapsulate", text: "Bob uses pk to create a random shared secret and ciphertext (ct), then sends ct to Alice." },
    { title: "3. Decapsulate", text: "Alice uses sk to recover the same shared secret from ct; both now share a symmetric AES key." },
    { title: "Why Lattices?", text: "Security relies on hardness of Module-LWE; believed hard even for quantum computers." },
  ];
  return (
    <Section title="CRYSTALS-Kyber KEM (Storyboard)"
      badge={<Chip icon={ShieldCheck}>PQC</Chip>}
      right={<Chip icon={Info}>Conceptual Demo</Chip>}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((s,i)=>(
          <div key={i} className="rounded-xl border p-4">
            <div className="text-sm font-semibold">{s.title}</div>
            <p className="mt-1 text-sm">{s.text}</p>
          </div>
        ))}
        <div className="md:col-span-2 rounded-xl border p-4">
          <div className="text-sm font-semibold">Notes</div>
          <ul className="mt-1 list-disc pl-5 text-sm">
            <li>Teaching storyboard only; no actual cryptographic code is used here.</li>
            <li>KEM vs traditional key exchange; why PQC matters now.</li>
            <li>Compare key sizes, speed, and assumptions at a high level.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

export default function Simulate({ t }) {
  return (
    <div className="space-y-6">
      <CaesarTool t={t} />
      <VigenereTool t={t} />
      <RSATool t={t} />
      <LatticeSandbox t={t} />
      <KyberStoryboard t={t} />
    </div>
  );
}
