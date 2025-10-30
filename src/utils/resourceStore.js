/* eslint-env es2020 */

// ===============================
//   LocalStorage-backed store v2
// ===============================
const LS_KEY = "pqc_resource_store_v2";

export const TOPIC_IDS = ["classical", "rsa", "quantum", "lattice-kyber", "ethics"];

function emptyTopicBuckets() {
  return {
    lecture: [],    // [{id, name, mime, dataUrl, uploadedAt}]
    guide: [],      // [{id, name, mime, dataUrl, uploadedAt}]
    slides: [],     // [{id, name, mime, dataUrl, uploadedAt}]
    video: [],      // [{id, url|dataUrl, title, uploadedAt}]
    whiteboard: [], // [{id, url, title, uploadedAt}]
  };
}

function defaultStore() {
  const resources = {};
  const notes = {};
  for (const t of TOPIC_IDS) {
    resources[t] = emptyTopicBuckets();
    notes[t] = "";
  }
  return { resources, notes };
}

function loadStore() {
  let parsed = null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) parsed = JSON.parse(raw);
  } catch {
    // ignore
  }

  if (!parsed || typeof parsed !== "object") {
    const fresh = defaultStore();
    try { localStorage.setItem(LS_KEY, JSON.stringify(fresh)); } catch {}
    return fresh;
  }

  // Harden shape
  const safe = defaultStore();

  const srcRes = parsed.resources;
  if (srcRes && typeof srcRes === "object") {
    for (const t of TOPIC_IDS) {
      const inB = srcRes[t];
      safe.resources[t] = {
        lecture: Array.isArray(inB?.lecture) ? inB.lecture : [],
        guide: Array.isArray(inB?.guide) ? inB.guide : [],
        slides: Array.isArray(inB?.slides) ? inB.slides : [],
        video: Array.isArray(inB?.video) ? inB.video : [],
        whiteboard: Array.isArray(inB?.whiteboard) ? inB.whiteboard : [],
      };
    }
  }

  const srcNotes = parsed.notes;
  if (srcNotes && typeof srcNotes === "object") {
    for (const t of TOPIC_IDS) {
      safe.notes[t] = typeof srcNotes[t] === "string" ? srcNotes[t] : "";
    }
  }

  try { localStorage.setItem(LS_KEY, JSON.stringify(safe)); } catch {}
  return safe;
}

function saveStore(store) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch {}
}

// ============== Public helpers ==============
export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// Always returns a fully-shaped buckets object
export function getTopicResources(topicId) {
  const store = loadStore();

  if (!store.resources || typeof store.resources !== "object") {
    store.resources = {};
  }
  if (!store.resources[topicId] || typeof store.resources[topicId] !== "object") {
    store.resources[topicId] = emptyTopicBuckets();
    saveStore(store);
  }

  const b = store.resources[topicId];
  return {
    lecture: Array.isArray(b.lecture) ? b.lecture : [],
    guide: Array.isArray(b.guide) ? b.guide : [],
    slides: Array.isArray(b.slides) ? b.slides : [],
    video: Array.isArray(b.video) ? b.video : [],
    whiteboard: Array.isArray(b.whiteboard) ? b.whiteboard : [],
  };
}

export function addFile(topicId, bucket, fileObj) {
  const store = loadStore();
  if (!store.resources || typeof store.resources !== "object") store.resources = {};
  if (!store.resources[topicId] || typeof store.resources[topicId] !== "object") {
    store.resources[topicId] = emptyTopicBuckets();
  }
  if (!Array.isArray(store.resources[topicId][bucket])) {
    store.resources[topicId][bucket] = [];
  }
  store.resources[topicId][bucket].push(fileObj);
  saveStore(store);
}

export function addLink(topicId, bucket, linkObj) {
  const store = loadStore();
  if (!store.resources || typeof store.resources !== "object") store.resources = {};
  if (!store.resources[topicId] || typeof store.resources[topicId] !== "object") {
    store.resources[topicId] = emptyTopicBuckets();
  }
  if (!Array.isArray(store.resources[topicId][bucket])) {
    store.resources[topicId][bucket] = [];
  }
  store.resources[topicId][bucket].push(linkObj);
  saveStore(store);
}

export function removeItem(topicId, bucket, id) {
  const store = loadStore();
  const arr = store.resources?.[topicId]?.[bucket];
  if (Array.isArray(arr)) {
    store.resources[topicId][bucket] = arr.filter((x) => x.id !== id);
    saveStore(store);
  }
}

// ---- student notes (per topic) ----
export function getNotes(topicId) {
  const store = loadStore();
  if (!store.notes || typeof store.notes !== "object") {
    store.notes = {};
  }
  if (typeof store.notes[topicId] !== "string") {
    store.notes[topicId] = "";
    saveStore(store);
  }
  return store.notes[topicId] || "";
}

export function setNotes(topicId, text) {
  const store = loadStore();
  if (!store.notes || typeof store.notes !== "object") store.notes = {};
  store.notes[topicId] = String(text ?? "");
  saveStore(store);
}

// Optional dev helper
export function clearAll() {
  localStorage.removeItem(LS_KEY);
}
