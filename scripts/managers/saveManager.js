import { gameState } from '../core/gameState.js';
import { tierData } from '../data/tiers/tierData.js';
import { updateDisplay } from './displayManager.js';
import { requestTierUpdate } from '../ui/uiRenderer.js';
import { applyPartBonuses } from './rigManager.js';
import { initializeThemeToggleText } from './themeManager.js';


/**
 * @fileoverview Handles saving, loading, exporting, importing, and resetting game state for Memory Ascension.
 * @module managers/saveManager
 */

const SAVE_KEY = "memAscendSave";

// 🧱 Default resource scaffold to ensure all expected keys exist
const defaultResources = {
  bit: 0,
  nibble: 0,
  byte: 0,
  kilobyte: 0,
  megabyte: 0,
  gigabyte: 0,
  terabyte: 0,
  petabyte: 0
};

const defaultGeneration = {
  manualGain: 1,
  bitGenAmount: 0,
  clickCounter: 0,
  clickBonusActive: false,
  nibbleBoostEnabled: false,
  nibbleShift: false
};

const defaultSystems = {
  autoConvertToggles: {},
  autoConvertMaxUnlocked: {},
  convertMaxUnlocked: {},
  autoTradeBatches: {},
  globalMultiplier: 1,
  globalConversionSpeed: 1000,
  revealedTiers: { bit: true },
  passiveHooks: [],
  _passiveHookKeys: new Set()
};

const defaultMeta = {
  prestigeCurrency: 0,
  totalCycles: 0,
  processingPower: 0,
  speed: 1,
  memory: 16,
  storageSlots: 1
};

/**
 * Saves the current game state to localStorage (serializes Sets as arrays).
 */
export function saveGame() {
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
        // passiveHooks and _passiveHookKeys are not saved (reconstructed on load)
      },
      meta: { ...gameState.meta }
    }
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

/**
 * Loads the game state from localStorage and merges with defaults.
 * Re-applies all upgrade effects and updates UI.
 */
export function loadGame() {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
  if (!saved || !saved.gameState) return;

  Object.assign(gameState.resources, {
    ...defaultResources,
    ...(saved.gameState.resources || {})
  });

  Object.assign(gameState.generation, {
    ...defaultGeneration,
    ...(saved.gameState.generation || {})
  });

  Object.assign(gameState.systems, {
    ...defaultSystems,
    ...(saved.gameState.systems || {})
  });
  // Always reset passiveHooks and _passiveHookKeys on load
  gameState.systems.passiveHooks = [];
  gameState.systems._passiveHookKeys = new Set();

  // Merge meta, but always preserve the highest value for prestige stats
  const metaKeys = ["processingPower", "speed", "memory", "storageSlots", "computingPrestigeCount", "prestigeCurrency", "totalCycles"];
  for (const key of metaKeys) {
    const savedVal = saved.gameState.meta && saved.gameState.meta[key];
    const defaultVal = defaultMeta[key];
    // Use the saved value if it exists, otherwise default
    gameState.meta[key] = (typeof savedVal !== "undefined") ? savedVal : defaultVal;
  }
  // Merge any other meta fields (like computingTabUnlocked, etc)
  Object.assign(gameState.meta, {
    ...defaultMeta,
    ...(saved.gameState.meta || {})
  });

  gameState.upgrades.owned.clear();
  (saved.gameState.upgrades || []).forEach(key => gameState.upgrades.owned.add(key));

  // Re-apply all upgrade effects
  tierData.forEach(tier => {
    tier.upgrades.forEach(upg => {
      if (gameState.upgrades.owned.has(upg.key)) {
        try {
          // Only apply autoConvert effect if toggle is not present in save
          if (
            typeof upg.effect === 'function' &&
            upg.desc &&
            upg.desc.toLowerCase().includes('auto-convert') &&
            upg.key.endsWith('Assembler')
          ) {
            // Derive the convertKey from the upgrade
            const match = upg.desc.match(/([a-z]+) → ([a-z]+)/i);
            if (match) {
              const from = match[1].toLowerCase();
              const to = match[2].toLowerCase();
              const convertKey = `${from}_to_${to}`;
              if (!(convertKey in gameState.systems.autoConvertToggles)) {
                upg.effect();
              }
            } else {
              upg.effect(); // fallback
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

  if (!saved.gameState || !saved.gameState.resources || !('nibble' in saved.gameState.resources)) {
    console.warn("Incomplete save detected, falling back to default.");
    resetGame(); // or just reassign gameState to default without reload
    return;
  }

  applyPartBonuses();
  checkUnlocks();
  refreshGameState();
  requestTierUpdate();
}

/**
 * Resets the game to default state, clearing localStorage and reloading the page.
 */
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

/**
 * Exports the current save to a downloadable JSON file.
 */
export function exportSave() {
  const data = localStorage.getItem(SAVE_KEY);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "MemoryAscensionSave.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers the file input for importing a save file.
 */
export function importSave() {
  document.getElementById("importFile").click();
}

/**
 * Handles importing a save file from the user's computer.
 * @param {Event} event - File input change event.
 */
export function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
      alert("Save imported successfully!");

      try {
        loadGame();
        checkUnlocks();
      } catch (loadError) {
        console.warn("Save imported but failed to load:", loadError);
      }

    } catch (err) {
      alert("Failed to import save. Invalid file format.");
      console.error("Import failed:", err);
    }
  };
  reader.readAsText(file);
}

// 🔁 Minor UI helpers
/**
 * Updates the display and saves the game state.
 */
export function refreshGameState() {
  updateDisplay();
  saveGame();
}

/**
 * Checks and updates UI unlocks (e.g., terminal tab visibility) based on meta progression.
 */
export function checkUnlocks() {
  const terminalTab = document.getElementById("tabTerminal");
  if (terminalTab && (gameState.meta.prestigeCurrency || 0) >= 50) {
    terminalTab.style.display = "inline-block";
  }
}
