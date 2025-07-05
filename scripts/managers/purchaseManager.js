import { gameState } from '../core/gameState.js';
import { capitalize } from '../core/utils.js';
import { refreshGameState } from './saveManager.js';
import { requestTierUpdate } from '../ui/uiRenderer.js';

export function purchaseUpgrade(upg, resourceKey) {
  const currency = upg.currency || resourceKey;
  const playerHas = Math.floor(gameState.resources[currency] || 0);
  const cost = upg.cost;

  if (gameState.upgrades.owned.has(upg.key)) return;

  if (playerHas >= cost) {
    gameState.resources[currency] -= cost;
    gameState.upgrades.owned.add(upg.key);

    queueMicrotask(() => {
      upg.effect();
      refreshGameState();
      requestTierUpdate();
    });

    console.debug(`[✓] Purchased: ${upg.key}`);
  } else {
    alert(`Not enough ${capitalize(currency)}s to purchase ${upg.key}!`);
  }
}