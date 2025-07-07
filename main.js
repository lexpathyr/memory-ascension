/**
 * @file main.js
 * @module main
 * @description Entry point for Memory Ascension incremental game. Handles UI initialization, event listeners, and game loop setup.
 * @author (c) 2025 Memory Ascension
 */

// --- Module Imports ---

import { loadGame, saveGame, importSave, exportSave, resetGame, handleImportFile } from './scripts/managers/saveManager.js';
import { updateDisplay } from './scripts/managers/displayManager.js';
import { toggleTheme, initializeThemeToggleText, initializeColorCustomizers } from './scripts/managers/themeManager.js';
import { generateBit, gameTick } from './scripts/core/engine.js';
import { recompile } from './scripts/prestige/recompile.js';
import { runProgram, getRunningPrograms } from './scripts/data/programs/programExecutor.js';
import { programSchemas } from './scripts/data/programs/programSchemas.js';
import { programDefinitions } from './scripts/data/programs/programDefinitions.js';
import { gameState } from './scripts/core/gameState.js';
import { renderUpgradeRack } from './scripts/managers/rigManager.js';
import { buildTierLayout, requestTierUpdate } from './scripts/ui/uiRenderer.js';

/**
 * Initializes the Memory Ascension game UI and logic after the window loads.
 * Sets up event listeners, game loop, and tab navigation.
 * @function
 * @returns {void}
 */
