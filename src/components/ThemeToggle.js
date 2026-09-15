"use client";

import { useEffect, useState } from "react";

function apply(theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    let saved = null;
    try {
      saved = window.localStorage.getItem("theme");
    } catch {}
    setTheme(saved === "dark" || saved === "light" ? saved : "system");
  }, []);

  function choose(next) {
    setTheme(next);
    apply(next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {}
  }

  // Nothing is rendered until the saved choice is known, so the button never
  // shows the wrong state for a moment.
  if (theme === null) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={() => choose(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-base"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
