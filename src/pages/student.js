/* eslint-env es2020 */
import React, { useEffect, useMemo, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import MyAcademicWords from "./student-academic-words";
import { highlightCommandWords } from "../utils/commandWords";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/* ----- shared keys & subjects (match teacher) ----- */
const KEYS = {
  COURSES: "alt_courses_v1", // subjectId -> { subjectId, lessons:[...] }
  NOTES: "alt_student_notes_v1",
  VOCAB: "alt_student_vocab_v1",
};

const SUBJECTS = [
  { id: "literature", title: "Literature" },
  { id: "biology", title: "Biology" },
  { id: "history", title: "History" },
  { id: "it", title: "Information technology" },
];

/* ----- tiny LS helpers ----- */
function load(key, fb) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fb;
  } catch {
    return fb;
  }
}
function save(key, v) {
  localStorage.setItem(key, JSON.stringify(v));
}
function prettySize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

/* ---------- Lesson header ---------- */
function LessonHeader({ subjectId, lesson }) {
  const subjectTitle = SUBJECTS.find((s) => s.id === subjectId)?.title || "Subject";
  if (!lesson) return null;
  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="text-sm text-slate-500">{subjectTitle}</div>
      <h2 className="text-lg font-semibold">
        Lesson {lesson.lessonNo}: {lesson.topic || <span className="opacity-60">Untitled</span>}
      </h2>
    </div>
  );
}

