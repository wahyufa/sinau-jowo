"use client";

export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    window.localStorage.setItem("theme", next);
  }

  return (
    <button className="toolbar-btn" onClick={toggle} aria-label="Ganti tema terang/gelap">
      <span className="theme-icon-sun">☀️</span>
      <span className="theme-icon-moon">🌙</span>
    </button>
  );
}
