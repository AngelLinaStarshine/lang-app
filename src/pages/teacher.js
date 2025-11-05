/* eslint-env es2020 */
import React, { useMemo, useState } from "react";
import AccessTeacher from "./access";

// --- PDF.js setup (CRA-friendly, v3.11.174) ---
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
const { getDocument } = pdfjsLib;

/* ---------------------- subjects ---------------------- */
const SUBJECTS = [
  { id: "literature", title: "Literature" },
  { id: "dance", title: "Dance" },
  { id: "history", title: "History" },
  { id: "it", title: "Information technology" },
];

/* ------------------ tiny LS helpers ------------------ */
const KEYS = {
  COURSES: "alt_courses_v1", // subjectId -> { subjectId, lessons: [...] }
};
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

/* --------------- vocab + test builders --------------- */
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

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function readTxt(file) {
  const text = await file.text();
  return text.trim();
}

async function readPdf(file) {
  const data = await file.arrayBuffer();
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map((it) => it.str);
    fullText += strings.join(" ") + "\n\n";
  }
  return fullText.trim();
}

/* -------------------- lesson resources -------------------- */
const CATEGORIES = ["Syllabus", "Unit material", "Glossary", "Assessment"];

function makeEmptyResource() {
  return {
    kind: "notes", // "notes" | "video" | "whiteboard"
    files: [], // [{ name, type, url, size }]
    videoLink: "",
    whiteboardLink: "",
    category: "Unit material",
  };
}

