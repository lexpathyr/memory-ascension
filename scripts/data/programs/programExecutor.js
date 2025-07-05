// programExecutor.js

import { gameState } from '../../core/gameState.js';
import { requestTierUpdate } from '../../ui/uiRenderer.js';
import { programSchemas } from './programSchemas.js';

const runningPrograms = new Map();

function isProgramUnlocked(key) {
  const prestige = gameState.meta.prestigeCurrency || 0;
  return programSchemas.some(schema => 
    prestige >= schema.unlockThreshold && schema.programs.includes(key)
  );
}

export function runProgram(program) {
  const { key, name, cost, dataRequired, duration, effect } = program;

  if (!isProgramUnlocked(key)) {
    alert(`"${name}" has not been unlocked yet.`);
    return false;
  }
  
  // 1. Check cycle cost
  if (gameState.meta.prestigeCurrency < cost) {
    alert(`You need ${cost} cycles to run "${name}".`);
    return false;
  }

  // 2. Check data requirements
  for (let resource in dataRequired) {
    if ((gameState.resources[resource] || 0) < dataRequired[resource]) {
      alert(`Not enough ${resource}s to allocate for "${name}".`);
      return false;
    }
  }

  // 3. Deduct cycles and lock resources
  gameState.meta.prestigeCurrency -= cost;
  const locked = {};
  for (let resource in dataRequired) {
    locked[resource] = dataRequired[resource];
    gameState.resources[resource] -= dataRequired[resource];
  }

  // 4. Track program state
  runningPrograms.set(key, {
    key,
    name,
    timeRemaining: duration,
    totalDuration: duration,
    effect,
    locked
  });

  requestTierUpdate(); // for UI feedback
  return true;
}

export function cancelProgram(key) {
  const prog = runningPrograms.get(key);
  if (!prog) return;

  // Refund locked data
  for (let resource in prog.locked) {
    gameState.resources[resource] += prog.locked[resource];
  }

  runningPrograms.delete(key);
  requestTierUpdate();
}

export function tickPrograms() {
  for (let [key, prog] of runningPrograms) {
    prog.timeRemaining -= 1;

    if (prog.timeRemaining <= 0) {
      try {
        prog.effect();
      } catch (err) {
        console.warn(`Error running program ${key}:`, err);
      }
      runningPrograms.delete(key);
    }
  }
}

export function getRunningPrograms() {
  return [...runningPrograms.values()];
}