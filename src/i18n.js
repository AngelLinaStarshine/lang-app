// src/i18n.js
/* eslint-env es2020 */
import { useState } from "react";

/**
 * Shared subjects across the app
 * Internal IDs are language-agnostic; labels come from getSubjectTitle().
 */
export const SUBJECTS = [
  { id: "literature" },
  { id: "biology" }, // Biology instead of Music
  { id: "history" },
  { id: "it" },
];

const SUBJECT_LABELS = {
  en: {
    literature: "Literature",
    biology: "Biology",
    history: "History",
    it: "Information Technology",
  },
  es: {
    literature: "Literatura",
    biology: "Biología",
    history: "Historia",
    it: "Tecnología de la información",
  },
};

export function getSubjectTitle(id, lang = "en") {
  const labels = SUBJECT_LABELS[lang] || SUBJECT_LABELS.en;
  return labels[id] || SUBJECT_LABELS.en[id] || id;
}

/**
 * Global language hook (shared by teacher + student pages).
 * Stores the choice in localStorage under "alt_lang".
 */
export function useLang() {
  const [langState, setLangState] = useState(
    () => localStorage.getItem("alt_lang") || "en"
  );

  function setLang(next) {
    const value = next === "es" ? "es" : "en";
    setLangState(value);
    localStorage.setItem("alt_lang", value);
  }

  return [langState, setLang];
}

/**
 * TEXT: all the i18n strings used in the app.
 * Right now we define common + teacher; you can add student section later.
 */
export const TEXT = {
  common: {
    languageLabel: {
      en: "Language",
      es: "Idioma",
    },
    english: {
      en: "English",
      es: "Inglés",
    },
    spanish: {
      en: "Spanish",
      es: "Español",
    },
  },

  teacher: {
    // Labels
    subjectLabel: {
      en: "Subject",
      es: "Asignatura",
    },
    lessonNumber: {
      en: "Lesson #",
      es: "Lección #",
    },
    lessonTopic: {
      en: "Lesson Topic",
      es: "Tema de la lección",
    },
    lessonTopicPlaceholder: {
      en: "e.g., Introduction to Academic Reading",
      es: "p. ej., Introducción a la lectura académica",
    },
    lessonWord: {
      en: "Lesson",
      es: "Lección",
    },

    // Buttons / actions
    saveLesson: {
      en: "Save Lesson",
      es: "Guardar lección",
    },
    clearSubject: {
      en: "Clear Subject",
      es: "Borrar asignatura",
    },
    addResource: {
      en: "+ Add another resource",
      es: "+ Agregar otro recurso",
    },
    saveGenerate: {
      en: "Save & Generate",
      es: "Guardar y generar",
    },
    clearRef: {
      en: "Clear ref/practice (this lesson)",
      es: "Borrar referencia/práctica (esta lección)",
    },

    // Upload / reference section
    uploadLectureFiles: {
      en: "Upload lecture files (Word/PDF/PPT)",
      es: "Subir archivos de clase (Word/PDF/PPT)",
    },
    refHeader: {
      en: "Reference Text → Vocabulary & Practice",
      es: "Texto de referencia → Vocabulario y práctica",
    },
    uploadRefAria: {
      en: "Upload PDF/TXT/DOCX to auto-fill the reference text",
      es: "Subir PDF/TXT/DOCX para completar el texto de referencia",
    },
    refBusy: {
      en: "Extracting text…",
      es: "Extrayendo texto…",
    },
    refPlaceholderPrefix: {
      en: "Paste or upload ~1–3 paragraphs for",
      es: "Pegue o cargue 1–3 párrafos para",
    },

    // Messages / errors
    msgMissingLessonFields: {
      en: "Please enter both Lesson # and Topic.",
      es: "Por favor ingrese número y tema de la lección.",
    },
    msgClearedSubject: {
      en: "Cleared all lessons for this subject.",
      es: "Se eliminaron todas las lecciones de esta asignatura.",
    },
    msgUnsupportedFile: {
      en: "Unsupported file type. Please choose a PDF, TXT, or DOCX.",
      es: "Tipo de archivo no compatible. Use PDF, TXT o DOCX.",
    },
    msgExtractFail: {
      en: "Could not extract text from the file.",
      es: "No se pudo extraer texto del archivo.",
    },
    msgEnterLessonFirst: {
      en: "Enter a Lesson # first.",
      es: "Ingrese primero el número de la lección.",
    },

    // Reference / practice display
    referenceTextLabel: {
      en: "Reference text",
      es: "Texto de referencia",
    },
    noReferenceText: {
      en: "No reference text saved.",
      es: "No hay texto de referencia guardado.",
    },
    noPracticeYet: {
      en: "No practice generated yet.",
      es: "Todavía no se ha generado práctica.",
    },

    // Lesson lists
    noLessonsForSubject(subjectTitle, lang) {
      return lang === "es"
        ? `No hay lecciones guardadas para ${subjectTitle}.`
        : `No lessons saved yet for ${subjectTitle}.`;
    },
    lessonsSummary(subjectTitle, count, lang) {
      if (lang === "es") {
        return `${subjectTitle} — ${count} lección${count > 1 ? "es" : ""}`;
      }
      return `${subjectTitle} — ${count} lesson${count > 1 ? "s" : ""}`;
    },
    generatedItemsLabel(count, lang) {
      return lang === "es"
        ? `Ítems generados (${count})`
        : `Generated items (${count})`;
    },

    // Resources
    lectureFilesLabel: {
      en: "Lecture files",
      es: "Archivos de la clase",
    },
    noFilesAttached: {
      en: "No files attached.",
      es: "No hay archivos adjuntos.",
    },
    noResources: {
      en: "No resources for this lesson.",
      es: "No hay recursos para esta lección.",
    },
  },

  // You can add TEXT.student later when we internationalize the student side.
};
