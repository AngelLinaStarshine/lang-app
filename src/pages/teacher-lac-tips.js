/* eslint-env es2020 */
import React, { useMemo, useState } from "react";

/**
 * TeacherLACTips
 * ---------------
 * A teacher-facing dashboard that:
 *  - Surfaces cross-subject academic vocabulary from your courses
 *  - Shows per-subject vocabulary “load”
 *  - Offers Language Across the Curriculum (LAC) professional-learning tips
 *    grounded in current research (Bunch, Garrison-Fletcher, McNair, Cummins, etc.)
 *
 * This is the “professional learning layer” on top of your existing
 * lesson + vocab generators.
 */

/* ---------- Shared constants ---------- */

const SUBJECTS = [
  { id: "literature", title: "Literature" },
  { id: "biology", title: "Biology" },
  { id: "history", title: "History" },
  { id: "it", title: "Information technology" },
];

const KEYS = {
  COURSES: "alt_courses_v1", // subjectId -> { subjectId, lessons: [...] }
};

function loadJSON(key, fb) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fb;
  } catch {
    return fb;
  }
}

function subjectTitleFromId(id) {
  return SUBJECTS.find((s) => s.id === id)?.title || id || "Unknown subject";
}

/* ---------- Aggregation hooks ---------- */

/**
 * Aggregate all teacher-generated vocabulary across subjects & lessons.
 * We assume each lesson.vocab is an array of { word, count } as in your generator.
 */
function useTeacherVocab() {
  return useMemo(() => {
    const courses = loadJSON(KEYS.COURSES, {});
    const wordMap = new Map();
    const subjectStats = new Map(); // subjectId -> { lessons, uniqueWords }

    for (const [subjectId, subject] of Object.entries(courses)) {
      const lessons = subject?.lessons || [];
      const subjectSet = subjectStats.get(subjectId) || {
        subjectId,
        lessonCount: 0,
        uniqueWords: new Set(),
      };

      for (const lesson of lessons) {
        subjectSet.lessonCount += 1;
        const lessonNo = String(lesson.lessonNo || "");
        const vocab = Array.isArray(lesson.vocab) ? lesson.vocab : [];
        const createdAt = lesson.createdAt || null;

        for (const v of vocab) {
          const key = (v.word || "").toLowerCase().trim();
          if (!key) continue;
          let entry = wordMap.get(key);
          if (!entry) {
            entry = {
              word: key,
              displayWord: v.word || key,
              totalCount: 0,
              subjects: new Set(),
              lessons: new Set(),
              firstTs: createdAt || null,
              lastTs: createdAt || null,
            };
            wordMap.set(key, entry);
          }
          entry.totalCount += v.count || 1;
          entry.subjects.add(subjectId);
          entry.lessons.add(`${subjectId}__${lessonNo}`);
          if (createdAt) {
            if (!entry.firstTs || createdAt < entry.firstTs) entry.firstTs = createdAt;
            if (!entry.lastTs || createdAt > entry.lastTs) entry.lastTs = createdAt;
          }

          subjectSet.uniqueWords.add(key);
        }
      }

      subjectStats.set(subjectId, subjectSet);
    }

    const allWords = Array.from(wordMap.values()).map((w) => ({
      ...w,
      subjectCount: w.subjects.size,
      lessonCount: w.lessons.size,
    }));

    const perSubject = Array.from(subjectStats.values()).map((s) => ({
      subjectId: s.subjectId,
      lessonCount: s.lessonCount,
      uniqueCount: s.uniqueWords.size,
    }));

    return { allWords, perSubject };
  }, []);
}

/* ---------- Main Component ---------- */