window.onload = () => {
  /**
   * If light mode is enabled in localStorage, apply the light mode class to the body.
   */
  // --- Game Initialization ---
  /**
   * Start the main game loop and periodic save.
   */
  /**
   * Show or hide the computing tab based on unlock status.
   */
  /**
   * Assign UI button event handlers for theme, prestige, save, import, and reset.
   */
  /**
   * Expose generateBit and gameState for debugging in the browser console.
   * @type {function}
   */
  /**
   * Cache references to main UI elements for tab and panel switching.
   * @type {HTMLElement}
   */
  /**
   * Render the upgrade rack and hide it by default.
   */
  if (localStorage.getItem("lightMode") === "true") {
    document.body.classList.add("light-mode");
  }

  loadGame();
  buildTierLayout();
  requestTierUpdate();
  initializeThemeToggleText();
  initializeColorCustomizers();

  gameTick();
  setInterval(gameTick, 100);
  setInterval(saveGame, 3000);

  setTimeout(() => {
    if (gameState.meta.computingTabUnlocked) {
      document.getElementById("tabTerminal").style.display = "inline-block";
    } else {
      document.getElementById("tabTerminal").style.display = "none";
    }
  }, 100);

  setTimeout(() => {
  if (document.getElementById("colorCustomizers")) {
    initializeColorCustomizers();
  }
}, 0);

  document.getElementById("themeToggle").onclick = toggleTheme;
  document.getElementById("recompileBtn").onclick = recompile;
  document.getElementById("exportBtn").onclick = exportSave;
  document.getElementById("importBtn").onclick = importSave;
  document.getElementById("resetBtn").onclick = resetGame;
  document.getElementById("importFile").onchange = handleImportFile;
  window.generate = generateBit;
  window.state = gameState;

  const memoryTab = document.getElementById("tabMemory");
  const terminalTab = document.getElementById("tabTerminal");
  const memoryPanel = document.getElementById("memoryPanel");
  const terminalPanel = document.getElementById("terminalPanel");
  const terminalInput = document.getElementById("terminalInput");
  const terminalOutput = document.getElementById("terminalOutput");

  renderUpgradeRack();
  document.getElementById("upgradeRack").style.display = "none";
  document.getElementById("rigStatsDisplay").style.display = "none";

  /**
   * Switch to the Memory tab and hide terminal-related panels.
   * @returns {void}
   */
  memoryTab.onclick = () => {
    memoryTab.classList.add("active");
    terminalTab.classList.remove("active");
    memoryPanel.style.display = "block";
    terminalPanel.classList.remove("visible");
    document.getElementById("upgradeRack").style.display = "none";
    document.getElementById("rigStatsDisplay").style.display = "none";
  };

  /**
   * Switch to the Terminal tab and show terminal-related panels.
   * @returns {void}
   */
  terminalTab.onclick = () => {
    terminalTab.classList.add("active");
    memoryTab.classList.remove("active");
    memoryPanel.style.display = "none";
    terminalPanel.classList.add("visible");
    terminalInput.focus();
    document.getElementById("upgradeRack").style.display = "flex";
    document.getElementById("rigStatsDisplay").style.display = "flex";
  };

  /**
   * Close the Terminal panel and return to the Memory tab.
   * @returns {void}
   */
  document.getElementById("closeTerminal").onclick = () => {
    terminalPanel.classList.remove("visible");
    memoryTab.classList.add("active");
    terminalTab.classList.remove("active");
    memoryPanel.style.display = "block";
    document.getElementById("upgradeRack").style.display = "none";
    document.getElementById("rigStatsDisplay").style.display = "none";
  };

  document.getElementById("themeSettingsBtn").addEventListener("click", () => {
    document.getElementById("themeSettingsModal").removeAttribute("hidden");
  });

  document.getElementById("closeThemeModal").addEventListener("click", () => {
    document.getElementById("themeSettingsModal").setAttribute("hidden", "");
  });

  // Optional: close modal on outside click
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("themeSettingsModal");
    if (!modal.hidden && !modal.contains(e.target) && e.target.id !== "themeSettingsBtn") {
      modal.setAttribute("hidden", "");
    }
  });

  /**
   * Handle terminal input commands for the in-game terminal panel.
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const command = terminalInput.value.trim();
    terminalOutput.textContent += `\n> ${command}`;
    terminalInput.value = "";

    if (command === "exit" || command === "close") {
      terminalOutput.textContent += "\nExiting terminal...";
      terminalPanel.classList.remove("visible");
      memoryPanel.style.display = "block";
      memoryTab.classList.add("active");
      terminalTab.classList.remove("active");
      return;
    }

    if (command === "clear") {
      terminalOutput.textContent = "[terminal ready]";
      return;
    }

    if (command === "status") {
      const running = getRunningPrograms();
      terminalOutput.textContent += running.length
        ? running.map(p => `\n[${p.name}] ${p.permanent ? 'Permanent' : p.timeRemaining + 's left'}` ).join("")
        : "\n(no running programs)";
      return;
    }

    if (command.startsWith("run ")) {
      const key = command.slice(4).trim();
      const program = programDefinitions[key];
      if (program) {
        const isRunning = runProgram(program);
        if (isRunning) {
          terminalOutput.textContent += `\nRunning \"${program.name}\"...`;
        }
      } else {
        terminalOutput.textContent += `\nProgram not found: \"${key}\"`;
      }
      return;
    }

    if (command.startsWith("stop ")) {
      const key = command.slice(5).trim();
      const running = getRunningPrograms();
      const prog = running.find(p => p.key === key);
      if (prog) {
        cancelProgram(key);
        terminalOutput.textContent += `\nStopped program: \"${prog.name}\"`;
      } else {
        terminalOutput.textContent += `\nNo running program found with key: \"${key}\"`;
      }
      return;
    }

    if (command === "list programs") {
      const unlockedProgramSet = new Set();
      programSchemas.forEach(schema => {
        if ((gameState.meta.prestigeCurrency || 0) >= schema.unlockThreshold) {
          schema.programs.forEach(id => unlockedProgramSet.add(id));
        }
      });
      unlockedProgramSet.forEach(id => {
        const program = programDefinitions[id];
        let costStr = `Cycles: ${program.cost}`;
        if (program.dataRequired) {
          costStr += ", " + Object.entries(program.dataRequired).map(([k,v]) => `${v} ${k}`).join(", ");
        }
        let effectStr = program.permanent ? "Permanent effect" : (program.duration ? `Duration: ${program.duration}s` : "");
        if (program.name && program.name.toLowerCase().includes("defragmenter")) effectStr += ", Boosts bit gain by 50%";
        if (program.name && program.name.toLowerCase().includes("encryptor")) effectStr += ", +3 bytes/sec";
        terminalOutput.textContent += `\n${id}: ${program.name} [${costStr}]${effectStr ? ` - ${effectStr}` : ""}`;
      });
      return;
    }

    if (command === "help") {
      terminalOutput.textContent += "\nclear: Clears the terminal";
      terminalOutput.textContent += "\nclose or exit: Closes the computing tab";
      terminalOutput.textContent += "\nhelp: Lists commands";
      terminalOutput.textContent += "\nlist programs: Lists available programs";
      terminalOutput.textContent += "\nrun 'program': Runs chosen program";
      terminalOutput.textContent += "\nstop 'program': Stops chosen program execution";
      terminalOutput.textContent += "\nstatus: Shows running programs";
      terminalOutput.textContent += "\ncompute prestige: Spend cycles to permanently increase all computing stats";
      return;
    }

    if (command === "compute prestige") {
      const baseCost = 300;
      const timesPrestiged = gameState.meta.computingPrestigeCount || 0;
      const cost = Math.floor(baseCost * Math.pow(1.5, timesPrestiged));
      if ((gameState.meta.prestigeCurrency || 0) < cost) {
        terminalOutput.textContent += `\nNot enough cycles. Computing prestige requires ${cost} cycles.`;
        return;
      }
      gameState.meta.prestigeCurrency -= cost;
      gameState.meta.computingPrestigeCount = timesPrestiged + 1;
      gameState.meta.processingPower = (gameState.meta.processingPower || 0) + 1;
      gameState.meta.speed = (gameState.meta.speed || 1) + 1;
      gameState.meta.memory = (gameState.meta.memory || 0) + 1;
      gameState.meta.storageSlots = (gameState.meta.storageSlots || 1) + 1;
      terminalOutput.textContent += `\nComputing Prestige! All computing stats increased by 1. (${cost} cycles spent)`;
      if (window.applyPartBonuses) applyPartBonuses();
      renderUpgradeRack();
      requestTierUpdate();
      updateDisplay();
      return;
    }

    terminalOutput.textContent += `\nUnknown command: \"${command}\"`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  });

  /**
   * Dropdown controls logic for the footer controls menu.
   */
  const controlsToggle = document.getElementById("controlsToggle");
  const controlsMenu = document.getElementById("controlsMenu");
  controlsMenu.setAttribute("hidden", ""); // Ensure hidden by default
  controlsToggle.setAttribute("aria-expanded", "false");
  /**
   * Toggle the controls dropdown menu.
   * @param {MouseEvent} e
   * @returns {void}
   */
  controlsToggle.onclick = (e) => {
    e.stopPropagation();
    const expanded = controlsMenu.hasAttribute("hidden") ? false : true;
    if (expanded) {
      controlsMenu.setAttribute("hidden", "");
      controlsToggle.setAttribute("aria-expanded", "false");
    } else {
      controlsMenu.removeAttribute("hidden");
      controlsToggle.setAttribute("aria-expanded", "true");
    }
  };
  // Close dropdown when clicking outside
  /**
   * Close the controls dropdown when clicking outside the menu.
   * @param {MouseEvent} e
   * @returns {void}
   */
  document.addEventListener("click", (e) => {
    if (!controlsMenu.contains(e.target) && e.target !== controlsToggle) {
      controlsMenu.setAttribute("hidden", "");
      controlsToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Theme modal actions
  document.getElementById("resetThemeBtn").addEventListener("click", () => {
    const defaults = {
      customBg: "#0d0d0d",
      customText: "lime",
      customButton: "#222222",
      customButtonHover: "#333333",
      cardBg: "#111111",
      upgradeBg: "lime",
      upgradeText: "black",
      upgradeHoverBg: "#0ee80e",
      sliderBg: "#444444",
      sliderActive: "lime",
      sliderKnob: "black",
      theme: "custom"
    };

    for (const [key, value] of Object.entries(defaults)) {
      localStorage.setItem(key, value);
      const varName = {
        customBg: "--bg-color",
        customText: "--text-color",
        customButton: "--button-bg",
        customButtonHover: "--button-hover-bg",
        cardBg: "--card-bg",
        upgradeBg: "--upgrade-bg",
        upgradeText: "--upgrade-text",
        upgradeHoverBg: "--upgrade-hover-bg",
        sliderBg: "--slider-bg",
        sliderActive: "--slider-active",
        sliderKnob: "--slider-knob"
      }[key];

      if (varName) {
        document.documentElement.style.setProperty(varName, value);
      }
      initializeColorCustomizers();
    }

    document.getElementById("themeToggle").textContent = "Custom Mode";
  });

  document.getElementById("exportThemeBtn").addEventListener("click", () => {
    const themeKeys = [
      "customBg", "customText", "customButton", "customButtonHover",
      "cardBg", "upgradeBg", "upgradeText", "upgradeHoverBg",
      "sliderBg", "sliderActive", "sliderKnob", "theme"
    ];
    const theme = {};
    themeKeys.forEach(key => {
      theme[key] = localStorage.getItem(key) || "";
    });

    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MemoryThemePreset.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importThemeBtn").addEventListener("click", () => {
    document.getElementById("importThemeFile").click();
  });

  document.getElementById("importThemeFile").addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        Object.entries(parsed).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        initializeColorCustomizers(); // Refresh pickers
        document.getElementById("themeToggle").textContent = "Custom Mode";
      } catch (err) {
        alert("Invalid theme file.");
      }
    };
    reader.readAsText(file);
  });
};
