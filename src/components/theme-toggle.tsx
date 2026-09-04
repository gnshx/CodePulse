"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = document.documentElement.dataset.theme;
    if (stored === "light" || stored === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("bettercp-theme", next);
  };

  if (!mounted) {
    return (
      <button className="theme-toggle" aria-label="Toggle theme" id="theme-toggle-btn">
        <Sun size={15} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      id="theme-toggle-btn"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
