/* eslint-env es2020 */
import React from "react";
import { ShieldCheck, Zap } from "lucide-react";
import { Section, Chip } from "../shared";

export default function Project({ t }) {
  return (
    <div className="space-y-6">
      <Section title={t.projectBrief} badge={<Chip icon={Zap}>3–4 min Artifact</Chip>}>
        <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">
          <li>In teams, create a short explainer (slides / video / interactive page) that answers: <i>Why does PQC matter for us?</i></li>
          <li>Include: one classical cipher demo, one RSA insight, one lattice/Kyber intuition, and an ethical consideration.</li>
          <li>Audience: Grade 9 students or families at a school night.</li>
          <li>Accessibility: captions, alt text, plain-language summary.</li>
        </ul>
      </Section>

      <Section title={t.rubric} badge={<Chip icon={ShieldCheck}>Assessment</Chip>}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600 dark:text-slate-300">
              <th className="p-2">Criteria</th>
              <th className="p-2">Emerging (1)</th>
              <th className="p-2">Proficient (2)</th>
              <th className="p-2">Advanced (3)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200 dark:border-slate-700">
              <td className="p-2">Concept Accuracy</td>
              <td className="p-2">Gaps in basics</td>
              <td className="p-2">Correct core ideas</td>
              <td className="p-2">Nuanced, connections across topics</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-700">
              <td className="p-2">Mathematical Reasoning</td>
              <td className="p-2">Limited examples</td>
              <td className="p-2">Clear examples (mod, vectors)</td>
              <td className="p-2">Insightful extensions / proofs-lite</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-700">
              <td className="p-2">Computational Thinking</td>
              <td className="p-2">Basic steps only</td>
              <td className="p-2">Structured algorithms</td>
              <td className="p-2">Optimization & testing mindset</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-700">
              <td className="p-2">Ethics & Impact</td>
              <td className="p-2">Minimal mention</td>
              <td className="p-2">Clear implications</td>
              <td className="p-2">Balanced, civic-minded analysis</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-700">
              <td className="p-2">Communication & Accessibility</td>
              <td className="p-2">Hard to follow</td>
              <td className="p-2">Readable, alt text/captions</td>
              <td className="p-2">Multilingual summary, UDL choices</td>
            </tr>
          </tbody>
        </table>
      </Section>
    </div>
  );
}
