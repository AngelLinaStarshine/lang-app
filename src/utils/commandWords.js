// src/utils/commandWords.js
import React from "react";

export const COMMAND_WORDS = {
  account: {
    en: "State reasons for; report on; narrate a series of events or transactions.",
  },
  advise: {
    en: "Recommend or inform.",
  },
  analyse: {
    en: "Identify components and relationships; draw out and relate implications.",
  },
  apply: {
    en: "Use, utilise, or employ in a particular situation.",
  },
  argue: {
    en: "Make a case, based on appropriate evidence, for or against a point of view.",
  },
  assess: {
    en: "Make a judgement of value, quality, outcomes, results or size.",
  },
  calculate: {
    en: "Ascertain or determine from given facts, figures or information.",
  },
  clarify: {
    en: "Make clear or plain.",
  },
  classify: {
    en: "Arrange or include in classes or categories.",
  },
  compare: {
    en: "Show how things are similar and different.",
  },
  complete: {
    en: "Finish an outlined task.",
  },
  consider: {
    en: "Reflect on and make a judgement or evaluation.",
  },
  construct: {
    en: "Make; build; put together items or arguments.",
  },
  contrast: {
    en: "Show how things are different or opposite.",
  },
  correlate: {
    en: "Demonstrate a mutual or complementary relationship.",
  },
  create: {
    en: "Make or invent something.",
  },
  "critically analyse": {
    en: "Analyse with depth, accuracy, reflection, and evaluation.",
  },
  "critically evaluate": {
    en: "Evaluate with depth, accuracy, reflection, and judgement.",
  },
  debate: {
    en: "Develop a logical argument, giving differing views.",
  },
  deduce: {
    en: "Draw conclusions from given information.",
  },
  define: {
    en: "State meaning and identify essential qualities.",
  },
  demonstrate: {
    en: "Show by example.",
  },
  describe: {
    en: "Provide characteristics and features.",
  },
  determine: {
    en: "Decide or find out.",
  },
  discuss: {
    en: "Identify issues and provide points for and/or against.",
  },
  distinguish: {
    en: "Recognise or note differences; show what is distinct.",
  },
  evaluate: {
    en: "Appraise carefully; judge value or effectiveness.",
  },
  examine: {
    en: "Inquire into; look closely at details.",
  },
  explain: {
    en: "Relate cause and effect; make relationships evident; say why or how.",
  },
  explore: {
    en: "Investigate, search for or evaluate.",
  },
  extract: {
    en: "Choose relevant and/or appropriate details.",
  },
  extrapolate: {
    en: "Infer from what is known.",
  },
  identify: {
    en: "Recognise and name.",
  },
  interpret: {
    en: "Draw meaning from.",
  },
  investigate: {
    en: "Plan, search or inquire into to obtain true facts.",
  },
  justify: {
    en: "Support an argument or conclusion; give reasons.",
  },
  label: {
    en: "Identify by placing a name or word.",
  },
  list: {
    en: "Provide a series of related words, names, or items.",
  },
  name: {
    en: "Provide a word or term used to identify something.",
  },
  outline: {
    en: "Sketch in general terms; indicate main features.",
  },
  predict: {
    en: "Suggest what may happen based on available information.",
  },
  present: {
    en: "Offer or convey an argument, statement, or discussion.",
  },
  propose: {
    en: "Put forward an idea, argument, or suggestion for consideration.",
  },
  recall: {
    en: "Present remembered ideas, facts or experiences.",
  },
  recommend: {
    en: "Provide reasons in favour.",
  },
  recount: {
    en: "Retell a series of events.",
  },
  respond: {
    en: "Provide an answer; reply.",
  },
  select: {
    en: "Choose from among several options.",
  },
  show: {
    en: "Give information; illustrate.",
  },
  sketch: {
    en: "Draw quickly/roughly; or give a brief outline.",
  },
  state: {
    en: "Express the main points of an idea or topic clearly.",
  },
  summarise: {
    en: "Express concisely the relevant details.",
  },
  synthesise: {
    en: "Put together elements to make a whole; combine ideas.",
  },
  // You can keep adding or tweak definitions as you like
};

// Simple regex over single words only for now.
// (Multi-word ones like "critically analyse" are included but may need a more advanced matcher later.)
const COMMAND_REGEX = new RegExp(
  `\\b(${Object.keys(COMMAND_WORDS)
    .map((w) => w.replace(/\s+/g, "\\s+"))
    .join("|")})\\b`,
  "gi"
);

export function highlightCommandWords(text, lang = "en") {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;

  text.replace(COMMAND_REGEX, (match, word, offset) => {
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }

    const key = word.toLowerCase();
    const def = COMMAND_WORDS[key]?.[lang] || COMMAND_WORDS[key]?.en || "";

    parts.push(
      <span
        key={`${offset}-${word}`}
        className="border-b border-dashed cursor-help decoration-slate-400"
        title={def ? `${word} — ${def}` : word}
      >
        {match}
      </span>
    );

    lastIndex = offset + match.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
