// ==========================
// 📦 Imports & Constants
// ==========================
import { gameState } from '../core/gameState.js';
import { tierData } from '../data/tiers/tierData.js';
import { updateDisplay } from './displayManager.js';
import { requestTierUpdate } from '../ui/uiRenderer.js';
import { applyPartBonuses } from './rigManager.js';
import { applyCustomColors } from './themeManager.js';

// Storage key
const SAVE_KEY = "memAscendSave";

// Theme keys to persist
export const themeKeys = [
  "theme", "customBg", "customText", "customButton", "customButtonHover",
  "cardBg", "upgradeBg", "upgradeText", "upgradeHoverBg",
  "sliderBg", "sliderActive", "sliderKnob"
];

// Default values for reset
const defaultResources = {
  bit: 0, nibble: 0, byte: 0, kilobyte: 0, megabyte: 0,
  gigabyte: 0, terabyte: 0, petabyte: 0
};

const defaultGeneration = {
  manualGain: 1, bitGenAmount: 0, clickCounter: 0,
  clickBonusActive: false, nibbleBoostEnabled: false, nibbleShift: false
};

const defaultSystems = {
  autoConvertToggles: {}, autoConvertMaxUnlocked: {}, convertMaxUnlocked: {},
  autoTradeBatches: {}, globalMultiplier: 1, globalConversionSpeed: 1000,
  revealedTiers: { bit: true }, passiveHooks: [], _passiveHookKeys: new Set()
};

const defaultMeta = {
  prestigeCurrency: 0, totalCycles: 0,
  processingPower: 0, speed: 1, memory: 16, storageSlots: 1
};

// ==========================
// 💾 Save Logic
// ==========================
export function saveGame() {
  const themeSettings = {};
  themeKeys.forEach(key => {
    themeSettings[key] = localStorage.getItem(key);
  });

  const saveData = {
    gameState: {
      resources: { ...gameState.resources },
      upgrades: Array.from(gameState.upgrades.owned),
      generation: { ...gameState.generation },
      systems: {
        revealedTiers: { ...gameState.systems.revealedTiers },
        convertMaxUnlocked: { ...gameState.systems.convertMaxUnlocked },
        autoConvertMaxUnlocked: { ...gameState.systems.autoConvertMaxUnlocked },
        autoConvertToggles: { ...gameState.systems.autoConvertToggles },
        autoTradeBatches: { ...gameState.systems.autoTradeBatches },
        globalMultiplier: gameState.systems.globalMultiplier,
        globalConversionSpeed: gameState.systems.globalConversionSpeed
      },
      meta: { ...gameState.meta },
      themeSettings
    }
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  requestTierUpdate();
}

// ==========================
// 📥 Load Logic
// ==========================
export function loadGame() {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
  if (!saved?.gameState) return;

  // Restore theme
  const theme = saved.gameState.themeSettings;
  if (theme) {
    themeKeys.forEach(key => {
      if (key in theme) {
        localStorage.setItem(key, theme[key] ?? "");
      }
    });
    if (theme.theme === "custom") {
      applyCustomColors();
      const toggle = document.getElementById("themeToggle");
      if (toggle) toggle.textContent = "Custom Mode";
    }
  }

  Object.assign(gameState.resources, { ...defaultResources, ...(saved.gameState.resources || {}) });
  Object.assign(gameState.generation, { ...defaultGeneration, ...(saved.gameState.generation || {}) });
  Object.assign(gameState.systems, { ...defaultSystems, ...(saved.gameState.systems || {}) });
  gameState.systems.passiveHooks = [];
  gameState.systems._passiveHookKeys = new Set();

  const metaKeys = [
    "processingPower", "speed", "memory", "storageSlots",
    "computingPrestigeCount", "prestigeCurrency", "totalCycles"
  ];
  metaKeys.forEach(key => {
    const val = saved.gameState.meta?.[key];
    gameState.meta[key] = (typeof val !== "undefined") ? val : defaultMeta[key];
  });

  Object.assign(gameState.meta, { ...defaultMeta, ...(saved.gameState.meta || {}) });

  gameState.upgrades.owned.clear();
  (saved.gameState.upgrades || []).forEach(key => gameState.upgrades.owned.add(key));

  tierData.forEach(tier => {
    tier.upgrades.forEach(upg => {
      if (gameState.upgrades.owned.has(upg.key)) {
        try {
          const autoConvert =
            typeof upg.effect === 'function' &&
            upg.desc?.toLowerCase().includes('auto-convert') &&
            upg.key.endsWith('Assembler');

          if (autoConvert) {
            const match = upg.desc.match(/([a-z]+) → ([a-z]+)/i);
            const convertKey = match ? `${match[1].toLowerCase()}_to_${match[2].toLowerCase()}` : null;
            if (!convertKey || !(convertKey in gameState.systems.autoConvertToggles)) {
              upg.effect();
            }
          } else {
            upg.effect();
          }
        } catch (err) {
          console.warn(`Error applying upgrade: ${upg.key}`, err);
        }
      }
    });
  });

  if (!saved.gameState.resources?.nibble) {
    console.warn("Incomplete save detected. Resetting...");
    resetGame();
    return;
  }

  applyPartBonuses();
  checkUnlocks();
  refreshGameState();
  requestTierUpdate();
}

// ==========================
// 🧹 Reset Logic
// ==========================
export function resetGame() {
  if (!confirm("Are you sure? This will wipe everything.")) return;
  localStorage.clear();

  Object.assign(gameState.resources, { ...defaultResources });
  Object.assign(gameState.generation, { ...defaultGeneration });
  Object.assign(gameState.systems, { ...defaultSystems });
  gameState.systems.passiveHooks = [];
  gameState.systems._passiveHookKeys = new Set();
  Object.assign(gameState.meta, { ...defaultMeta });

  gameState.upgrades.owned.clear();
  location.reload();
}

// ==========================
// ⬆️ Export & ⬇️ Import
// ==========================
export function exportSave() {
  const savedData = JSON.parse(localStorage.getItem(SAVE_KEY));
  if (!savedData) return;

  const blob = new Blob([JSON.stringify(savedData)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "MemoryAscensionSave.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importSave() {
  document.getElementById("importFile").click();
}

export function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));

      const theme = parsed.gameState?.themeSettings;
      if (theme) {
        themeKeys.forEach(key => {
          if (key in theme) {
            localStorage.setItem(key, theme[key] ?? "");
          }
        });
        if (theme.theme === "custom") {
          applyCustomColors();
          const toggle = document.getElementById("themeToggle");
          if (toggle) toggle.textContent = "Custom Mode";
        }
      }

      alert("Save imported successfully!");
      loadGame();
      checkUnlocks();
    } catch (err) {
      alert("Failed to import save. Invalid file format.");
      console.error("Import failed:", err);
    }
  };

  reader.readAsText(file);
}

// ==========================
// 🔁 Helpers
// ==========================
export function refreshGameState() {
  updateDisplay();
  saveGame();
}

export function checkUnlocks() {
  const terminalTab = document.getElementById("tabTerminal");
  if (terminalTab && (gameState.meta.prestigeCurrency || 0) >= 50) {
    terminalTab.style.display = "inline-block";
  }
}