function ResourceEditor({ resource, onChange }) {
  const [local, setLocal] = useState(resource);

  function update(patch) {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      name: f.name,
      type: f.type || guessMime(f.name),
      url: URL.createObjectURL(f),
      size: f.size,
    }));
    update({ files: [...(local.files || []), ...mapped] });
    e.target.value = "";
  }

  function removeFile(idx) {
    const next = (local.files || []).slice();
    try {
      URL.revokeObjectURL(next[idx].url);
    } catch {}
    next.splice(idx, 1);
    update({ files: next });
  }

  return (
    <div className="rounded-xl border p-3 dark:border-slate-700">
      <div className="grid gap-2 md:grid-cols-4">
        <label className="text-xs">
          Type
          <select
            className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={local.kind}
            onChange={(e) => update({ kind: e.target.value })}
          >
            <option value="notes">Lecture notes (files)</option>
            <option value="video">Video link</option>
            <option value="whiteboard">Whiteboard/Miro link</option>
          </select>
        </label>

        <label className="text-xs">
          Category
          <select
            className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={local.category}
            onChange={(e) => update({ category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {local.kind === "video" && (
          <label className="text-xs md:col-span-2">
            Video URL
            <input
              type="url"
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={local.videoLink}
              onChange={(e) => update({ videoLink: e.target.value.trim() })}
            />
          </label>
        )}

        {local.kind === "whiteboard" && (
          <label className="text-xs md:col-span-2">
            Whiteboard/Miro URL
            <input
              type="url"
              placeholder="https://miro.com/app/board/…"
              className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={local.whiteboardLink}
              onChange={(e) => update({ whiteboardLink: e.target.value.trim() })}
            />
          </label>
        )}
      </div>

      {local.kind === "notes" && (
        <div className="mt-3">
          <label className="text-xs block">
            Upload lecture files (Word/PDF/PPT)
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={handleFileInput}
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-white file:px-3 file:py-2 file:text-sm dark:file:border-slate-700 dark:file:bg-slate-800"
            />
          </label>

          {local.files?.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {local.files.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded border px-2 py-1 dark:border-slate-700">
                  <a href={f.url} target="_blank" rel="noreferrer" className="truncate">
                    {f.name} <span className="opacity-60">({prettySize(f.size)})</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-3 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function guessMime(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (lower.endsWith(".pptx"))
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
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

/* -------------------- Add / list lessons -------------------- */
function LessonManager() {
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
  const [lessonNo, setLessonNo] = useState("");
  const [lessonTopic, setLessonTopic] = useState("");
  const [resources, setResources] = useState([makeEmptyResource()]);
  const [message, setMessage] = useState("");

  // Reference Text editor state for the CURRENT subject+lesson
  const [refBusy, setRefBusy] = useState(false);
  const [refErr, setRefErr] = useState("");
  const [refText, setRefText] = useState("");

 // BEFORE
// const courses = useMemo(() => load(KEYS.COURSES, {}), [subjectId]);

// AFTER
const courses = useMemo(() => load(KEYS.COURSES, {}), []);

const lessonsForSubject = (courses[subjectId]?.lessons || [])
  .slice()
  .sort((a, b) => {
    const na = Number(a.lessonNo) || 0;
    const nb = Number(b.lessonNo) || 0;
    return na - nb || (a.topic || "").localeCompare(b.topic || "");
  });


  function hydrateRefFromSaved(newLessonNo) {
    const all = load(KEYS.COURSES, {});
    const subj = all[subjectId];
    if (!subj) return setRefText("");
    const found = subj.lessons?.find((l) => (l.lessonNo || "") === String(newLessonNo || ""));
    setRefText(found?.refText || "");
  }

  function resetForm() {
    setLessonNo("");
    setLessonTopic("");
    setResources([makeEmptyResource()]);
    setRefErr("");
    setRefText("");
  }

  function addResource() {
    setResources((prev) => [...prev, makeEmptyResource()]);
  }
  function updateResource(idx, patch) {
    setResources((prev) => {
      const next = prev.slice();
      next[idx] = patch;
      return next;
    });
  }
  function removeResource(idx) {
    setResources((prev) => prev.filter((_, i) => i !== idx));
  }

  function saveLesson() {
    if (!lessonNo || !lessonTopic) {
      setMessage("Please enter both Lesson # and Topic.");
      return;
    }
    const lesson = {
      lessonNo: String(lessonNo).trim(),
      topic: lessonTopic.trim(),
      refText: refText || "",
      resources: resources.map((r) => ({
        kind: r.kind,
        category: r.category,
        files: (r.files || []).map((f) => ({
          name: f.name,
          type: f.type,
          url: f.url,
          size: f.size,
        })),
        videoLink: r.videoLink?.trim() || "",
        whiteboardLink: r.whiteboardLink?.trim() || "",
      })),
      createdAt: Date.now(),
    };

    const all = load(KEYS.COURSES, {});
    const subject = all[subjectId] || { subjectId, lessons: [] };

    const idx = subject.lessons.findIndex((l) => (l.lessonNo || "") === lesson.lessonNo);
    if (idx >= 0) {
      const prev = subject.lessons[idx];
      subject.lessons[idx] = {
        ...prev,
        ...lesson,
        vocab: prev.vocab && lesson.refText === prev.refText ? prev.vocab : prev.vocab,
        items: prev.items && lesson.refText === prev.refText ? prev.items : prev.items,
      };
    } else {
      subject.lessons.push(lesson);
    }

    all[subjectId] = subject;
    save(KEYS.COURSES, all);
    setMessage(`Saved lesson ${lesson.lessonNo} – ${lesson.topic}`);
  }

  function clearSubject() {
    const all = load(KEYS.COURSES, {});
    delete all[subjectId];
    save(KEYS.COURSES, all);
    setMessage("Cleared all lessons for this subject.");
    resetForm();
  }

  async function handleRefFile(e) {
    setRefErr("");
    const file = e.target.files?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    try {
      setRefBusy(true);
      let extracted = "";
      if (lower.endsWith(".pdf")) {
        extracted = await readPdf(file);
      } else if (lower.endsWith(".txt")) {
        extracted = await readTxt(file);
      } else {
        setRefErr("Unsupported file type. Please choose a PDF or TXT.");
        return;
      }
      setRefText(extracted || "");
    } catch (ex) {
      console.error(ex);
      setRefErr("Could not extract text from the file.");
    } finally {
      setRefBusy(false);
      e.target.value = "";
    }
  }

  function generatePractice() {
    if (!lessonNo) {
      setRefErr("Enter a Lesson # first.");
      return;
    }
    const text = refText || "";
    const vocab = extractVocab(text);
    const items = buildTests(text, vocab);

    const all = load(KEYS.COURSES, {});
    const subject = all[subjectId] || { subjectId, lessons: [] };

    const idx = subject.lessons.findIndex((l) => (l.lessonNo || "") === String(lessonNo));
    if (idx >= 0) {
      subject.lessons[idx] = {
        ...subject.lessons[idx],
        refText: text,
        vocab,
        items,
      };
    } else {
      subject.lessons.push({
        lessonNo: String(lessonNo),
        topic: lessonTopic || "",
        refText: text,
        vocab,
        items,
        resources: [],
        createdAt: Date.now(),
      });
    }

    all[subjectId] = subject;
    save(KEYS.COURSES, all);
    setMessage(`Generated practice for lesson ${lessonNo}.`);
  }

  function clearRefAndPractice() {
    if (!lessonNo) return;
    const all = load(KEYS.COURSES, {});
    const subject = all[subjectId];
    if (!subject) return;

    const idx = subject.lessons.findIndex((l) => (l.lessonNo || "") === String(lessonNo));
    if (idx >= 0) {
      subject.lessons[idx].refText = "";
      subject.lessons[idx].vocab = [];
      subject.lessons[idx].items = [];
      all[subjectId] = subject;
      save(KEYS.COURSES, all);
    }
    setRefText("");
    setMessage(`Cleared reference text & practice for lesson ${lessonNo}.`);
  }

  return (
    <section className="mx-auto my-6 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <label className="text-xs">
            Subject
            <select
              className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTimeout(() => hydrateRefFromSaved(lessonNo), 0);
              }}
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
            <input
              type="number"
              inputMode="numeric"
              min="0"
              className="mt-1 w-28 rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={lessonNo}
              onChange={(e) => {
                setLessonNo(e.target.value);
                hydrateRefFromSaved(e.target.value);
              }}
              placeholder="e.g., 1"
            />
          </label>

          <label className="text-xs md:ml-3 md:w-96">
            Lesson Topic
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
              placeholder="e.g., Introduction to Algorithms"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveLesson}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save Lesson
          </button>
          <button
            type="button"
            onClick={clearSubject}
            className="rounded-xl border px-4 py-2 text-sm dark:border-slate-700"
          >
            Clear Subject
          </button>
        </div>
      </div>

      {message && <p className="mb-3 text-xs text-slate-600">{message}</p>}

      {/* Resources */}
      <div className="space-y-3">
        {resources.map((res, i) => (
          <div key={i} className="relative">
            <div className="absolute -right-2 -top-2">
              {resources.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeResource(i)}
                  className="rounded-full bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                >
                  ×
                </button>
              )}
            </div>
            <ResourceEditor resource={res} onChange={(next) => updateResource(i, next)} />
          </div>
        ))}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={addResource}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add another resource
        </button>
      </div>

      {/* Reference Text (per subject+lesson) */}
      <aside className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="mb-2 text-base font-semibold">Reference Text → Vocabulary & Practice</h3>

        <div className="mb-2 flex items-center gap-2">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleRefFile}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-white file:px-3 file:py-2 file:text-sm dark:file:border-slate-700 dark:file:bg-slate-800"
            aria-label="Upload PDF or TXT to auto-fill the reference text"
          />
          {refBusy && <span className="text-xs text-slate-500">Extracting text…</span>}
        </div>
        {refErr && <p className="mb-2 text-sm text-red-600">{refErr}</p>}

        <textarea
          className="mt-1 h-40 w-full rounded-xl border p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          placeholder={`Paste or upload ~1–3 paragraphs for ${
            SUBJECTS.find((s) => s.id === subjectId)?.title || "Subject"
          } — Lesson ${lessonNo || "?"}…`}
          value={refText}
          onChange={(e) => setRefText(e.target.value)}
        />

        <div className="mt-3 flex gap-2">
          <button
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={generatePractice}
            type="button"
          >
            Save & Generate
          </button>

        <button
            className="rounded-xl border px-4 py-2 text-sm dark:border-slate-700"
            onClick={clearRefAndPractice}
            type="button"
          >
            Clear ref/practice (this lesson)
          </button>
        </div>
      </aside>

      {/* Existing lessons list */}
      <LessonsList subjectId={subjectId} lessons={lessonsForSubject} />
    </section>
  );
}

function LessonsList({ subjectId, lessons }) {
  const subjectTitle = SUBJECTS.find((s) => s.id === subjectId)?.title || "Subject";
  if (!lessons.length) {
    return <p className="mt-4 text-sm text-slate-500">No lessons saved yet for {subjectTitle}.</p>;
  }
  return (
    <details className="mt-6">
      <summary className="cursor-pointer text-sm font-semibold">
        {subjectTitle} — {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
      </summary>
      <ul className="mt-2 space-y-3">
        {lessons.map((l, idx) => (
          <li key={idx} className="rounded-xl border p-3 text-sm dark:border-slate-700">
            <div className="mb-2 font-medium">
              Lesson {l.lessonNo}: {l.topic || <span className="opacity-60">Untitled</span>}
            </div>

            {/* Ref text + practice */}
            <details className="mb-2">
              <summary className="cursor-pointer text-xs font-semibold">Reference & Practice</summary>
              <div className="mt-2 space-y-2">
                <div className="text-xs opacity-70">{l.refText ? "Reference text" : "No reference text saved."}</div>
                {l.refText && (
                  <div className="rounded border p-2 text-xs leading-relaxed dark:border-slate-700 max-h-40 overflow-auto whitespace-pre-wrap">
                    {l.refText}
                  </div>
                )}

                {Array.isArray(l.items) && l.items.length > 0 ? (
                  <div>
                    <div className="mt-2 text-xs opacity-70">Generated items ({l.items.length})</div>
                    <ul className="mt-1 list-decimal pl-5">
                      {l.items.map((q, i) => (
                        <li key={i} className="mb-1">
                          {q.prompt}
                          {q.choices && (
                            <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                              {q.choices.map((c, ci) => (
                                <span key={ci} className="rounded border px-2 py-1 text-xs dark:border-slate-700">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No practice generated yet.</div>
                )}
              </div>
            </details>

            {/* Resource list */}
            {l.resources?.length ? (
              <div className="space-y-2">
                {l.resources.map((r, i) => (
                  <div key={i} className="rounded border p-2 dark:border-slate-700">
                    <div className="mb-1 text-xs opacity-70">
                      {r.category} • {r.kind === "notes" ? "Lecture files" : r.kind === "video" ? "Video" : "Whiteboard/Miro"}
                    </div>
                    {r.kind === "notes" && (r.files?.length ? (
                      <ul className="list-disc pl-4">
                        {r.files.map((f, fi) => (
                          <li key={fi}>
                            <a className="underline" href={f.url} target="_blank" rel="noreferrer">
                              {f.name}
                            </a>{" "}
                            <span className="opacity-60">({prettySize(f.size)})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-slate-500">No files attached.</div>
                    ))}
                    {r.kind === "video" && (
                      <a className="underline break-all" href={r.videoLink} target="_blank" rel="noreferrer">
                        {r.videoLink || "—"}
                      </a>
                    )}
                    {r.kind === "whiteboard" && (
                      <a className="underline break-all" href={r.whiteboardLink} target="_blank" rel="noreferrer">
                        {r.whiteboardLink || "—"}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500">No resources for this lesson.</div>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ------------------------------- Page ------------------------------- */
export default function TeacherPage() {
  return (
    <>
      <AccessTeacher />
      <LessonManager />
    </>
  );
}
