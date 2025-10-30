// src/pages/access.js
/* eslint-env es2020 */

import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Globe2,
  Upload,
  FileText,
  FileType2,
  Film,
  ExternalLink,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import {
  addFile,
  addLink,
  fileToDataUrl,
  getTopicResources,
  removeItem,
  uid,
} from "../utils/resourceStore";



// Topics (match your Learn cards)
const TOPICS = [
  { id: "classical", title: "Classical Cryptography" },
  { id: "rsa", title: "Modern Public-Key (RSA)" },
  { id: "quantum", title: "Quantum Threat" },
  { id: "lattice-kyber", title: "Lattice & Kyber" },
  { id: "ethics", title: "Ethics & Society" },
];

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
      </div>
      <div className="text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}

function FileList({ items, onDelete }) {
  if (!items?.length) return <p className="text-sm text-slate-500">No items yet.</p>;
  return (
    <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-2">
            <FileType2 className="h-4 w-4" />
            <span className="font-medium">{it.name || it.title}</span>
            {it.url && (
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> open
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {it.dataUrl && (
              <a
                href={it.dataUrl}
                download={it.name || "file"}
                className="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Download
              </a>
            )}
            <button
              onClick={() => onDelete(it.id)}
              className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-600/40 dark:hover:bg-red-900/20"
              aria-label={`Delete ${it.name || it.title}`}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AccessTeacher() {
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const [, forceRender] = useState(0); // local re-render helper

  // Always returns a safe, fully shaped object (thanks to resourceStore guards)
  const data = useMemo(() => getTopicResources(topicId), [topicId]);

  async function handleUpload(bucket, acceptExts) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptExts.join(",");
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      for (const f of files) {
        const ext = "." + f.name.split(".").pop().toLowerCase();
        if (!acceptExts.includes(ext)) {
          alert(`File type not allowed: ${ext}`);
          continue;
        }
        const dataUrl = await fileToDataUrl(f);
        addFile(topicId, bucket, {
          id: uid(),
          name: f.name,
          mime: f.type || "application/octet-stream",
          dataUrl,
          uploadedAt: Date.now(),
        });
      }
      // re-render
      forceRender((x) => x + 1);
    };
    input.click();
  }

  function handleAddVideoLink() {
    const url = prompt("Paste YouTube or MP4 URL:");
    if (!url) return;
    const title = prompt("Optional title:");
    addLink(topicId, "video", {
      id: uid(),
      url,
      title: title || url,
      uploadedAt: Date.now(),
    });
    forceRender((x) => x + 1);
  }

  function handleAddWhiteboard() {
    const url = prompt("Paste your online whiteboard URL (e.g., Excalidraw, Miro):");
    if (!url) return;
    const title = prompt("Whiteboard name (for students):", "Class Whiteboard");
    addLink(topicId, "whiteboard", {
      id: uid(),
      url,
      title: title || "Whiteboard",
      uploadedAt: Date.now(),
    });
    forceRender((x) => x + 1);
  }

  function del(bucket, id) {
    removeItem(topicId, bucket, id);
    forceRender((x) => x + 1);
  }

  const topicTitle = TOPICS.find((t) => t.id === topicId)?.title || "Topic";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold">Teacher: Upload &amp; Manage Resources</h1>
        </div>
        <div className="inline-flex items-center gap-2 text-sm">
          <Globe2 className="h-4 w-4" />
          <label htmlFor="topicSelect" className="sr-only">
            Select Topic
          </label>
          <select
            id="topicSelect"
            aria-label="Select topic to manage uploads"
            className="rounded-lg border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
        Managing resources for: <b>{topicTitle}</b>. Students will see these under the <i>Resources</i> tab.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lecture Notes (DOC/DOCX) */}
        <Section title="Lecture Notes (Word)" icon={FileText}>
          <p className="text-sm">
            Upload <code>.doc</code> or <code>.docx</code>. Students can add their own notes and download as Word later.
          </p>
          <div className="mt-3">
            <button
              onClick={() => handleUpload("lecture", [".doc", ".docx"])}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Upload lecture notes"
            >
              <Upload className="h-4 w-4" /> Upload DOC/DOCX
            </button>
          </div>
          <FileList items={data.lecture} onDelete={(id) => del("lecture", id)} />
        </Section>

        {/* Guide Notes (PDF) */}
        <Section title="Guide Notes (PDF)" icon={FileText}>
          <p className="text-sm">Upload <code>.pdf</code> teacher/student guide notes.</p>
          <div className="mt-3">
            <button
              onClick={() => handleUpload("guide", [".pdf"])}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Upload guide notes"
            >
              <Upload className="h-4 w-4" /> Upload PDF
            </button>
          </div>
          <FileList items={data.guide} onDelete={(id) => del("guide", id)} />
        </Section>

        {/* Slides (PPT/PDF) */}
        <Section title="Slides (PPT/PDF)" icon={FileType2}>
          <p className="text-sm">
            Upload <code>.ppt</code>, <code>.pptx</code>, or <code>.pdf</code> slide decks.
          </p>
          <div className="mt-3">
            <button
              onClick={() => handleUpload("slides", [".ppt", ".pptx", ".pdf"])}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Upload slides"
            >
              <Upload className="h-4 w-4" /> Upload PPT/PDF
            </button>
          </div>
          <FileList items={data.slides} onDelete={(id) => del("slides", id)} />
        </Section>

        {/* Video (MP4 Upload or YouTube Link) */}
        <Section title="Video (MP4 / YouTube)" icon={Film}>
          <p className="text-sm">Upload an <code>.mp4</code> or add a YouTube/Vimeo link.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleUpload("video", [".mp4"])}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Upload MP4 video"
            >
              <Upload className="h-4 w-4" /> Upload MP4
            </button>
            <button
              onClick={handleAddVideoLink}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Add video link"
            >
              <LinkIcon className="h-4 w-4" /> Add Link
            </button>
          </div>
          <FileList items={data.video} onDelete={(id) => del("video", id)} />
        </Section>

        {/* Whiteboard (online link with accessibility) */}
        <Section title="Whiteboard (Online)" icon={LinkIcon}>
          <p className="text-sm">
            Paste an online whiteboard link (e.g., Excalidraw, Miro, Whiteboard.chat). Include built-in accessibility (zoom, keyboard navigation, high contrast).
          </p>
          <div className="mt-3">
            <button
              onClick={handleAddWhiteboard}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Add whiteboard link"
            >
              <LinkIcon className="h-4 w-4" /> Add Whiteboard Link
            </button>
          </div>
          <FileList items={data.whiteboard} onDelete={(id) => del("whiteboard", id)} />
          <details className="mt-3 text-xs text-slate-500">
            <summary className="cursor-pointer">Accessibility tips for whiteboards</summary>
            <ul className="ml-5 list-disc">
              <li>Provide alt-text or captions for static images.</li>
              <li>Ensure keyboard shortcuts for pan/zoom; avoid drag-only interactions.</li>
              <li>Use high-contrast color palette; avoid color-only meaning.</li>
            </ul>
          </details>
        </Section>
      </div>
    </div>
  );
}
