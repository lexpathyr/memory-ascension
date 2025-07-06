
/**
 * @fileoverview Handles theme toggling and initialization for Memory Ascension (light/dark mode).
 * @module managers/themeManager
 */

/**
 * Toggles between light and dark mode, updates button text, and saves preference to localStorage.
 */
export function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle("light-mode");
  document.getElementById("themeToggle").textContent = isLight ? "Light Mode" : "Dark Mode";

  localStorage.setItem(
    "lightMode",
    body.classList.contains("light-mode")
  );
}

/**
 * Initializes the theme toggle button text and applies the saved theme preference on load.
 */
export function initializeThemeToggleText() {
  const isLight = localStorage.getItem("lightMode") === "true";
  document.body.classList.toggle("light-mode", isLight);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = isLight ? "Light Mode" : "Dark Mode";
  }
}