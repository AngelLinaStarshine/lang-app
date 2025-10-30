/* eslint-env es2020 */
import React, { useEffect, useMemo, useState } from "react";

const tabStyles = {
  base: "rounded-full px-4 py-2 text-sm shadow-sm ring-2 transition font-bold",
  active:
    "bg-gradient-to-r from-pink-400 via-yellow-300 to-blue-400 text-slate-900 ring-transparent",
  idle:
    "bg-white/80 text-slate-800 ring-pink-200 hover:shadow hover:ring-yellow-300",
};

function Panel({ children, colorClass }) {
  return (
    <div className={`rounded-3xl p-1 ring-2 ${colorClass}`}>
      <div className="rounded-[1.3rem] bg-white/80 p-5 backdrop-blur-md animate-[fadeUp_350ms_ease-out]">
        {children}
      </div>
    </div>
  );
}

export default function LearningPath({ role = "student" }) {
  const [section, setSection] = useState("study");
  const [notes, setNotes] = useState("");
  const [glossary, setGlossary] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pqc_glossary") || "[]");
    } catch {
      return [];
    }
  });
  const [term, setTerm] = useState("");
  const [defn, setDefn] = useState("");

  useEffect(() => {
    const key = `pqc_notes_${role}`;
    const saved = localStorage.getItem(key);
    if (saved) setNotes(saved);
  }, [role]);

  useEffect(() => {
    const key = `pqc_notes_${role}`;
    localStorage.setItem(key, notes || "");
  }, [notes, role]);

  useEffect(() => {
    localStorage.setItem("pqc_glossary", JSON.stringify(glossary));
  }, [glossary]);

  const tabs = useMemo(
    () => [
      { id: "study", label: "Study" },
      { id: "active", label: "Active Material" },
      { id: "notes", label: "Notes" },
      { id: "glossary", label: "Glossary" },
    ],
    []
  );

  return (
    <div id="learning-path" className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = section === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className={`${tabStyles.base} ${active ? tabStyles.active : tabStyles.idle}`}
              type="button"
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      {section === "study" && (
        <Panel colorClass="ring-pink-300 bg-gradient-to-br from-pink-300/50 via-rose-200/50 to-purple-200/50">
          <h3 className="text-lg font-extrabold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            Study
          </h3>
          <p className="mt-2 text-sm text-slate-800">
            Objectives, success criteria, and a breezy overview. Keep it punchy and fun.
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-800">
            <li>Objective: Differentiate CTR vs GCM vs ChaCha20-Poly1305.</li>
            <li>Watch: 3-min micro-video.</li>
            <li>Try: Encrypt a short text and compare outputs.</li>
          </ul>
        </Panel>
      )}

      {section === "active" && (
        <Panel colorClass="ring-yellow-300 bg-gradient-to-br from-yellow-200/60 via-amber-200/60 to-orange-200/60">
          <h3 className="text-lg font-extrabold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            Active Material
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <button
              className="text-left rounded-2xl border-2 border-yellow-300 bg-white/80 p-4 text-sm text-slate-800 hover:shadow-lg hover:border-orange-300 transition"
              type="button"
              onClick={() => {}}
            >
              • Scenario sort: Pick safe/unsafe modes by context
            </button>
            <button
              className="text-left rounded-2xl border-2 border-yellow-300 bg-white/80 p-4 text-sm text-slate-800 hover:shadow-lg hover:border-orange-300 transition"
              type="button"
              onClick={() => {}}
            >
              • Reading: AEAD essentials (GCM, ChaCha20-Poly1305)
            </button>
          </div>
        </Panel>
      )}

      {section === "notes" && (
        <Panel colorClass="ring-blue-300 bg-gradient-to-br from-blue-200/60 via-sky-200/60 to-cyan-200/60">
          <h3 className="text-lg font-extrabold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
            Notes
          </h3>
          <p className="mt-2 text-xs text-slate-700">
            Auto-saves per role: <code className="font-mono">{role}</code>
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your colorful genius here…"
            className="mt-3 h-48 w-full rounded-2xl border-2 border-blue-300 bg-white/80 p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Panel>
      )}

      {section === "glossary" && (
        <Panel colorClass="ring-green-300 bg-gradient-to-br from-green-200/60 via-emerald-200/60 to-lime-200/60">
          <h3 className="text-lg font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
            Glossary
          </h3>

          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Term"
              className="rounded-xl border-2 border-green-300 bg-white/80 p-2 text-sm"
            />
            <input
              value={defn}
              onChange={(e) => setDefn(e.target.value)}
              placeholder="Definition"
              className="rounded-xl border-2 border-green-300 bg-white/80 p-2 text-sm"
            />
            <button
              onClick={() => {
                if (!term.trim() || !defn.trim()) return;
                setGlossary((g) => [
                  ...g,
                  { id: (crypto?.randomUUID?.() ?? String(Date.now() + Math.random())), term: term.trim(), defn: defn.trim() },
                ]);
                setTerm("");
                setDefn("");
              }}
              className="rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 px-4 py-2 text-sm font-bold text-white shadow hover:brightness-105 active:scale-95"
              type="button"
            >
              Add
            </button>
          </div>

          <ul className="mt-4 divide-y divide-green-200">
            {glossary.length === 0 && (
              <li className="py-3 text-sm text-slate-700">No terms yet. Add your first one!</li>
            )}
            {glossary.map((g) => (
              <li key={g.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-extrabold text-emerald-700">{g.term}</p>
                  <p className="text-sm text-slate-800">{g.defn}</p>
                </div>
                <button
                  onClick={() => setGlossary((list) => list.filter((x) => x.id !== g.id))}
                  className="rounded-lg border-2 border-green-300 bg-white/80 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
