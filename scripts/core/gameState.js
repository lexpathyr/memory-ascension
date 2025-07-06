
/**
 * @fileoverview Defines the main game state object for Memory Ascension, including resources, upgrades, automation, and meta progression.
 * @module core/gameState
 */

/**
 * Main game state object containing all persistent and runtime state for the player.
 * @type {{
 *   resources: Object,
 *   upgrades: {
 *     owned: Set<string>,
 *     conversionBonuses: Object
 *   },
 *   generation: Object,
 *   systems: Object,
 *   meta: Object
 * }}
 */
export const gameState = {
  // All player resources by tier
  resources: {
    bit: 0,
    nibble: 0,
    byte: 0,
    kilobyte: 0,
    megabyte: 0,
    gigabyte: 0,
    terabyte: 0,
    petabyte: 0
  },

  // Upgrade state
  upgrades: {
    owned: new Set(), // Set of owned upgrade keys (serialize as array for save/load)
    conversionBonuses: {
      nibble: 1,
      byte: 1,
      kilobyte: 1,
      megabyte: 1,
      gigabyte: 1,
      terabyte: 1,
      petabyte: 1
    }
  },

  // Generation and conversion state
  generation: {
    manualGain: 1,
    bitGenAmount: 0,
    clickCounter: 0,
    clickBonusActive: false,
    nibbleBoostEnabled: false,
    conversionCounts: {
      nibble: 0,
      byte: 0,
      kilobyte: 0,
      megabyte: 0,
      gigabyte: 0,
      terabyte: 0,
      petabyte: 0
    }
  },

  // System-level automation, unlocks, and passive effects
  systems: {
    autoConvertToggles: {},
    autoConvertMaxUnlocked: {},
    convertMaxUnlocked: {},
    autoTradeBatches: {},
    globalMultiplier: 1,
    revealedTiers: { bit: true },
    passiveHooks: [],
    // Track which passive hooks have been added to prevent duplicates
    _passiveHookKeys: new Set()
  },

  // Meta/progression stats
  meta: {
    prestigeCurrency: 0,
    totalCycles: 0,
    computingPrestigeCount: 0,
    processingPower: 0,
    speed: 1,
    memory: 16,
    storageSlots: 1,
    // Add a new flag to track computing tab unlock
    computingTabUnlocked: false
  }
};

// In your recompile (prestige) logic, after updating cycles:
if (!gameState.meta.computingTabUnlocked && (gameState.meta.prestigeCurrency || 0) >= 50) {
  gameState.meta.computingTabUnlocked = true;
  // Optionally, show a notification to the player
  setTimeout(() => {
    alert('Computing tab unlocked! You can now access advanced programs.');
  }, 200);
}

// In your window.onload or display update logic, use the boolean to show/hide the tab:
if (gameState.meta.computingTabUnlocked) {
  document.getElementById("tabTerminal").style.display = "inline-block";
}