/* ---------- Materials viewer (files, video, whiteboard) ---------- */
function LessonMaterials({ lesson }) {
  const groups = useMemo(() => {
    const src = lesson?.resources ?? [];
    const byCat = {};
    for (const r of src) {
      const k = r.category || "Unit material";
      (byCat[k] = byCat[k] || []).push(r);
    }
    return byCat;
  }, [lesson]);

  const kindLabel = (k) =>
    k === "notes" ? "Lecture files" : k === "video" ? "Video" : "Whiteboard/Miro";

  const hasAny = Object.keys(groups).length > 0;

  return (
    <section className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <h3 className="text-base font-semibold">Class Materials</h3>

      {!lesson ? (
        <p className="mt-2 text-sm text-slate-500">Select a subject and lesson to view materials.</p>
      ) : !hasAny ? (
        <p className="mt-2 text-sm text-slate-500">No materials uploaded for this lesson yet.</p>
      ) : (
        Object.entries(groups).map(([cat, arr]) => (
          <div key={cat} className="mt-4">
            <h4 className="text-sm font-semibold">{cat}</h4>
            <ul className="mt-2 space-y-2">
              {arr.map((r, i) => (
                <li key={i} className="rounded-lg border p-3 text-sm dark:border-slate-700">
                  <div className="mb-1 text-xs opacity-70">{kindLabel(r.kind)}</div>

                  {r.kind === "notes" &&
                    (r.files?.length ? (
                      <ul className="list-disc pl-4">
                        {r.files.map((f, fi) => (
                          <li key={fi} className="flex items-center gap-2">
                            <a
                              className="underline truncate"
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {f.name}
                            </a>
                            <span className="text-xs opacity-60">
                              ({prettySize(f.size)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-slate-500">No files attached.</div>
                    ))}

                  {r.kind === "video" && (
                    <a
                      className="underline break-all"
                      href={r.videoLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.videoLink || "—"}
                    </a>
                  )}

                  {r.kind === "whiteboard" && (
                    <a
                      className="underline break-all"
                      href={r.whiteboardLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.whiteboardLink || "—"}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}

/* ====== Auto-generate “Reference Text → Vocabulary & Practice” from lesson files ====== */

const STOP = new Set(
  "a,an,the,and,or,of,to,in,on,for,with,by,as,at,from,that,this,these,those,be,is,are,was,were,been,has,have,had,it,its,into,over,under,between,among,not,no,yes,if,then,but,also,more,most,very,can,could,should,would,may,might,will,just,than,so,such,per,each,which,who,whom,whose,what,when,where,why,how".split(
    ","
  )
);

function extractVocab(text) {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 5 && !STOP.has(w));
  const map = new Map();
  for (const w of words) map.set(w, (map.get(w) || 0) + 1);
  return Array.from(map.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}
function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function buildTests(text, vocab) {
  const top = (text || "").split(/\s+/).length > 40 ? vocab.slice(0, 6) : vocab.slice(0, 3);
  const items = [];

  if (text) {
    for (let i = 0; i < Math.min(3, top.length); i++) {
      const w = top[i]?.word;
      if (!w) continue;
      const re = new RegExp(`\\b${w}\\b`, "i");
      const match = text.match(new RegExp(`[^.!?]*${w}[^.!?]*[.!?]`, "i"));
      const sentence = match ? match[0] : text.slice(0, 160) + "…";
      items.push({ type: "cloze", prompt: sentence.replace(re, "____"), answer: w });
    }
  }

  const pool = top.map((v) => v.word);
  for (let i = 0; i < Math.min(3, top.length); i++) {
    const w = top[i]?.word;
    if (!w) continue;
    const distractors = shuffle(pool.filter((x) => x !== w)).slice(0, 3);
    const choices = shuffle([w, ...distractors]);
    items.push({
      type: "mc",
      prompt: "Pick the best-fit term for the context (from the reading).",
      choices,
      answer: w,
    });
  }
  return items;
}

async function readPdfFromURL(url) {
  const res = await fetch(url);
  const data = await res.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n\n";
  }
  return text.trim();
}
async function readTxtFromURL(url) {
  const res = await fetch(url);
  const text = await res.text();
  return text.trim();
}

/* ---------- Interactive practice component ---------- */
function LessonPracticeAuto({ subjectId, lesson }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | empty | error
  const [err, setErr] = useState("");
  const [refText, setRefText] = useState("");
  const [items, setItems] = useState([]);
  const [vocab, setVocab] = useState([]);

  // quiz state: per-item responses
  const [responses, setResponses] = useState({}); // { [index]: { selected, userAnswer, checked, correct } }

  useEffect(() => {
    let cancelled = false;
    setResponses({}); // reset quiz state when lesson changes

    async function run() {
      setErr("");

      if (!lesson) {
        setStatus("empty");
        setRefText("");
        setItems([]);
        setVocab([]);
        return;
      }

      // 1) Use existing generated practice if present
      if ((lesson.items?.length || 0) > 0 || (lesson.vocab?.length || 0) > 0 || lesson.refText) {
        if (!cancelled) {
          setRefText(lesson.refText || "");
          setItems(lesson.items || []);
          setVocab(lesson.vocab || []);
          setStatus("ready");
        }
        return;
      }

      // 2) Else build from uploaded “notes” files (prefer PDF, else TXT)
      const resources = lesson.resources || [];
      const noteFiles = resources.filter((r) => r.kind === "notes").flatMap((r) => r.files || []);

      const pdfs = noteFiles.filter(
        (f) => (f.type || "").includes("pdf") || (f.name || "").toLowerCase().endsWith(".pdf")
      );
      const txts = noteFiles.filter(
        (f) =>
          (f.type || "").includes("text/plain") ||
          (f.name || "").toLowerCase().endsWith(".txt")
      );

      const candidates = [...pdfs, ...txts];
      if (candidates.length === 0) {
        setStatus("empty");
        setRefText("");
        setItems([]);
        setVocab([]);
        return;
      }

      setStatus("loading");

      let text = "";
      try {
        const first = candidates[0];
        if (
          (first.name || "").toLowerCase().endsWith(".pdf") ||
          (first.type || "").includes("pdf")
        ) {
          text = await readPdfFromURL(first.url);
        } else {
          text = await readTxtFromURL(first.url);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setErr("Could not read the uploaded file (PDF/TXT).");
          setStatus("error");
        }
        return;
      }

      const v = extractVocab(text);
      const built = buildTests(text, v);

      // 3) Persist back into COURSES for this lesson so everyone sees the same
      try {
        const all = load(KEYS.COURSES, {});
        const subject = all[subjectId];
        if (subject && Array.isArray(subject.lessons)) {
          const idx = subject.lessons.findIndex(
            (l) =>
              String(l.lessonNo) ===
              String(lesson.lessonNo)
          );
          if (idx >= 0) {
            subject.lessons[idx] = {
              ...subject.lessons[idx],
              refText: text,
              vocab: v,
              items: built,
            };
            all[subjectId] = subject;
            save(KEYS.COURSES, all);
          }
        }
      } catch (e) {
        console.warn("Could not persist generated practice to COURSES:", e);
      }

      if (!cancelled) {
        setRefText(text);
        setVocab(v);
        setItems(built);
        setStatus("ready");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [subjectId, lesson]);

  // --- interaction handlers ---
  const handleChoiceClick = (index, choice) => {
    const q = items[index];
    if (!q) return;
    setResponses((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        selected: choice,
        checked: true,
        correct: choice === q.answer,
      },
    }));
  };

  const handleClozeInputChange = (index, value) => {
    setResponses((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        userAnswer: value,
        // don't mark checked/correct yet
      },
    }));
  };

  const handleClozeCheck = (index) => {
    const q = items[index];
    if (!q) return;
    const prev = responses[index] || {};
    const user = (prev.userAnswer || "").trim().toLowerCase();
    const correctAnswer = (q.answer || "").trim().toLowerCase();
    setResponses((all) => ({
      ...all,
      [index]: {
        ...prev,
        checked: true,
        correct: !!user && user === correctAnswer,
      },
    }));
  };

  return (
    <section className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <h3 className="text-base font-semibold">Reference Text → Vocabulary & Practice</h3>

      {status === "idle" && (
        <p className="mt-2 text-sm text-slate-500">Select a lesson to load practice…</p>
      )}
      {status === "loading" && (
        <p className="mt-2 text-sm text-slate-500">Preparing practice…</p>
      )}
      {status === "empty" && (
        <p className="mt-2 text-sm text-slate-500">
          No readable materials yet. Ask your teacher to upload a PDF, TXT, or set a reference
          text.
        </p>
      )}
      {status === "error" && <p className="mt-2 text-sm text-red-600">{err}</p>}

      {status === "ready" && (
        <>
          {refText ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium">
                Reference text (preview)
              </summary>
              <div className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded border p-2 text-xs leading-relaxed dark:border-slate-700">
                {highlightCommandWords(refText)}
              </div>
            </details>
          ) : null}

          {/* Interactive practice */}
          {items.length > 0 ? (
            <details className="mt-4" open>
              <summary className="cursor-pointer text-sm font-medium">
                Practice items ({items.length})
              </summary>
              <ul className="mt-2 list-decimal pl-5 text-sm space-y-3">
                {items.map((q, i) => {
                  const resp = responses[i] || {};
                  return (
                    <li key={i} className="mb-1">
                      {/* Prompt */}
                      <div className="mb-1">{highlightCommandWords(q.prompt)}</div>

                      {/* Cloze question */}
                      {q.type === "cloze" && (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <input
                            className="w-40 rounded-lg border border-slate-300 p-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            placeholder="Type the missing word"
                            value={resp.userAnswer || ""}
                            onChange={(e) =>
                              handleClozeInputChange(i, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => handleClozeCheck(i)}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95"
                          >
                            Check
                          </button>
                          {resp.checked && (
                            <span
                              className={
                                "text-xs font-semibold " +
                                (resp.correct ? "text-emerald-600" : "text-red-600")
                              }
                            >
                              {resp.correct
                                ? "Correct!"
                                : `Try again. Answer: ${q.answer}`}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Multiple choice */}
                      {q.type === "mc" && q.choices && (
                        <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                          {q.choices.map((c, ci) => {
                            const isSelected = resp.selected === c;
                            const isCorrect = c === q.answer;
                            let extraClass =
                              "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800";

                            if (resp.checked) {
                              if (isCorrect) {
                                extraClass =
                                  "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20";
                              } else if (isSelected && !isCorrect) {
                                extraClass =
                                  "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20";
                              }
                            }

                            return (
                              <button
                                key={ci}
                                type="button"
                                onClick={() => handleChoiceClick(i, c)}
                                className={
                                  "rounded border px-2 py-1 text-xs text-left dark:border-slate-700 " +
                                  extraClass
                                }
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* MC feedback text */}
                      {q.type === "mc" && resp.checked && (
                        <div
                          className={
                            "mt-1 text-xs font-semibold " +
                            (resp.correct ? "text-emerald-600" : "text-red-600")
                          }
                        >
                          {resp.correct
                            ? "Correct!"
                            : `Incorrect. The correct answer is: ${q.answer}`}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No practice items generated.</p>
          )}

          {vocab.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Top vocabulary ({vocab.length})
              </summary>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                {vocab.map((v) => (
                  <span
                    key={v.word}
                    className="rounded border px-2 py-1 dark:border-slate-700"
                  >
                    {v.word} · {v.count}
                  </span>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </section>
  );
}

/* ---------- Student personal notes & vocab (scoped to subject+lesson) ---------- */
function NotesAndVocab({ subjectId, lesson }) {
  const [studentId, setStudentId] = useState(
    () => localStorage.getItem("alt_student_id") || "student1"
  );

  const scopeKey = lesson ? `${subjectId}__${lesson.lessonNo}` : `${subjectId}__none`;

  // NOTES
  const notesAll = load(KEYS.NOTES, {});
  const myNotes = notesAll?.[studentId]?.[scopeKey] || [];
  const [noteDraft, setNoteDraft] = useState("");

  function addNote() {
    const text = noteDraft.trim();
    if (!text || !lesson) return;
    const next = { ...notesAll };
    next[studentId] = next[studentId] || {};
    next[studentId][scopeKey] = next[studentId][scopeKey] || [];
    next[studentId][scopeKey].push({ text, ts: Date.now() });
    save(KEYS.NOTES, next);
    setNoteDraft("");
  }

  // VOCAB
  const vocabAll = load(KEYS.VOCAB, {});
  const myVocab = (vocabAll?.[studentId] || []).filter((v) => v.scopeKey === scopeKey);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");

  function addVocab() {
    const w = word.trim();
    const d = definition.trim();
    if (!w || !d || !lesson) return;
    const next = { ...vocabAll };
    next[studentId] = next[studentId] || [];
    next[studentId].push({
      word: w,
      definition: d,
      example: example.trim(),
      scopeKey,
      ts: Date.now(),
    });
    save(KEYS.VOCAB, next);
    setWord("");
    setDefinition("");
    setExample("");
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-center gap-3">
        <label className="ml-0 text-sm font-medium">Student ID</label>
        <input
          className="w-44 rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          value={studentId}
          onChange={(e) => {
            const v = e.target.value.trim() || "student1";
            setStudentId(v);
            localStorage.setItem("alt_student_id", v);
          }}
        />
        <span className="ml-auto text-xs text-slate-500">
          {lesson
            ? `Notes & vocab for Lesson ${lesson.lessonNo}`
            : "Select a lesson to take notes"}
        </span>
      </div>

      {/* Notes UI */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold">My Notes</h3>
        <div className="mt-2 flex gap-2">
          <textarea
            className="h-24 flex-1 rounded-xl border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            placeholder={lesson ? "Write a quick note…" : "Select a lesson first"}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            disabled={!lesson}
          />
          <button
            onClick={addNote}
            className="h-10 self-end rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            type="button"
            disabled={!lesson}
          >
            Add
          </button>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {myNotes.length === 0 && <li className="text-slate-500">No notes yet.</li>}
          {myNotes
            .slice()
            .reverse()
            .map((n, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              >
                {n.text}
              </li>
            ))}
        </ul>
      </div>

      {/* Vocab UI */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold">Vocabulary</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <input
            className="rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            placeholder="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={!lesson}
          />
          <input
            className="rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            placeholder="Definition"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            disabled={!lesson}
          />
          <input
            className="rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            placeholder="Example (optional)"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            disabled={!lesson}
          />
        </div>
        <button
          onClick={addVocab}
          className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
          type="button"
          disabled={!lesson}
        >
          Add Term
        </button>

        <ul className="mt-3 space-y-2 text-sm">
          {myVocab.length === 0 && <li className="text-slate-500">No terms yet.</li>}
          {myVocab
            .slice()
            .reverse()
            .map((v, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              >
                <span className="font-bold">{v.word}</span> — {v.definition}
                {v.example ? (
                  <span className="text-slate-500"> (e.g., {v.example})</span>
                ) : null}
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function StudentPage() {
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);

  // Pull all lessons for the selected subject
  const lessons = useMemo(() => {
    const courses = load(KEYS.COURSES, {});
    const arr = (courses[subjectId]?.lessons || []).slice();
    arr.sort((a, b) => {
      const na = Number(a.lessonNo) || 0,
        nb = Number(b.lessonNo) || 0;
      return na - nb || (a.topic || "").localeCompare(b.topic || "");
    });
    return arr;
  }, [subjectId]);

  // Default-select the first lesson (if any)
  const [lessonNo, setLessonNo] = useState("");
  const [view, setView] = useState("lesson"); // "lesson" | "academicWords"

  useEffect(() => {
    setLessonNo(lessons[0]?.lessonNo || "");
  }, [lessons]);

  const currentLesson = useMemo(
    () => lessons.find((l) => String(l.lessonNo) === String(lessonNo)),
    [lessons, lessonNo]
  );

  return (
    <div className="space-y-6">
      {/* Subject + Lesson pickers */}
      <div className="mx-auto mt-6 flex w-full max-w-5xl flex-col gap-3 md:flex-row md:items-end">
        <label className="text-xs">
          Subject
          <select
            className="mt-1 w-64 rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs md:ml-3">
          Lesson #
          <select
            className="mt-1 w-40 rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={lessonNo}
            onChange={(e) => setLessonNo(e.target.value)}
            disabled={!lessons.length}
          >
            {lessons.length === 0 ? (
              <option value="">No lessons yet</option>
            ) : (
              lessons.map((l) => (
                <option key={l.lessonNo} value={l.lessonNo}>
                  {l.lessonNo}
                </option>
              ))
            )}
          </select>
        </label>

        {currentLesson?.topic && (
          <div className="md:ml-3 text-sm text-slate-600 dark:text-slate-300">
            Topic: <span className="font-medium">{currentLesson.topic}</span>
          </div>
        )}
      </div>

      {/* View toggle: This Lesson vs My Academic Words */}
      <div className="mx-auto flex w-full max-w-5xl gap-2 text-xs">
        <button
          type="button"
          onClick={() => setView("lesson")}
          className={
            "rounded-full px-3 py-1.5 " +
            (view === "lesson"
              ? "bg-emerald-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200")
          }
        >
          This Lesson
        </button>
        <button
          type="button"
          onClick={() => setView("academicWords")}
          className={
            "rounded-full px-3 py-1.5 " +
            (view === "academicWords"
              ? "bg-emerald-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200")
          }
        >
          My Academic Words
        </button>
      </div>

      {view === "lesson" ? (
        <>
          <LessonHeader subjectId={subjectId} lesson={currentLesson} />
          <LessonMaterials lesson={currentLesson} />
          <LessonPracticeAuto subjectId={subjectId} lesson={currentLesson} />
          <NotesAndVocab subjectId={subjectId} lesson={currentLesson} />
        </>
      ) : (
        <MyAcademicWords />
      )}
    </div>
  );
}
