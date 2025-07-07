/**
 * @fileoverview Handles theme toggling and initialization for Memory Ascension (dark, light, and custom modes).
 * @module managers/themeManager
 */

// 🎨 Centralized theme color configuration
export const themePickers = [
  { key: "customBg",           id: "bgColorPicker",         cssVar: "--bg-color",          default: "#0d0d0d" },
  { key: "customText",         id: "textColorPicker",       cssVar: "--text-color",        default: "lime" },
  { key: "customButton",       id: "buttonColorPicker",     cssVar: "--button-bg",         default: "#222222" },
  { key: "customButtonHover",  id: "buttonHoverPicker",cssVar: "--button-hover-bg",   default: "#333333" },
  { key: "cardBg",             id: "cardBgPicker",          cssVar: "--card-bg",           default: "#111111" },
  { key: "upgradeBg",          id: "upgradeBgPicker",       cssVar: "--upgrade-bg",        default: "lime" },
  { key: "upgradeText",        id: "upgradeTextPicker",     cssVar: "--upgrade-text",      default: "black" },
  { key: "upgradeHoverBg",     id: "upgradeHoverPicker",  cssVar: "--upgrade-hover-bg",  default: "#0ee80e" },
  { key: "sliderBg",           id: "sliderBgPicker",        cssVar: "--slider-bg",         default: "#444444" },
  { key: "sliderActive",       id: "sliderActivePicker",    cssVar: "--slider-active",     default: "lime" },
  { key: "sliderKnob",         id: "sliderKnobPicker",      cssVar: "--slider-knob",       default: "black" }
];

/**
 * Applies all custom theme colors from localStorage to CSS variables.
 */
export function applyCustomColors() {
  const root = document.documentElement;
  themePickers.forEach(({ key, cssVar, default: def }) => {
    const stored = localStorage.getItem(key) || def;
    root.style.setProperty(cssVar, stored);
  });
}

/**
 * Toggles between dark → light → custom themes.
 */
export function toggleTheme() {
  const body = document.body;
  const root = document.documentElement;
  const current = localStorage.getItem("theme");

  const toggleBtn = document.getElementById("themeToggle");

  if (current === "dark") {
    body.classList.add("light-mode");
    root.removeAttribute("style");
    localStorage.setItem("theme", "light");
    if (toggleBtn) toggleBtn.textContent = "Light Mode";
  } else if (current === "light") {
    body.classList.remove("light-mode");
    applyCustomColors();
    localStorage.setItem("theme", "custom");
    if (toggleBtn) toggleBtn.textContent = "Custom Mode";
  } else {
    body.classList.remove("light-mode");
    root.removeAttribute("style");
    localStorage.setItem("theme", "dark");
    if (toggleBtn) toggleBtn.textContent = "Dark Mode";
  }
}

/**
 * Initializes theme toggle and applies stored theme on load.
 */
export function initializeThemeToggleText() {
  const theme = localStorage.getItem("theme");
  const toggleBtn = document.getElementById("themeToggle");

  if (theme === "light") {
    document.body.classList.add("light-mode");
    if (toggleBtn) toggleBtn.textContent = "Light Mode";
  } else if (theme === "custom") {
    applyCustomColors();
    if (toggleBtn) toggleBtn.textContent = "Custom Mode";
  } else {
    if (toggleBtn) toggleBtn.textContent = "Dark Mode";
  }
}

/**
 * Initializes color input fields and attaches listeners.
 */
export function initializeColorCustomizers() {
  themePickers.forEach(({ key, id, cssVar, default: def }) => {
    const input = document.getElementById(id);
    if (!input) return;

    const stored = localStorage.getItem(key) || def;
    input.value = stored;
    document.documentElement.style.setProperty(cssVar, stored);

    input.addEventListener("input", () => {
      localStorage.setItem(key, input.value);
      document.documentElement.style.setProperty(cssVar, input.value);
      localStorage.setItem("theme", "custom");
      const toggleBtn = document.getElementById("themeToggle");
      if (toggleBtn) toggleBtn.textContent = "Custom Mode";
    });
  });
}

/**
 * Utility to shade hex color slightly darker/lighter.
 * @param {string} color - Hex color string
 * @param {number} percent - Percentage to lighten/darken
 * @returns {string} - New hex color
 */
function shadeColor(color, percent) {
  let R = parseInt(color.slice(1, 3), 16);
  let G = parseInt(color.slice(3, 5), 16);
  let B = parseInt(color.slice(5, 7), 16);

  R = Math.min(255, Math.floor(R * (100 + percent) / 100));
  G = Math.min(255, Math.floor(G * (100 + percent) / 100));
  B = Math.min(255, Math.floor(B * (100 + percent) / 100));

  return "#" + [R, G, B].map(v => v.toString(16).padStart(2, "0")).join("");
}