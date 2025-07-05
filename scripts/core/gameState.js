// gameState.js

export const gameState = {
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

  upgrades: {
    owned: new Set(),
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

  systems: {
    autoConvertToggles: {},
    autoConvertMaxUnlocked: {},
    convertMaxUnlocked: {},
    autoTradeBatches: {},
    globalMultiplier: 1,
    revealedTiers: { bit: true },
    passiveHooks: []
  },

  meta: {
    prestigeCurrency: 0,
    totalCycles: 0,
    processingPower: 0,
    speed: 1,
    memory: 16,
    storageSlots: 1
  }
};