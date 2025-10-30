// src/pages/resources.js
/* eslint-env es2020 */

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Globe2,
  ExternalLink,
  Download,
  FileText,
  FileType2,
  Film,
  Link as LinkIcon,
} from "lucide-react";
import {
  getTopicResources,
  getNotes,
  setNotes,
} from "../utils/resourceStore";



const TOPICS = [
  { id: "classical", title: "Classical Cryptography" },
  { id: "rsa", title: "Modern Public-Key (RSA)" },
  { id: "quantum", title: "Quantum Threat" },
  { id: "lattice-kyber", title: "Lattice & Kyber" },
  { id: "ethics", title: "Ethics & Society" },
];

function Card({ title, icon: Icon, children }) {
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

function DownloadLink({ name, dataUrl }) {
  if (!dataUrl) return null;
  return (
    <a
      href={dataUrl}
      download={name || "file"}
      className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <Download className="h-3 w-3" /> Download
    </a>
  );
}

function ListFiles({ items }) {
  if (!items?.length) return <p className="text-sm text-slate-500">Nothing yet.</p>;
  return (
    <ul className="mt-2 divide-y divide-slate-200 text-sm dark:divide-slate-700">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <FileType2 className="h-4 w-4" />
            <span className="font-medium">{it.name || it.title}</span>
            {it.url && (
              <a
                className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                href={it.url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-3 w-3" /> open
              </a>
            )}
          </div>
          <DownloadLink name={it.name} dataUrl={it.dataUrl} />
        </li>
      ))}
    </ul>
  );
}

function VideoBlock({ items }) {
  if (!items?.length) return <p className="text-sm text-slate-500">No videos yet.</p>;
  return (
    <div className="mt-2 space-y-3">
      {items.map((v) => {
        const url = v.url || v.dataUrl;
        const isYouTube =
          typeof url === "string" &&
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
        const isVimeo =
          typeof url === "string" && /^(https?:\/\/)?(www\.)?vimeo\.com\//i.test(url);

        // Try to embed YouTube/Vimeo; otherwise show link / download if dataUrl
        return (
          <div key={v.id} className="rounded-lg border p-3 dark:border-slate-700">
            <div className="mb-2 text-sm font-medium">{v.title || "Video"}</div>
            {isYouTube ? (
              <iframe
                title={v.title || "YouTube"}
                className="h-60 w-full rounded"
                src={toYouTubeEmbed(url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isVimeo ? (
              <iframe
                title={v.title || "Vimeo"}
                className="h-60 w-full rounded"
                src={toVimeoEmbed(url)}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : v.dataUrl ? (
              <video controls className="w-full rounded">
                <source src={v.dataUrl} />
              </video>
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Open video
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      // short form: youtu.be/<id>
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    // watch?v= style
    const id = u.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
  } catch {}
  return url;
}

function toVimeoEmbed(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts[0];
    if (id) return `https://player.vimeo.com/video/${id}`;
  } catch {}
  return url;
}

export default function ResourcesStudent() {
  const [topicId, setTopicId] = useState(TOPICS[0].id);

  // SAFELY derive data; getTopicResources always returns a fully-shaped object
  const data = useMemo(() => getTopicResources(topicId), [topicId]);

  // Notes state
  const [notes, setNotesState] = useState(() => getNotes(topicId));

  // When topic changes, load notes
  useEffect(() => {
    setNotesState(getNotes(topicId));
  }, [topicId]);

  // Save notes on change (debounced-ish)
  useEffect(() => {
    const id = setTimeout(() => setNotes(topicId, notes), 150);
    return () => clearTimeout(id);
  }, [topicId, notes]);

  function exportNotesAsDoc() {
    // Simple .doc (HTML) export so it opens in Word
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(
      notes
    )}</pre></body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${topicId}-notes.doc`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold">Resources &amp; Notes</h1>
        </div>
        <div className="inline-flex items-center gap-2 text-sm">
          <Globe2 className="h-4 w-4" />
          <label htmlFor="topicSelect" className="sr-only">
            Select Topic
          </label>
          <select
            id="topicSelect"
            aria-label="Select topic to view resources"
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Lecture Notes (Word uploads)" icon={FileText}>
          <p className="text-sm">
            Download teacher uploads. You can write your own notes on the right and export as a
            Word document.
          </p>
          <ListFiles items={data.lecture} />
        </Card>

        <Card title="Your Notes (editable)" icon={FileText}>
          <textarea
            value={notes}
            onChange={(e) => setNotesState(e.target.value)}
            rows={12}
            className="mt-2 w-full rounded-xl border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Type your study notes here…"
          />
          <div className="mt-2">
            <button
              onClick={exportNotesAsDoc}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-4 w-4" /> Export as .doc
            </button>
          </div>
        </Card>

        <Card title="Guide Notes (PDF)" icon={FileText}>
          <ListFiles items={data.guide} />
        </Card>

        <Card title="Slides (PPT / PDF)" icon={FileType2}>
          <ListFiles items={data.slides} />
        </Card>

        <Card title="Videos" icon={Film}>
          <VideoBlock items={data.video} />
        </Card>

        <Card title="Whiteboard Links" icon={LinkIcon}>
          {data.whiteboard?.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {data.whiteboard.map((w) => (
                <li key={w.id} className="mb-1">
                  <a
                    href={w.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {w.title || "Whiteboard"}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No whiteboards yet.</p>
          )}
          <details className="mt-3 text-xs text-slate-500">
            <summary className="cursor-pointer">Accessibility tips</summary>
            <ul className="ml-5 list-disc">
              <li>Use keyboard navigation and zoom controls.</li>
              <li>Prefer high-contrast themes and avoid color-only meaning.</li>
              <li>Add alt text for important images.</li>
            </ul>
          </details>
        </Card>
      </div>
    </div>
  );
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
