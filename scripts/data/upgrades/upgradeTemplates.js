import { gameState } from '../../core/gameState.js';

// Utility to prevent duplicate passive hooks
function addPassiveHook(key, fn) {
  gameState.systems.passiveHooks = gameState.systems.passiveHooks || [];
  if (!gameState.systems._passiveHookKeys) gameState.systems._passiveHookKeys = new Set();
  if (!gameState.systems._passiveHookKeys.has(key)) {
    gameState.systems.passiveHooks.push(fn);
    gameState.systems._passiveHookKeys.add(key);
  }
}

export const upgradeTemplates = {
  /**
   * Enables auto-conversion toggle for a tier combination.
   */
  autoConvert: (from, to, amount) => () => {
    const key = `${from}_to_${to}`;
    gameState.systems.autoConvertToggles[key] = true;
  },

  /**
   * Sets a base conversion yield multiplier (e.g., 1.25x).
   */
  bonusYield: (target, bonus) => () => {
    if (target in gameState.upgrades.conversionBonuses) {
      gameState.upgrades.conversionBonuses[target] = bonus;
    }
  },

  /**
   * Adds a flat bonus to the global production multiplier.
   */
  globalMultiplierBoost: (amount) => () => {
    gameState.systems.globalMultiplier += amount;
  },

  /**
   * Activates a boolean feature flag inside the specified state section.
   * Defaults to the 'generation' section.
   */
  toggleFeature: (flagName, section = "generation") => () => {
    if (gameState[section] && !gameState[section][flagName]) {
      gameState[section][flagName] = true;
    }
  },

  /**
   * Unlocks manual convert-max behavior for the specified conversion key.
   */
  unlockConvertMax: (conversionKey) => () => {
    gameState.systems.convertMaxUnlocked[conversionKey] = true;
  },

  /**
   * Unlocks auto-convert-max behavior for the specified conversion key.
   */
  unlockAutoMax: (conversionKey) => () => {
    gameState.systems.autoConvertMaxUnlocked[conversionKey] = true;
  },

  /**
   * Executes a fully custom upgrade effect.
   */
  custom: (fn) => fn,

  /**
   * Adds a passive tick-based effect to run every gameTick.
   */
  passiveEffect: (fn, key = undefined) => () => {
    if (key) {
      addPassiveHook(key, fn);
    } else {
      gameState.systems.passiveHooks ??= [];
      gameState.systems.passiveHooks.push(fn);
    }
  },


  conversionBonus: (fromResource, bonusResource, perAmount, reward = 1) => () => {
    addPassiveHook(
      `conversionBonus_${fromResource}_${bonusResource}`,
      () => {
        const count = gameState.generation.conversionCounts[fromResource] ?? 0;
        if (count > 0 && count % perAmount === 0) {
          gameState.resources[bonusResource] = (gameState.resources[bonusResource] || 0) + reward;
        }
        if (count >= 1000) {
          gameState.generation.conversionCounts[fromResource] = count % 1000;
        }
      }
    );
  },

  /**
   * Conditionally enables a flag if a condition returns true.
   */
  conditionalToggle: (flagName, conditionFn, section = "generation") => () => {
    if (conditionFn()) {
      gameState[section] ??= {};
      gameState[section][flagName] = true;
    }
  },

  /**
   * Applies a scaling bonus to global multiplier based on resource amount.
   */
  scalingBoost: (resourceKey, rate) => () => {
    addPassiveHook(
      `scalingBoost_${resourceKey}`,
      () => {
        const amount = gameState.resources[resourceKey] || 0;
        // Diminishing returns: log2 scaling
        gameState.systems.globalMultiplier += Math.log2(amount + 1) * rate;
      }
    );
  },

  /**
   * Executes an effect for a limited number of ticks.
   */
  effectWithDuration: (fn, ticks) => () => {
    let remaining = ticks;
    const wrapper = () => {
      if (remaining > 0) {
        fn();
        remaining--;
      }
    };
    gameState.systems.passiveHooks ??= [];
    gameState.systems.passiveHooks.push(wrapper);
  }
};