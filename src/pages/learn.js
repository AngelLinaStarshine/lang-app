/* eslint-env es2020 */
import React from "react";

const blockWrap =
  "rounded-3xl p-1 ring-2 bg-gradient-to-br backdrop-blur-md shadow transition-transform duration-300 hover:scale-[1.01]";
const blockCard = "rounded-[1.3rem] bg-white/85 p-5 animate-[fadeUp_350ms_ease-out]";

const blocks = [
  {
    id: "b1",
    title: "Block 1 — Classical Ciphers",
    ring: "ring-pink-300",
    grad: "from-pink-200/80 via-rose-200/70 to-purple-200/70",
    textGrad:
      "bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent",
    body: [
      "Caesar & Vigenère recap",
      "Frequency analysis intuition",
      "Why modern crypto left them behind",
    ],
  },
  {
    id: "b2",
    title: "Block 2 — Block Ciphers & Modes",
    ring: "ring-yellow-300",
    grad: "from-yellow-200/80 via-amber-200/70 to-orange-200/70",
    textGrad:
      "bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent",
    body: ["AES basics", "ECB vs CBC vs CTR", "Authenticated encryption (GCM)"],
  },
  {
    id: "b3",
    title: "Block 3 — Stream Ciphers",
    ring: "ring-blue-300",
    grad: "from-blue-200/80 via-sky-200/70 to-cyan-200/70",
    textGrad:
      "bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent",
    body: ["ChaCha20 overview", "Nonce hygiene", "Throughput vs latency tradeoffs"],
  },
  {
    id: "b4",
    title: "Block 4 — PQC Primer",
    ring: "ring-green-300",
    grad: "from-green-200/80 via-emerald-200/70 to-lime-200/70",
    textGrad:
      "bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 bg-clip-text text-transparent",
    body: ["Lattices in brief", "CRYSTALS-Kyber (KEM)", "Migration strategies"],
  },
];

export default function Learn() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {blocks.map((b, i) => (
        <div
          key={b.id}
          className={`${blockWrap} ${b.ring} ${"bg-gradient-to-br " + b.grad}`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className={blockCard}>
            <h3 className={`text-lg font-extrabold ${b.textGrad}`}>{b.title}</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-800">
              {b.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
