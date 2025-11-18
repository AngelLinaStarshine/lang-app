// src/utils/commandWords.js (continued)
import React from "react";

const COMMAND_REGEX = new RegExp(
  `\\b(${Object.keys(COMMAND_WORDS).join("|")})\\b`,
  "gi"
);

export function highlightCommandWords(text, lang = "en") {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;

  text.replace(COMMAND_REGEX, (match, word, offset) => {
    // push text before the matched word
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }

    const key = word.toLowerCase();
    const def =
      COMMAND_WORDS[key]?.[lang] || COMMAND_WORDS[key]?.en || "";

    parts.push(
      <span
        key={`${offset}-${word}`}
        className="border-b border-dashed cursor-help decoration-slate-400"
        title={`${word} — ${def}`}
      >
        {match}
      </span>
    );

    lastIndex = offset + match.length;
  });

  // push any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
