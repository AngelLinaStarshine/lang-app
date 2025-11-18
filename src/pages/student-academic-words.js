/* eslint-env es2020 */
import React, { useMemo, useState } from "react";

/**
 * STEP 1: Shared constants & helpers
 * ----------------------------------
 * We mirror the SUBJECTS + localStorage keys used elsewhere
 * (alt_courses_v1 for teacher lessons, alt_student_vocab_v1 for student vocab).
 */

const SUBJECTS = [
  { id: "literature", title: "Literature" },
  { id: "biology", title: "Biology" },
  { id: "history", title: "History" },
  { id: "it", title: "Information technology" },
];

const KEYS = {
  COURSES: "alt_courses_v1",         // teacher-created lessons, vocab, tests
  STUDENT_VOCAB: "alt_student_vocab_v1", // student-created vocab cards
  STUDENT_ID: "alt_student_id",
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

/**
 * Simple time utilities for the "Top 10 this week" and filters.
 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function withinWindow(timestamp, windowKey) {
  if (!timestamp || windowKey === "all") return true;
  const now = Date.now();
  const diff = now - timestamp;
  if (windowKey === "7d") return diff <= 7 * ONE_DAY_MS;
  if (windowKey === "30d") return diff <= 30 * ONE_DAY_MS;
  return true;
}

/**
 * STEP 2: Aggregate teacher & student vocabulary into one structure
 * -----------------------------------------------------------------
 * For each word we track:
 * - teacherCount: frequency from teacher auto-extracted vocab
 * - studentCount: how many times the student added it to their vocab cards
 * - subjects: set of subject IDs where it appears
 * - lessons: set of lesson scope keys
 * - firstTs / lastTs: approximate time range for when this word showed up
 */
function useAggregatedWords(studentId) {
  return useMemo(() => {
    const courses = loadJSON(KEYS.COURSES, {});
    const allStudentVocab = loadJSON(KEYS.STUDENT_VOCAB, {});
    const myVocab = allStudentVocab[studentId] || [];

    const wordMap = new Map();

    // --- 2A. Teacher-generated vocab across all subjects and lessons ---
    for (const [subjectId, subject] of Object.entries(courses)) {
      const lessons = subject?.lessons || [];
      for (const lesson of lessons) {
        const lessonNo = String(lesson.lessonNo || "");
        const scopeKey = `${subjectId}__${lessonNo}`;
        const createdAt = lesson.createdAt || null;
        const vocab = Array.isArray(lesson.vocab) ? lesson.vocab : [];

        for (const v of vocab) {
          const key = (v.word || "").toLowerCase().trim();
          if (!key) continue;
          let entry = wordMap.get(key);
          if (!entry) {
            entry = {
              word: key,
              displayWord: v.word || key,
              teacherCount: 0,
              studentCount: 0,
              subjects: new Set(),
              lessons: new Set(),
              firstTs: createdAt || null,
              lastTs: createdAt || null,
            };
            wordMap.set(key, entry);
          }
          entry.teacherCount += v.count || 1;
          entry.subjects.add(subjectId);
          entry.lessons.add(scopeKey);
          if (createdAt) {
            if (!entry.firstTs || createdAt < entry.firstTs) entry.firstTs = createdAt;
            if (!entry.lastTs || createdAt > entry.lastTs) entry.lastTs = createdAt;
          }
        }
      }
    }

    // --- 2B. Student-created vocab cards for THIS student ---
    for (const item of myVocab) {
      const key = (item.word || "").toLowerCase().trim();
      if (!key) continue;
      let entry = wordMap.get(key);
      const ts = item.ts || null;
      const [subjId] = (item.scopeKey || "").split("__");

      if (!entry) {
        entry = {
          word: key,
          displayWord: item.word || key,
          teacherCount: 0,
          studentCount: 0,
          subjects: new Set(),
          lessons: new Set(),
          firstTs: ts || null,
          lastTs: ts || null,
        };
        wordMap.set(key, entry);
      }

      entry.studentCount += 1;
      if (subjId) entry.subjects.add(subjId);
      if (item.scopeKey) entry.lessons.add(item.scopeKey);
      if (ts) {
        if (!entry.firstTs || ts < entry.firstTs) entry.firstTs = ts;
        if (!entry.lastTs || ts > entry.lastTs) entry.lastTs = ts;
      }
    }

    // --- 2C. Flatten map into an array with computed properties ---
    const allWords = Array.from(wordMap.values()).map((e) => ({
      ...e,
      subjectCount: e.subjects.size,
      lessonCount: e.lessons.size,
      totalCount: e.teacherCount + e.studentCount,
    }));

    return allWords;
  }, [studentId]);
}

/**
 * STEP 3: Main component UI
 * -------------------------
 * Shows:
 *  - Filters (subject + time window + cross-subject toggle)
 *  - "Top 10 academic words this week"
 *  - "Cross-subject words"
 *  - Full list table
 */

export default function MyAcademicWords() {
  // Which student's vocab to look at (same pattern as Notes/Vocab component)
  const [studentId] = useState(
    () => localStorage.getItem(KEYS.STUDENT_ID) || "student1"
  );

  // Filters
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all"); // all | 7d | 30d
  const [showCrossOnly, setShowCrossOnly] = useState(false);

  const aggregated = useAggregatedWords(studentId);

  // --- 3A. Apply filters to the global word list ---
  const filteredWords = useMemo(() => {
    return aggregated
      .filter((w) => {
        // subject filter
        if (subjectFilter !== "all" && !w.subjects.has(subjectFilter)) {
          return false;
        }
        // time filter (uses lastTs as a rough indicator)
        if (!withinWindow(w.lastTs || w.firstTs, timeFilter)) {
          return false;
        }
        // cross-subject toggle
        if (showCrossOnly && w.subjectCount < 2) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.totalCount - a.totalCount || a.word.localeCompare(b.word));
  }, [aggregated, subjectFilter, timeFilter, showCrossOnly]);

  // --- 3B. Top 10 academic words this week (ignores subject filter) ---
  const topThisWeek = useMemo(() => {
    const weekWords = aggregated
      .filter((w) => withinWindow(w.lastTs || w.firstTs, "7d"))
      .sort((a, b) => b.totalCount - a.totalCount || a.word.localeCompare(b.word));
    return weekWords.slice(0, 10);
  }, [aggregated]);

  // --- 3C. Cross-subject words (≥ 2 subjects) ---
  const crossSubjectWords = useMemo(() => {
    return aggregated
      .filter((w) => w.subjectCount >= 2)
      .sort((a, b) => b.subjectCount - a.subjectCount || b.totalCount - a.totalCount);
  }, [aggregated]);

  const totalWords = aggregated.length;

  return (
    <section className="mx-auto my-6 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      {/* Header */}
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            My Academic Words
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            This dashboard combines vocabulary from your{" "}
            <strong>courses</strong> and your own <strong>vocab cards</strong>{" "}
            to highlight key academic words across subjects.
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Student ID: <span className="font-mono">{studentId}</span>
          <br />
          Total tracked words: <span className="font-semibold">{totalWords}</span>
        </div>
      </header>

      {/* STEP 3D: Filters */}
      <div className="mb-4 grid gap-3 text-xs md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="flex flex-col">
          <span className="mb-1 font-medium text-slate-700 dark:text-slate-200">
            Filter by subject
          </span>
          <select
            className="rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="mb-1 font-medium text-slate-700 dark:text-slate-200">
            Time window
          </span>
          <select
            className="rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
            checked={showCrossOnly}
            onChange={(e) => setShowCrossOnly(e.target.checked)}
          />
          <span className="text-slate-700 dark:text-slate-200">
            Show cross-subject words only (≥ 2 subjects)
          </span>
        </label>
      </div>

      {/* STEP 3E: Top 10 this week */}
      <section className="mb-5 rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-xs dark:border-blue-900/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-200">
          Top 10 academic words this week
        </h3>
        {topThisWeek.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            No recent vocabulary yet. As teachers add lessons and you add vocab
            cards, your weekly highlights will appear here.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topThisWeek.map((w) => (
              <span
                key={w.word}
                className="inline-flex items-center rounded-full border border-blue-200 bg-white px-2 py-1 text-[11px] font-medium text-blue-900 shadow-sm dark:border-blue-800 dark:bg-slate-900"
              >
                {w.displayWord}
                <span className="ml-1 text-[10px] text-blue-500 dark:text-blue-300">
                  ({w.totalCount}× • {w.subjectCount} subj)
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* STEP 3F: Cross-subject words summary */}
      <section className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-xs dark:border-emerald-900/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          Cross-subject academic words
        </h3>
        {crossSubjectWords.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Once your courses share more vocabulary, words that appear in 2 or
            more subjects will show up here. These are powerful “transfer”
            words that help in many classes (e.g., analyze, interpret, compare).
          </p>
        ) : (
          <div className="mt-2 grid gap-1.5 md:grid-cols-2">
            {crossSubjectWords.slice(0, 12).map((w) => (
              <div
                key={w.word}
                className="rounded-lg border border-emerald-200 bg-white/80 px-2 py-1.5 text-[11px] shadow-sm dark:border-emerald-800 dark:bg-slate-900"
              >
                <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                  {w.displayWord}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                  Subjects:{" "}
                  {[...w.subjects]
                    .map((id) => subjectTitleFromId(id))
                    .join(", ")}
                  <span className="ml-2">
                    • total: {w.totalCount} ({w.teacherCount} teacher,{" "}
                    {w.studentCount} you)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* STEP 3G: Main filtered list */}
      <section className="rounded-xl border border-slate-200 bg-white/90 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            All academic words (after filters)
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Showing {filteredWords.length} word
            {filteredWords.length === 1 ? "" : "s"}
          </span>
        </div>

        {filteredWords.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            No words match your current filters yet. Try switching to “All
            subjects” or “All time”.
          </p>
        ) : (
          <div className="mt-1 max-h-64 overflow-auto rounded-lg border border-slate-100 dark:border-slate-800">
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
                    Total
                  </th>
                  <th className="border-b border-slate-200 px-2 py-1 text-right font-semibold dark:border-slate-700">
                    Teacher
                  </th>
                  <th className="border-b border-slate-200 px-2 py-1 text-right font-semibold dark:border-slate-700">
                    You
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.map((w) => (
                  <tr
                    key={w.word}
                    className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-900/70"
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
                      {w.totalCount}
                    </td>
                    <td className="border-b border-slate-100 px-2 py-1 text-right dark:border-slate-800">
                      {w.teacherCount}
                    </td>
                    <td className="border-b border-slate-100 px-2 py-1 text-right dark:border-slate-800">
                      {w.studentCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
