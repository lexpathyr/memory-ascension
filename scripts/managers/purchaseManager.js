import { gameState } from '../core/gameState.js';
import { capitalize } from '../core/utils.js';
import { refreshGameState } from './saveManager.js';
import { requestTierUpdate } from '../ui/uiRenderer.js';

// Attempts to purchase an upgrade using the specified resource
export function purchaseUpgrade(upg, resourceKey) {
  const currency = upg.currency || resourceKey;
  const playerHas = Math.floor(gameState.resources[currency] || 0);
  const cost = upg.cost;

  // Prevent duplicate purchases
  if (gameState.upgrades.owned.has(upg.key)) return;

  // Validate resource amount
  if (typeof playerHas !== 'number' || isNaN(playerHas) || playerHas < 0) {
    alert(`Invalid resource amount for ${currency}.`);
    return;
  }

  if (playerHas >= cost) {
    // Deduct cost and add upgrade
    gameState.resources[currency] -= cost;
    gameState.upgrades.owned.add(upg.key);

    // Apply upgrade effect and update state/UI
    queueMicrotask(() => {
      upg.effect();
      refreshGameState();
      requestTierUpdate();
    });

    console.debug(`[✓] Purchased: ${upg.key}`);
  } else {
    // Not enough resources
    alert(`Not enough ${capitalize(currency)}s to purchase ${upg.key}!`);
    // Optionally: add sound or visual feedback here
  }
}