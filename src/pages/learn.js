/* eslint-env es2020 */
import React, { useState } from "react";
import { Globe2, ShieldCheck, Lock, KeyRound, Zap } from "lucide-react";
import { ResourceDrawer } from "../shared";

function LearnCard({ icon: Icon, title, desc, children, onOpen }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <Icon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <button
          onClick={onOpen}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 shadow-sm hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Open resources
        </button>
      </div>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{desc}</p>
      <div className="mt-3 text-slate-700 dark:text-slate-200">{children}</div>
    </div>
  );
}

export default function Learn({ t }) {
  const [openTopic, setOpenTopic] = useState(null);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <LearnCard
          icon={Lock}
          title={t.l1}
          desc={t.l1p}
          onOpen={() => setOpenTopic({ id: "classical", title: t.l1 })}
        >
          <ul className="ml-4 list-disc text-sm">
            <li>Shift &amp; polyalphabetic ciphers; why frequency analysis works.</li>
            <li>Modular arithmetic: add, wrap, residues mod 26.</li>
          </ul>
        </LearnCard>

        <LearnCard
          icon={KeyRound}
          title={t.l2}
          desc={t.l2p}
          onOpen={() => setOpenTopic({ id: "rsa", title: t.l2 })}
        >
          <ul className="ml-4 list-disc text-sm">
            <li>Public vs private keys; modular exponentiation.</li>
            <li>Security ⇢ factoring large n is hard (classically).</li>
          </ul>
        </LearnCard>

        <LearnCard
          icon={Zap}
          title={t.l3}
          desc={t.l3p}
          onOpen={() => setOpenTopic({ id: "quantum", title: t.l3 })}
        >
          <ul className="ml-4 list-disc text-sm">
            <li>Shor’s algorithm undermines factoring / discrete log.</li>
            <li>Harvest-now, decrypt-later motivates migration plans.</li>
          </ul>
        </LearnCard>

        <LearnCard
          icon={ShieldCheck}
          title={t.l4}
          desc={t.l4p}
          onOpen={() => setOpenTopic({ id: "lattice-kyber", title: t.l4 })}
        >
          <ul className="ml-4 list-disc text-sm">
            <li>Lattices: points from integer combos of basis vectors.</li>
            <li>Hard problems (Module-LWE) underpin Kyber KEM.</li>
          </ul>
        </LearnCard>

        <LearnCard
          icon={Globe2}
          title={t.l5}
          desc={t.l5p}
          onOpen={() => setOpenTopic({ id: "ethics", title: t.l5 })}
        >
          <ul className="ml-4 list-disc text-sm">
            <li>Privacy, surveillance, and equitable access.</li>
            <li>Digital citizenship: safe credentials, MFA, updates.</li>
          </ul>
        </LearnCard>
      </div>

      <ResourceDrawer
        open={!!openTopic}
        onClose={() => setOpenTopic(null)}
        topic={openTopic}
      />
    </>
  );
}
