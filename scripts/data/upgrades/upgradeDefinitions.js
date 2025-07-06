import { gameState } from '../../core/gameState.js';
import { upgradeTemplates } from './upgradeTemplates.js';

function createUpgrade(key, desc, cost, effect) {
  return { key, desc, cost, effect };
}

// Bit Tier Upgrades
// - Direct: bitDoubler, bitAutoClicker, bitAmplifier, pulseShaper
// - Toggle: clickBonus
const bitTier = [
  ["bitDoubler", "+1 bit per click", 5, () => gameState.generation.manualGain += 1],
  ["bitAutoClicker", "Generate 0.5 bits/sec", 10, () => { gameState.generation.bitGenAmount += 0.05; }],
  ["clickBonus", "+3 bits every 5 clicks", 20, upgradeTemplates.toggleFeature("clickBonusActive")],
  ["bitAmplifier", "x2 manual gain", 40, () => gameState.generation.manualGain *= 2],
  ["pulseShaper", "Bit gen +25%", 60, () => gameState.generation.bitGenAmount *= 1.25],
  ["bitOverclocker", "Bit gen +1/sec", 80, () => { gameState.generation.bitGenAmount += 1; }],
];

// Nibble Tier Upgrades
// - Auto: nibbleCombiner, nibbleConvertMax, nibbleAutoMax
// - Bonus: nibbleEfficiency
// - Toggle: nibbleBoost
// - Passive: nibbleShift
const nibbleTier = [
  ["nibbleCombiner", "Auto-convert bits → nibbles", 75, upgradeTemplates.autoConvert("bit", "nibble", 4)],
  ["nibbleEfficiency", "+25% nibble yield", 100, upgradeTemplates.bonusYield("nibble", 1.25)],
  ["nibbleConvertMax", "Unlock Convert Max: Bits → Nibbles", 120, upgradeTemplates.unlockConvertMax("bit_to_nibble")],
  ["nibbleAutoMax", "Auto-Convert Max: Bits → Nibbles", 140, upgradeTemplates.unlockAutoMax("bit_to_nibble")],
  ["nibbleBoost", "Nibbles boost bit gen +10%", 160, upgradeTemplates.toggleFeature("nibbleBoostEnabled")],
  ["nibbleShift", "+1 byte per 10 nibbles converted", 200, upgradeTemplates.conversionBonus("nibble", "byte", 10, 1)],
];

// Byte Tier Upgrades
// - Auto: byteAssembler, byteConvertMax, byteAutoMax
// - Bonus: byteEfficiency, byteCache
// - Passive: byteBonus
const byteTier = [
  ["byteAssembler", "Auto-convert nibbles → bytes", 250, upgradeTemplates.autoConvert("nibble", "byte", 2)],
  ["byteEfficiency", "+25% byte yield", 300, upgradeTemplates.bonusYield("byte", 1.25)],
  ["byteConvertMax", "Unlock Convert Max: Nibbles → Bytes", 350, upgradeTemplates.unlockConvertMax("nibble_to_byte")],
  ["byteAutoMax", "Auto-Convert Max: Nibbles → Bytes", 400, upgradeTemplates.unlockAutoMax("nibble_to_byte")],
  ["byteCache", "+20% global multiplier", 450, upgradeTemplates.globalMultiplierBoost(0.2)],
  ["byteBonus", "Global multiplier scales with bytes held", 500, upgradeTemplates.scalingBoost("byte", 0.001)],
  ["byteBitGenerator", "Generate 2 bits/sec", 600, () => { gameState.generation.bitGenAmount += 2; }],
];

// Kilobyte Tier Upgrades
// - Auto: kiloAssembler, kiloConvertMax, kiloAutoMax
// - Bonus: kiloEfficiency
// - Passive: threadOptimizer
// - Trade: quantumBuffer
const kiloTier = [
  ["kiloAssembler", "Auto-convert bytes → kilobytes", 600, upgradeTemplates.autoConvert("byte", "kilobyte", 1024)],
  ["kiloEfficiency", "+15% kilobyte yield", 700, upgradeTemplates.bonusYield("kilobyte", 1.15)],
  ["kiloConvertMax", "Unlock Convert Max: Bytes → Kilobytes", 750, upgradeTemplates.unlockConvertMax("byte_to_kilobyte")],
  ["kiloAutoMax", "Auto-Convert Max: Bytes → Kilobytes", 800, upgradeTemplates.unlockAutoMax("byte_to_kilobyte")],
  ["threadOptimizer", "Kilobytes boost global multiplier", 850, upgradeTemplates.scalingBoost("kilobyte", 0.00075)],
  ["quantumBuffer", "+10% global multiplier", 950, upgradeTemplates.globalMultiplierBoost(0.1)],
  ["kiloNibbleGenerator", "Generate 2 nibbles/sec", 1000, upgradeTemplates.passiveEffect(() => { gameState.resources.nibble = (gameState.resources.nibble || 0) + 2; }, "kiloNibbleGenerator")],
];

