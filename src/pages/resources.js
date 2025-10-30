/* eslint-env es2020 */
import React from "react";
import { motion } from "framer-motion";

/**
 * Usage:
 * <Learn role="student" />  // default
 * <Learn role="teacher" />
 */

const blockWrap =
  "rounded-3xl p-1 ring-2 bg-gradient-to-br backdrop-blur-md shadow";
const blockCard =
  "rounded-[1.3rem] bg-white/85 dark:bg-slate-900/60 p-5 ring-1 ring-black/0 dark:ring-white/5";

const blocks = [
  {
    id: "b1",
    title: "Block 1 — Classical Ciphers",
    // Student palette
    ringStudent: "ring-pink-300 dark:ring-pink-400/30",
    gradStudent:
      "from-pink-200/80 via-rose-200/70 to-purple-200/70 " +
      "dark:from-pink-400/10 dark:via-rose-300/10 dark:to-purple-400/10",
    textGradStudent:
      "bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 " +
      "dark:from-pink-300 dark:via-rose-300 dark:to-purple-300 bg-clip-text text-transparent",
    // Teacher palette
    ringTeacher: "ring-violet-300 dark:ring-violet-400/30",
    gradTeacher:
      "from-violet-200/80 via-indigo-200/70 to-fuchsia-200/70 " +
      "dark:from-violet-400/10 dark:via-indigo-300/10 dark:to-fuchsia-400/10",
    textGradTeacher:
      "bg-gradient-to-r from-violet-700 via-indigo-700 to-fuchsia-700 " +
      "dark:from-violet-300 dark:via-indigo-300 dark:to-fuchsia-300 bg-clip-text text-transparent",
    body: [
      "Caesar & Vigenère recap",
      "Frequency analysis intuition",
      "Why modern crypto left them behind",
    ],
  },
  {
    id: "b2",
    title: "Block 2 — Block Ciphers & Modes",
    ringStudent: "ring-yellow-300 dark:ring-amber-400/30",
    gradStudent:
      "from-yellow-200/80 via-amber-200/70 to-orange-200/70 " +
      "dark:from-yellow-400/10 dark:via-amber-300/10 dark:to-orange-400/10",
    textGradStudent:
      "bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 " +
      "dark:from-yellow-300 dark:via-amber-300 dark:to-orange-300 bg-clip-text text-transparent",

    ringTeacher: "ring-cyan-300 dark:ring-cyan-400/30",
    gradTeacher:
      "from-cyan-200/80 via-teal-200/70 to-emerald-200/70 " +
      "dark:from-cyan-400/10 dark:via-teal-300/10 dark:to-emerald-400/10",
    textGradTeacher:
      "bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700 " +
      "dark:from-cyan-300 dark:via-teal-300 dark:to-emerald-300 bg-clip-text text-transparent",
    body: ["AES basics", "ECB vs CBC vs CTR", "Authenticated encryption (GCM)"],
  },
  {
    id: "b3",
    title: "Block 3 — Stream Ciphers",
    ringStudent: "ring-blue-300 dark:ring-sky-400/30",
    gradStudent:
      "from-blue-200/80 via-sky-200/70 to-cyan-200/70 " +
      "dark:from-blue-400/10 dark:via-sky-300/10 dark:to-cyan-400/10",
    textGradStudent:
      "bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 " +
      "dark:from-blue-300 dark:via-sky-300 dark:to-cyan-300 bg-clip-text text-transparent",

    ringTeacher: "ring-rose-300 dark:ring-rose-400/30",
    gradTeacher:
      "from-rose-200/80 via-pink-200/70 to-red-200/70 " +
      "dark:from-rose-400/10 dark:via-pink-300/10 dark:to-red-400/10",
    textGradTeacher:
      "bg-gradient-to-r from-rose-700 via-pink-700 to-red-700 " +
      "dark:from-rose-300 dark:via-pink-300 dark:to-red-300 bg-clip-text text-transparent",
    body: ["ChaCha20 overview", "Nonce hygiene", "Throughput vs latency tradeoffs"],
  },
  {
    id: "b4",
    title: "Block 4 — PQC Primer",
    ringStudent: "ring-green-300 dark:ring-emerald-400/30",
    gradStudent:
      "from-green-200/80 via-emerald-200/70 to-lime-200/70 " +
      "dark:from-green-400/10 dark:via-emerald-300/10 dark:to-lime-400/10",
    textGradStudent:
      "bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 " +
      "dark:from-green-300 dark:via-emerald-300 dark:to-lime-300 bg-clip-text text-transparent",

    ringTeacher: "ring-slate-300 dark:ring-slate-400/30",
    gradTeacher:
      "from-slate-200/80 via-zinc-200/70 to-neutral-200/70 " +
      "dark:from-slate-400/10 dark:via-zinc-300/10 dark:to-neutral-400/10",
    textGradTeacher:
      "bg-gradient-to-r from-slate-700 via-zinc-700 to-neutral-700 " +
      "dark:from-slate-300 dark:via-zinc-300 dark:to-neutral-300 bg-clip-text text-transparent",
    body: ["Lattices in brief", "CRYSTALS-Kyber (KEM)", "Migration strategies"],
  },
];

export default function Learn({ role = "student" }) {
  const isTeacher = role === "teacher";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {blocks.map((b, i) => {
        const ring = isTeacher ? b.ringTeacher : b.ringStudent;
        const grad = isTeacher ? b.gradTeacher : b.gradStudent;
        const textGrad = isTeacher ? b.textGradTeacher : b.textGradStudent;

        return (
          <motion.div
            key={b.id}
            className={`${blockWrap} ${ring} ${grad}`}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <div className={blockCard}>
              <h3 className={`text-lg font-extrabold ${textGrad}`}>{b.title}</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-800 dark:text-slate-200">
                {b.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
