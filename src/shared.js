/* eslint-env es2020 */
import React from "react";

export const i18n = {
  en: {
    appTitle: "PQC in Grade 10–11 Mathematics & Computing (MA)",
    learn: "Learn",
    learningPath: "Learning Path",
    assess: "Assess",
    resources: "Resources",
    language: "Language",
    standards: "Ontario • PQC • AES/GCM",
    heroBlurb:
      "Explore how math and computing protect our digital world — from Caesar ciphers to CRYSTALS-Kyber.",
    start: "Start Learning Path",
  },
  es: {
    appTitle: "PQC en Matemáticas y Computación (Gr. 10–11)",
    learn: "Aprender",
    learningPath: "Ruta de Aprendizaje",
    assess: "Evaluar",
    resources: "Recursos",
    language: "Idioma",
    standards: "Ontario • PQC • AES/GCM",
    heroBlurb:
      "Explora cómo las matemáticas y la computación protegen el mundo digital: de César a CRYSTALS-Kyber.",
    start: "Comenzar Ruta",
  },
};

export function DarkToggle() {
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };
  return (
    <button
      onClick={toggle}
      className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-800 shadow-sm hover:bg-white active:scale-[.98] dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200"
      title="Toggle dark mode"
      type="button"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}

export function Chip({ icon: Icon, className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${className}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}
