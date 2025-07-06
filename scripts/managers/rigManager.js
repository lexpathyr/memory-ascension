import { gameState } from '../core/gameState.js';
import { computerParts } from '../data/parts/parts.js';

export function renderUpgradeRack() {
  const rack = document.getElementById("upgradeRack");
  if (!rack) return;

  rack.innerHTML = "";
  if (!Array.isArray(gameState.meta.installedParts)) {
    gameState.meta.installedParts = [];
  }

  const slots = gameState.meta.storageSlots || 1;
  const installed = gameState.meta.installedParts;

  // 🔹 Row 1: Available Parts (displayed left to right)
  const partRow = document.createElement("div");
  partRow.className = "available-parts-row";

  const uninstalled = computerParts.filter(p => !installed.includes(p.id));
  if (uninstalled.length > 0 && installed.length < slots) {
    uninstalled.forEach(part => {
      const card = document.createElement("div");
      card.className = "part-card selectable";
      card.innerHTML = `
        <div class="part-icon">${part.icon}</div>
        <div class="part-name">${part.name}</div>
        <div class="part-effects">
          ${formatEffects(part.effects)}
        </div>
        <button class="install-btn">Install</button>
      `;
      card.querySelector(".install-btn").onclick = () => {
        installed.push(part.id);
        applyPartBonuses();
        renderUpgradeRack();
      };
      partRow.appendChild(card);
    });
    rack.appendChild(partRow);
  }

  // 🔹 Row 2: Installed Slots (below cards)
  const slotRow = document.createElement("div");
  slotRow.className = "installed-slots-row";

  for (let i = 0; i < slots; i++) {
    const partId = installed[i];
    const slot = document.createElement("div");
    slot.className = "upgrade-slot";

    if (partId) {
      const part = computerParts.find(p => p.id === partId);
      slot.innerHTML = `
        <div class="part-card installed">
          <div class="part-icon">${part.icon}</div>
          <div class="part-name">${part.name}</div>
          <div class="part-effects">
            ${formatEffects(part.effects)}
          </div>
          <button class="uninstall-btn" data-index="${i}">Uninstall</button>
        </div>
      `;
      slot.querySelector(".uninstall-btn").onclick = () => {
        installed.splice(i, 1);
        applyPartBonuses();
        renderUpgradeRack();
      };
    } else {
      slot.innerHTML = `<div class="part-card empty">Empty Slot</div>`;
    }

    slotRow.appendChild(slot);
  }

  rack.appendChild(slotRow);
}

export function applyPartBonuses() {
  // Start from prestige values, not hardcoded base
  const base = {
    processingPower: gameState.meta.processingPower || 0,
    speed: gameState.meta.speed || 1,
    memory: gameState.meta.memory || 0,
    storageSlots: gameState.meta.storageSlots || 1
  };

  (gameState.meta.installedParts || []).forEach(id => {
    const part = computerParts.find(p => p.id === id);
    if (part?.effects) {
      for (let stat in part.effects) {
        base[stat] += part.effects[stat];
      }
    }
  });

  const statsEl = document.getElementById("rigStatsDisplay");
  if (statsEl) {
    statsEl.innerHTML = `
      <strong>Rig Stats:</strong><br>
      Processing: ${base.processingPower} | 
      Speed: ${base.speed}x | 
      Memory: ${base.memory} MB | 
      Slots: ${base.storageSlots}
    `;
  }

  // Only update the displayed stats, do not overwrite prestige values
  gameState.meta.displayProcessingPower = base.processingPower;
  gameState.meta.displaySpeed = base.speed;
  gameState.meta.displayMemory = base.memory;
  gameState.meta.displayStorageSlots = base.storageSlots;
}

function formatEffects(effects) {
  return Object.entries(effects)
    .map(([key, value]) => `<div class="effect-line">+${value} ${capitalize(key)}</div>`)
    .join("");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}