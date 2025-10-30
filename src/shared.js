/* eslint-env es2020 */
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/* ---------- i18n ---------- */
export const i18n = {
  en: {
    appTitle: "PQC in Grade 10–11 Mathematics & Computing (MA)",
    learn: "Learn",
    simulate: "Simulate",
    assess: "Assess",
    project: "Project",
    resources: "Resources",
    heroBlurb:
      "Explore how math and computing protect our digital world — from Caesar ciphers to CRYSTALS-Kyber.",
    start: "Get Started",
    standards: "Aligned to MA DLCS + HS math standards",
    language: "Language",
    l1: "Classical Cryptography",
    l1p:
      "Substitution & Vigenère ciphers, frequency analysis, modular arithmetic warm-up.",
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
    learn: "Aprender",
    simulate: "Simular",
    assess: "Evaluar",
    project: "Proyecto",
    resources: "Recursos",
    heroBlurb:
      "Explora cómo las matemáticas y la computación protegen el mundo digital — de César a CRYSTALS-Kyber.",
    start: "Comenzar",
    standards: "Alineado con MA DLCS + estándares de matemáticas",
    language: "Idioma",
    l1: "Criptografía clásica",
    l1p:
      "Sustitución y Vigenère, análisis de frecuencia, aritmética modular.",
    l2: "Criptografía moderna (RSA)",
    l2p:
      "Claves, exponenciación modular, dificultad de factorizar, demo de RSA.",
    l3: "Amenaza cuántica",
    l3p:
      "Qubits, algoritmo de Shor y el riesgo ‘cosechar ahora, descifrar después’.",
    l4: "Redes (lattices) & Kyber",
    l4p:
      "Intuición de vectores cortos y encapsulación de claves de Kyber.",
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
  },
};

/* ---------- Theme toggle ---------- */
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return (
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
    );
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

export function DarkToggle() {
  const { dark, setDark } = useDarkMode();
  return (
    <button
      onClick={() => setDark(!dark)}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm backdrop-blur hover:bg-white/80 active:scale-[.98] transition dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200"
      title={dark ? "Switch to Light" : "Switch to Dark"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {dark ? "Light" : "Dark"}
    </button>
  );
}

/* ---------- Small UI atoms ---------- */
export function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </span>
  );
}

