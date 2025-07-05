// themeManager.js

export function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle("light-mode");
  document.getElementById("themeToggle").textContent = isLight ? "Light Mode" : "Dark Mode";

  localStorage.setItem(
    "lightMode",
    body.classList.contains("light-mode")
  );
}

export function initializeThemeToggleText() {
  const isLight = localStorage.getItem("lightMode") === "true";
  document.body.classList.toggle("light-mode", isLight);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = isLight ? "Light Mode" : "Dark Mode";
  }
}