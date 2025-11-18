/* eslint-env es2020 */
import React from "react";

const KEY_WORDS = [
  { term: "Account", def: "Account for: state reasons for, report on. Give an account of: narrate a series of events or transactions." },
  { term: "Advise", def: "Recommend or inform." },
  { term: "Analyse", def: "Identify components and the relationship between them; draw out and relate implications." },
  { term: "Apply", def: "Use, utilise, employ in a particular situation." },
  { term: "Argue", def: "Make a case, based on appropriate evidence, for and/or against some given point of view." },
  { term: "Assess", def: "Make a judgement of value, quality, outcomes, results or size." },
  { term: "Calculate", def: "Ascertain/determine from given facts, figures or information." },
  { term: "Choose (multiple-choice)", def: "Decide or select the most suitable from a number of different options." },
  { term: "Clarify", def: "Make clear or plain." },
  { term: "Classify", def: "Arrange or include in classes/categories." },
  { term: "Comment on", def: "Make reference to and expand upon." },
  { term: "Compare", def: "Show how things are similar and different." },
  { term: "Complete", def: "Finish an outlined task." },
  { term: "Consider", def: "Reflect on and make a judgement/evaluation." },
  { term: "Construct", def: "Make; build; put together items or arguments." },
  { term: "Contrast", def: "Show how things are different or opposite." },
  { term: "Correlate", def: "Demonstrate a mutual or complementary relationship." },
  { term: "Create", def: "Make, invent something." },
  { term: "Critically (analyse/evaluate)", def: "Add a degree or level of accuracy, depth, knowledge and understanding, logic, questioning, reflection and quality to analyse/evaluate." },
  { term: "Debate", def: "Develop a logical (sometimes persuasive) argument, giving differing views in response to a topic." },
  { term: "Deduce", def: "Draw conclusions." },
  { term: "Define", def: "State meaning and identify essential qualities." },
  { term: "Demonstrate", def: "Show by example." },
  { term: "Describe", def: "Provide characteristics and features." },
  { term: "Determine", def: "Decide, find out." },
  { term: "Discuss", def: "Identify issues and provide points for and/or against." },
  { term: "Distinguish", def: "Recognise or indicate as being distinct or different from; note differences between." },
  { term: "Draw (diagrams etc.)", def: "An instruction, as in draw a circle." },
  { term: "Evaluate", def: "To ascertain the value or amount of; appraise carefully." },
  { term: "Examine", def: "Inquire into." },
  { term: "Explain", def: "Relate cause and effect; make the relationships between things evident; provide why and/or how." },
  { term: "Explore", def: "Investigate, search for or evaluate." },
  { term: "Extract", def: "Choose relevant and/or appropriate details." },
  { term: "Extrapolate", def: "Infer from what is known." },
  { term: "Identify", def: "Recognise and name." },
  { term: "Illustrate", def: "Similar to 'explain', but requires specific examples, statistics or drawings (maps, graphs, sketches, etc.)." },
  { term: "Interpret", def: "Draw meaning from." },
  { term: "Investigate", def: "Plan, search or inquire into; examine in order to obtain the true facts." },
  { term: "Justify", def: "Support an argument or conclusion; give reasons for your statements or comments." },
  { term: "Label (and annotate)", def: "Identify by placing a name or word used to describe the object or thing." },
  { term: "List", def: "Provide a series of related words, names, numbers or items arranged one after the other." },
  { term: "Name", def: "Provide a word or term used to identify an object, person, thing, place etc." },
  { term: "Outline", def: "Sketch in general terms; indicate the main features of." },
  { term: "Predict", def: "Suggest what may happen based on available information." },
  { term: "Prepare (e.g. in Accounting)", def: "Take necessary action to put something into a state where it is fit for use or action, or for a particular event or purpose." },
  { term: "Present (an argument)", def: "Offer or convey an argument or statement; a discussion that offers different points of view." },
  { term: "Propose", def: "Put forward (e.g., a point of view, idea, argument, suggestion) for consideration or action." },
  { term: "Recall", def: "Present remembered ideas, facts or experiences." },
  { term: "Recommend", def: "Provide reasons in favour." },
  { term: "Recount", def: "Retell a series of events." },
  { term: "Respond to …", def: "Provide an answer; reply." },
  { term: "Select", def: "Choose somebody or something from among several." },
  { term: "Show", def: "Give information; illustrate." },
  { term: "Sketch", def: "A quick, rough picture or diagram; a brief outline." },
  { term: "State", def: "Express the main points of an idea or topic, perhaps in the manner of 'describe'." },
  { term: "Summarise", def: "Express concisely the relevant details." },
  { term: "Synthesise", def: "Put together various elements to make a whole; combine ideas into a complex whole." },
];

export default function KeyWordsGlossary() {
  return (
    <section className="mx-auto my-6 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <details open>
        <summary className="cursor-pointer text-base font-semibold">
          Glossary of key words in the formulation of questions
        </summary>

        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Based on 2016/59359 – generic across courses. Use with students when unpacking
          exam command words.
        </p>

        <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <tr>
                <th className="px-3 py-2">Key word</th>
                <th className="px-3 py-2">Definition</th>
              </tr>
            </thead>
            <tbody>
              {KEY_WORDS.map((item) => (
                <tr
                  key={item.term}
                  className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-800"
                >
                  <td className="px-3 py-1 font-semibold">{item.term}</td>
                  <td className="px-3 py-1">{item.def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