export function Section({ title, badge, children, right }) {
  return (
    <section className="anim-fade rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {right}
          {badge}
        </div>
      </div>
      <div className="text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}

/* ---------- Resource Drawer ---------- */
export function ResourceDrawer({ open, onClose, topic }) {
  if (!open) return null;
  const items = [
    { key: "lecture", label: "Lecture", desc: "Upload PDF/HTML or link." },
    { key: "guide", label: "Guide Notes", desc: "Teacher/Student notes." },
    { key: "slides", label: "Slides", desc: "Upload PPTX/PDF link." },
    { key: "video", label: "Video", desc: "Embed URL or file." },
    { key: "extra", label: "Additional Material", desc: "Readings, handouts." },
    {
      key: "whiteboard",
      label: "Whiteboard (live)",
      desc: "Student/Teacher access (coming later).",
    },
  ];
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl transition dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label={`${topic?.title} resources`}
      >
        <header className="flex items-center justify-between border-b p-4 dark:border-slate-800">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Resources
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {topic?.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </header>
        <div className="flex h-[calc(100%-57px)]">
          <nav className="w-40 border-r p-3 text-sm dark:border-slate-800">
            <ul className="space-y-1">
              {items.map((it) => (
                <li key={it.key}>
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-md px-2 py-1.5 text-left text-slate-600 ring-1 ring-inset ring-slate-200/60 hover:bg-slate-50 disabled:opacity-70 dark:text-slate-300 dark:ring-slate-700/60 dark:hover:bg-slate-800"
                    title={it.desc}
                  >
                    {it.label}
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      soon
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <section className="flex-1 p-4">
            <div className="rounded-xl border border-dashed p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <p className="font-medium">Upload area</p>
              <p className="mt-1">
                When you’re ready, we’ll hook each menu item to a file or URL
                (Google Drive, Moodle, Vimeo/YouTube, etc.).
              </p>
              <ul className="mt-3 list-disc pl-5">
                <li>Accept .pdf, .pptx, .mp4, links.</li>
                <li>Show “Open” and “Preview” buttons.</li>
                <li>Gate “Whiteboard” for teacher/student roles later.</li>
              </ul>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

/* ---------- Crypto helpers ---------- */
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lettersOnly = (s) => s.toUpperCase().replace(/[^A-Z]/g, "");

export function caesarEncrypt(plain, shift) {
  const P = lettersOnly(plain);
  const k = ((shift % 26) + 26) % 26;
  return [...P]
    .map((ch) => {
      const idx = alphabet.indexOf(ch);
      return idx >= 0 ? alphabet[(idx + k) % 26] : ch;
    })
    .join("");
}
export function caesarDecrypt(cipher, shift) {
  return caesarEncrypt(cipher, -shift);
}

export function vigenereEncrypt(plain, key) {
  const P = lettersOnly(plain);
  const K = lettersOnly(key);
  if (!K) return P;
  return [...P]
    .map((ch, i) => {
      const s = alphabet.indexOf(K[i % K.length]);
      return alphabet[(alphabet.indexOf(ch) + s) % 26];
    })
    .join("");
}
export function vigenereDecrypt(cipher, key) {
  const C = lettersOnly(cipher);
  const K = lettersOnly(key);
  if (!K) return C;
  return [...C]
    .map((ch, i) => {
      const s = alphabet.indexOf(K[i % K.length]);
      return alphabet[(alphabet.indexOf(ch) - s + 26) % 26];
    })
    .join("");
}

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  const r = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= r; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}
function egcd(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = egcd(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}
function modInv(a, m) {
  const [g, x] = egcd(((a % m) + m) % m, m);
  if (g !== 1) return null;
  return ((x % m) + m) % m;
}
function modExp(base, exp, mod) {
  let r = 1n,
    b = BigInt(base) % BigInt(mod),
    e = BigInt(exp),
    m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) r = (r * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return r;
}
export function generateToyRSA() {
  const primes = [];
  for (let n = 11; n < 200; n++) {
    if (isPrime(n)) primes.push(n);
  }
  const p = primes[Math.floor(Math.random() * primes.length)];
  let q = p;
  while (q === p) {
    q = primes[Math.floor(Math.random() * primes.length)];
  }
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const es = [3, 5, 17, 257, 65537].filter(
    (e) => e < phi && egcd(e, phi)[0] === 1
  );
  const e = es[Math.floor(Math.random() * es.length)] ?? 3;
  const d = modInv(e, phi);
  return { p, q, n, phi, e, d };
}
export function rsaEncrypt(m, e, n) {
  return Number(modExp(BigInt(m), BigInt(e), BigInt(n)));
}
export function rsaDecrypt(c, d, n) {
  return Number(modExp(BigInt(c), BigInt(d), BigInt(n)));
}

/* ---------- Lattice drawing helper ---------- */
export function drawLattice(ctx, width, height, basis) {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#e5e7eb";
  for (let x = 0; x <= width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#9ca3af";
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  const origin = { x: width / 2, y: height / 2 };
  const toCanvas = (v) => ({ x: origin.x + v[0] * 20, y: origin.y - v[1] * 20 });

  ctx.fillStyle = "#1f2937";
  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) {
      const v = [
        i * basis[0][0] + j * basis[1][0],
        i * basis[0][1] + j * basis[1][1],
      ];
      const p = toCanvas(v);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  const b1 = toCanvas(basis[0]);
  const b2 = toCanvas(basis[1]);
  ctx.strokeStyle = "#2563eb";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(b1.x, b1.y);
  ctx.stroke();
  ctx.strokeStyle = "#16a34a";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(b2.x, b2.y);
  ctx.stroke();
}