// Megabyte Tier Upgrades
// - Auto: megaAssembler, megabyteConvertMax, megabyteAutoMax
// - Bonus: megaEfficiency
// - Trade: compileDaemon
// - Passive: coreParallel
const megaTier = [
  ["megaAssembler", "Auto-convert kilobytes → megabytes", 1200, upgradeTemplates.autoConvert("kilobyte", "megabyte", 1024)],
  ["megaEfficiency", "+15% megabyte yield", 1400, upgradeTemplates.bonusYield("megabyte", 1.15)],
  ["megabyteConvertMax", "Unlock Convert Max: KB → MB", 1600, upgradeTemplates.unlockConvertMax("kilobyte_to_megabyte")],
  ["megabyteAutoMax", "Auto-Convert Max: KB → MB", 1800, upgradeTemplates.unlockAutoMax("kilobyte_to_megabyte")],
  ["compileDaemon", "+10% megabyte yield", 2000, upgradeTemplates.bonusYield("megabyte", 1.25)],
  ["coreParallel", "Megabytes boost conversion efficiency", 2200, upgradeTemplates.scalingBoost("megabyte", 0.0015)],
  ["megaByteGenerator", "Generate 2 bytes/sec", 2500, upgradeTemplates.passiveEffect(() => { gameState.resources.byte = (gameState.resources.byte || 0) + 2; }, "megaByteGenerator")],
];

// Gigabyte Tier Upgrades
// - Auto: gigaSynthesizer, gigabyteConvertMax, gigabyteAutoMax
// - Bonus: gigaEfficiency
// - Trade: gigaframeCompressor
const gigaTier = [
  ["gigaSynthesizer", "Auto-convert MB → GB", 3000, upgradeTemplates.autoConvert("megabyte", "gigabyte", 1024)],
  ["gigaEfficiency", "+20% GB yield", 3500, upgradeTemplates.bonusYield("gigabyte", 1.2)],
  ["gigabyteConvertMax", "Unlock Convert Max: MB → GB", 4000, upgradeTemplates.unlockConvertMax("megabyte_to_gigabyte")],
  ["gigabyteAutoMax", "Auto-Convert Max: MB → GB", 4500, upgradeTemplates.unlockAutoMax("megabyte_to_gigabyte")],
  ["gigaframeCompressor", "+0.5 cycles per recompile", 4800, upgradeTemplates.passiveEffect(() => { gameState.meta.prestigeCurrency += 0.5; }, "gigaframeCompressor")],
  ["gigaKilobyteGenerator", "Generate 2 kilobytes/sec", 5200, upgradeTemplates.passiveEffect(() => { gameState.resources.kilobyte = (gameState.resources.kilobyte || 0) + 2; }, "gigaKilobyteGenerator")],
];

// Terabyte Tier Upgrades
// - Auto: teraCompiler, terabyteConvertMax, terabyteAutoMax
// - Bonus: terafluxBooster
// - Trade: coreReactor
const teraTier = [
  ["teraCompiler", "Auto-convert GB → TB", 6000, upgradeTemplates.autoConvert("gigabyte", "terabyte", 1024)],
  ["terabyteConvertMax", "Unlock Convert Max: GB → TB", 7000, upgradeTemplates.unlockConvertMax("gigabyte_to_terabyte")],
  ["terabyteAutoMax", "Auto-Convert Max: GB → TB", 8000, upgradeTemplates.unlockAutoMax("gigabyte_to_terabyte")],
  ["terafluxBooster", "+25% TB yield", 8500, upgradeTemplates.bonusYield("terabyte", 1.25)],
  ["coreReactor", "+10% TB yield", 9000, upgradeTemplates.bonusYield("terabyte", 1.35)],
  ["teraMegabyteGenerator", "Generate 2 megabytes/sec", 9500, upgradeTemplates.passiveEffect(() => { gameState.resources.megabyte = (gameState.resources.megabyte || 0) + 2; }, "teraMegabyteGenerator")],
];

// Petabyte Tier Upgrades
// - Auto: petawriter, petabyteConvertMax, petabyteAutoMax
// - Bonus: dataCondenser
// - Trade: hyperscalarEngine
const petaTier = [
  ["petawriter", "Auto-convert TB → PB", 10000, upgradeTemplates.autoConvert("terabyte", "petabyte", 1024)],
  ["petabyteConvertMax", "Unlock Convert Max: TB → PB", 11000, upgradeTemplates.unlockConvertMax("terabyte_to_petabyte")],
  ["petabyteAutoMax", "Auto-Convert Max: TB → PB", 12500, upgradeTemplates.unlockAutoMax("terabyte_to_petabyte")],
  ["dataCondenser", "+30% PB yield", 13500, upgradeTemplates.bonusYield("petabyte", 1.3)],
  ["hyperscalarEngine", "+1 cycle per recompile", 15000, upgradeTemplates.passiveEffect(() => { gameState.meta.prestigeCurrency += 1; }, "hyperscalarEngine")],
  ["petaGigabyteGenerator", "Generate 2 gigabytes/sec", 16000, upgradeTemplates.passiveEffect(() => { gameState.resources.gigabyte = (gameState.resources.gigabyte || 0) + 2; }, "petaGigabyteGenerator")],
];

const allUpgrades = [
  ...bitTier,
  ...nibbleTier,
  ...byteTier,
  ...kiloTier,
  ...megaTier,
  ...gigaTier,
  ...teraTier,
  ...petaTier
];

export const upgradeDefinitions = Object.fromEntries(
  allUpgrades.map(([key, desc, cost, effect]) => [key, createUpgrade(key, desc, cost, effect)])
);