export default function TeacherLACTips() {
  const { allWords, perSubject } = useTeacherVocab();

  // Cross-subject “transfer” words (appear in ≥ 2 subjects)
  const crossSubjectWords = useMemo(
    () =>
      allWords
        .filter((w) => w.subjectCount >= 2)
        .sort(
          (a, b) =>
            b.subjectCount - a.subjectCount ||
            b.totalCount - a.totalCount ||
            a.word.localeCompare(b.word)
        ),
    [allWords]
  );

  // Top 10 cross-subject words for quick reference
  const topCross = crossSubjectWords.slice(0, 10);

  // Sort per-subject stats by subject name
  const subjectSummary = useMemo(
    () =>
      perSubject
        .slice()
        .sort((a, b) =>
          subjectTitleFromId(a.subjectId).localeCompare(
            subjectTitleFromId(b.subjectId)
          )
        ),
    [perSubject]
  );

  const [view, setView] = useState("overview"); // "overview" | "cross" | "subjects"

  const totalUnique = allWords.length;

  return (
    <section className="mx-auto my-6 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      {/* Header */}
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Language Across the Curriculum (LAC) — Teacher Tips
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            This view goes beyond auto-generated vocab. It helps you see{" "}
            <strong>how language behaves across your subjects</strong> and offers{" "}
            <strong>professional learning prompts</strong> for supporting
            community college English Learners (ELs).
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          <div>
            Unique academic words tracked:{" "}
            <span className="font-semibold">{totalUnique}</span>
          </div>
          <div className="mt-0.5">
            Cross-subject “transfer” words (≥2 subjects):{" "}
            <span className="font-semibold">{crossSubjectWords.length}</span>
          </div>
        </div>
      </header>

      {/* View toggle */}
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setView("overview")}
          className={`rounded-full px-3 py-1.5 ${
            view === "overview"
              ? "bg-indigo-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          }`}
        >
          LAC Overview & PD Prompts
        </button>
        <button
          type="button"
          onClick={() => setView("cross")}
          className={`rounded-full px-3 py-1.5 ${
            view === "cross"
              ? "bg-indigo-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          }`}
        >
          Cross-Subject Words
        </button>
        <button
          type="button"
          onClick={() => setView("subjects")}
          className={`rounded-full px-3 py-1.5 ${
            view === "subjects"
              ? "bg-indigo-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          }`}
        >
          Subject Vocabulary Load
        </button>
      </div>

      {view === "overview" && (
        <OverviewPanel
          topCross={topCross}
          crossSubjectWords={crossSubjectWords}
        />
      )}

      {view === "cross" && (
        <CrossSubjectPanel crossSubjectWords={crossSubjectWords} />
      )}

      {view === "subjects" && (
        <SubjectLoadPanel subjectSummary={subjectSummary} />
      )}
    </section>
  );
}

/* ---------- Subcomponents ---------- */

/**
 * Overview: PD layer + high-level “what to do with this”
 */
