import { gameState } from '../../core/gameState.js';

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
   * Registers a passive resource trade to be processed during tick updates.
   */
  resourceTrade: (from, to, batchSize) => () => {
    const key = `${from}_to_${to}`;
    gameState.systems.autoTradeBatches ??= {};
    gameState.systems.autoTradeBatches[key] = batchSize;
  },

  /**
   * Activates a boolean feature flag inside the specified state section.
   * Defaults to the 'generation' section.
   */
  toggleFeature: (flagName, section = "generation") => () => {
    if (gameState[section] && flagName in gameState[section]) {
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
  passiveEffect: (fn) => () => {
    gameState.systems.passiveHooks ??= [];
    gameState.systems.passiveHooks.push(fn);
  },


  conversionBonus: (fromResource, bonusResource, perAmount, reward = 1) => () => {
    const wrapper = () => {
      const count = gameState.generation.conversionCounts[fromResource] ?? 0;

      if (count > 0 && count % perAmount === 0) {
        gameState.resources[bonusResource] = (gameState.resources[bonusResource] || 0) + reward;
      }

      if (count >= 1000) {
        gameState.generation.conversionCounts[fromResource] = count % 1000;
      }
    };
    gameState.systems.passiveHooks ??= [];
    gameState.systems.passiveHooks.push(wrapper);
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
    gameState.systems.passiveHooks ??= [];
    gameState.systems.passiveHooks.push(() => {
      const amount = gameState.resources[resourceKey] || 0;
      gameState.systems.globalMultiplier += amount * rate;
    });
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