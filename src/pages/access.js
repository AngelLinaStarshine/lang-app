/* eslint-env es2020 */
import React, { useEffect, useState } from "react";

/* Minimal role gate for teacher pages
   - Stores role in localStorage ("teacher" or "student")
   - Shows a compact banner with current role and a quick switch
*/

const ROLE_KEY = "alt_role_v1";

function loadRole() {
  try {
    return localStorage.getItem(ROLE_KEY) || "teacher";
  } catch {
    return "teacher";
  }
}
function saveRole(v) {
  try {
    localStorage.setItem(ROLE_KEY, v);
  } catch {}
}

export default function AccessTeacher() {
  const [role] = useState(loadRole());

  useEffect(() => {
    saveRole(role);
  }, [role]);

  const isTeacher = role === "teacher";

  return (
    <div className="mx-auto my-4 w-full max-w-5xl rounded-xl border border-slate-200 bg-white/90 p-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-2 py-1 text-xs dark:border-slate-700">
            Role: <strong className="ml-1">{isTeacher ? "Teacher" : "Student"}</strong>
          </span>
          <span className="text-slate-500">
            {isTeacher
              ? "You have access to create and manage lessons."
              : "Read-only mode. Switch to Teacher to edit."}
          </span>
        </div>

        
      </div>
    </div>
  );
}

/* If you previously imported and used StudentLibrary or any
   of the upload components from this file, you can delete those
   usages. This file now intentionally contains only AccessTeacher. */