function OverviewPanel({ topCross, crossSubjectWords }) {
  return (
    <div className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
      {/* PD framing */}
      <section className="rounded-xl border border-amber-100 bg-amber-50/90 p-3 dark:border-amber-900/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
          From “mechanical LAC” → “pedagogical LAC”
        </h3>
        <p className="mt-1 leading-relaxed">
          Right now, the app already does <strong>mechanical LAC</strong>: every
          subject has explicit vocabulary, readings, and practice. What’s often
          missing (as Bunch, Garrison-Fletcher, McNair, and others note) is the{" "}
          <strong>professional learning layer</strong>:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            Helping faculty recognize academic language demands in{" "}
            <em>their own</em> courses (not just in English/ESL).
          </li>
          <li>
            Designing activities where language is <strong>taught</strong>, not
            just “noticed”.
          </li>
          <li>
            Treating linguistic diversity as an asset (translanguaging, L1
            support), not a problem to fix.
          </li>
        </ul>
        <p className="mt-2">
          This dashboard is a starting point: it shows you where academic
          vocabulary clusters so you can design{" "}
          <strong>cross-course language supports</strong> and{" "}
          <strong>faculty conversations</strong>.
        </p>
      </section>

      {/* Quick view of cross-subject words */}
      <section className="rounded-xl border border-emerald-100 bg-emerald-50/90 p-3 dark:border-emerald-900/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          Cross-subject “transfer” words in your data
        </h3>
        {crossSubjectWords.length === 0 ? (
          <p className="mt-2">
            Once multiple subjects share vocabulary, you’ll see those words
            here. These are excellent anchors for{" "}
            <strong>Language Across the Curriculum</strong> work.
          </p>
        ) : (
          <>
            <p className="mt-1">
              These words appear in <strong>two or more subjects</strong>. They
              are prime candidates for:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>
                Shared mini-lessons across departments (e.g., “What does
                <em> interpret</em> mean in{" "}
                <em>Literature vs. History vs. IT</em>?”).
              </li>
              <li>
                Writing frames and sentence starters that transfer across
                classes.
              </li>
              <li>
                Integrating “My Academic Words” student view into advising and
                tutoring.
              </li>
            </ul>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {topCross.map((w) => (
                <span
                  key={w.word}
                  className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-medium text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-slate-900"
                >
                  {w.displayWord}
                  <span className="ml-1 text-[10px] text-emerald-500 dark:text-emerald-300">
                    ({w.subjectCount} subj • {w.totalCount} hits)
                  </span>
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* PD prompts */}
      <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/80">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Professional-learning prompts you can act on
        </h3>
        <div className="mt-1 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-white/90 p-2 shadow-sm dark:bg-slate-900/90">
            <h4 className="text-[11px] font-semibold">
              1. Faculty conversation starter
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed">
              Take the <strong>top 5 cross-subject words</strong> and ask
              instructors: “What does this word look like in your assignments?
              How do you explain it to EL students?” This aligns with{" "}
              <em>Language Across the Curriculum</em> seminars (McNair &amp;
              Garrison-Fletcher).
            </p>
          </div>
          <div className="rounded-lg bg-white/90 p-2 shadow-sm dark:bg-slate-900/90">
            <h4 className="text-[11px] font-semibold">
              2. Build language into content tasks
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed">
              For each “transfer word” (e.g., <em>analyze, compare</em>), add a
              simple language objective: “Students will use{' '}
              <em>analyze</em> in a written sentence about today’s concept.”
              This mirrors Bunch et al.’s emphasis on explicit academic language
              support in non-ESL courses.
            </p>
          </div>
          <div className="rounded-lg bg-white/90 p-2 shadow-sm dark:bg-slate-900/90">
            <h4 className="text-[11px] font-semibold">
              3. Leverage multilingual repertoires
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed">
              Choose 3–4 key words and invite students to{" "}
              <strong>translate, explain, or give examples</strong> in their
              home languages before moving back to English. This follows
              Cummins’ argument for additive bilingualism and “language-friendly”
              institutions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Detailed cross-subject table
 */
function CrossSubjectPanel({ crossSubjectWords }) {
  if (crossSubjectWords.length === 0) {
    return (
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
        No cross-subject words yet. Once your Literature, History, IT, and other
        courses share more vocabulary, this view will help you find natural
        places for LAC collaboration.
      </p>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/80">
      <h3 className="mb-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
        Cross-subject academic words (appear in 2+ subjects)
      </h3>
      <p className="mb-2 text-[11px] text-slate-600 dark:text-slate-300">
        Use this to identify shared language demands across departments. These
        are ideal targets for shared rubrics, common sentence frames, and
        co-designed mini-lessons.
      </p>

      <div className="max-h-72 overflow-auto rounded-lg border border-slate-100 dark:border-slate-800">
        <table className="min-w-full border-collapse text-[11px]">
          <thead className="bg-slate-50/90 dark:bg-slate-900/90">
            <tr>
              <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold dark:border-slate-700">
                Word
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold dark:border-slate-700">
                Subjects
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right font-semibold dark:border-slate-700">
                # Subjects
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right font-semibold dark:border-slate-700">
                Total Count
              </th>
              <th className="border-b border-slate-200 px-2 py-1 text-right font-semibold dark:border-slate-700">
                # Lessons
              </th>
            </tr>
          </thead>
          <tbody>
            {crossSubjectWords.map((w) => (
              <tr
                key={w.word}
                className="odd:bg-white even:bg-slate-50/70 dark:odd:bg-slate-900 dark:even:bg-slate-900/70"
              >
                <td className="border-b border-slate-100 px-2 py-1 font-semibold dark:border-slate-800">
                  {w.displayWord}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 dark:border-slate-800">
                  {[...w.subjects]
                    .map((id) => subjectTitleFromId(id))
                    .join(", ")}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right dark:border-slate-800">
                  {w.subjectCount}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right dark:border-slate-800">
                  {w.totalCount}
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-right dark:border-slate-800">
                  {w.lessonCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Per-subject vocabulary load summary
 */
function SubjectLoadPanel({ subjectSummary }) {
  if (!subjectSummary.length) {
    return (
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
        No lessons found yet. Once you start saving lessons with vocab, this
        view will show how much academic language each subject is carrying.
      </p>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/80">
      <h3 className="mb-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
        Subject vocabulary load
      </h3>
      <p className="mb-2 text-[11px] text-slate-600 dark:text-slate-300">
        This helps you notice where EL students may face{" "}
        <strong>heavy language demands</strong>. You can use it to guide
        scheduling of supports (tutoring, writing center, co-requisite ESL) and
        to talk with faculty about <em>reasonable</em> vocabulary expectations.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {subjectSummary.map((s) => (
          <div
            key={s.subjectId}
            className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">
              {subjectTitleFromId(s.subjectId)}
            </div>
            <div className="mt-1 text-[11px] text-slate-700 dark:text-slate-300">
              Lessons with vocab:{" "}
              <span className="font-semibold">{s.lessonCount}</span>
              <br />
              Unique academic words:{" "}
              <span className="font-semibold">{s.uniqueCount}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
              PD Prompt:
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>
                  If this subject has <strong>many</strong> unique words, can we
                  identify the <em>top 10 “must have”</em> for this term?
                </li>
                <li>
                  If it has <strong>few</strong> words, could we make them more
                  visible via sentence frames and examples?
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
