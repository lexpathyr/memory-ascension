
/**
 * @fileoverview Handles rendering and updating the tier UI, upgrades, and conversion controls for Memory Ascension.
 * @module ui/uiRenderer
 */

import { gameState } from '../core/gameState.js';
import { tierData } from '../data/tiers/tierData.js';
import { capitalize, conversionRate } from '../core/utils.js';
import { purchaseUpgrade } from '../managers/purchaseManager.js';
import { manualConvert, manualConvertMax, generateBit } from '../core/engine.js';

let tierUpdatePending = true;

/**
 * Requests a tier UI update on the next tick.
 */
export function requestTierUpdate() {
  tierUpdatePending = true;
}

/**
 * Updates the tier UI if a tier update is pending.
 */
export function updateTiersIfDirty() {
  if (tierUpdatePending) {
    renderTiers();
    tierUpdatePending = false;
  }
}

/**
 * Builds the initial tier layout in the UI, creating sections for each revealed tier.
 */
export function buildTierLayout() {
  const container = document.getElementById("tiers");
  tierData.forEach((tier, index) => {
    const tierKey = tier.key;
    const lowerKey = index > 0 ? tierData[index - 1].key : null;
    if (tier.key === "kilobyte" && (gameState.meta.prestigeCurrency || 0) < 50) return;
    if (
      lowerKey &&
      !gameState.systems.revealedTiers[tierKey] &&
      (gameState.resources[lowerKey] || 0) >= tier.threshold
    ) {
      gameState.systems.revealedTiers[tierKey] = true;
    }
    if (!gameState.systems.revealedTiers[tierKey]) return;
    if (!document.getElementById(`tier-${tierKey}`)) {
      const section = document.createElement("div");
      section.className = "tier fade-in";
      section.id = `tier-${tierKey}`;
      const header = document.createElement("h2");
      header.textContent = `${tier.name} Tier`;
      section.appendChild(header);
      const list = document.createElement("div");
      list.className = "upgrade-list";
      section.appendChild(list);
      container.appendChild(section);
    }
  });
}

/**
 * Renders all revealed tiers, upgrades, and conversion controls in the UI.
 * @private
 */
function renderTiers() {
  tierData.forEach((tier, index) => {
    const tierKey = tier.key;
    const lowerKey = index > 0 ? tierData[index - 1].key : null;
    // Softlock kilobyte tier behind 50 cycles
    if (tier.key === "kilobyte" && (gameState.meta.prestigeCurrency || 0) < 50) return;
    // Reveal new tier if threshold met
    if (
      lowerKey &&
      !gameState.systems.revealedTiers[tierKey] &&
      (gameState.resources[lowerKey] || 0) >= tier.threshold
    ) {
      gameState.systems.revealedTiers[tierKey] = true;
      // Create the tier section if it doesn't exist
      if (!document.getElementById(`tier-${tierKey}`)) {
        const container = document.getElementById("tiers");
        const section = document.createElement("div");
        section.className = "tier fade-in";
        section.id = `tier-${tierKey}`;
        const header = document.createElement("h2");
        header.textContent = `${tier.name} Tier`;
        section.appendChild(header);
        const list = document.createElement("div");
        list.className = "upgrade-list";
        section.appendChild(list);
        container.appendChild(section);
      }
    }
    const section = document.getElementById(`tier-${tier.key}`);
    if (!section) return;
    const list = section.querySelector(".upgrade-list");
    list.innerHTML = "";
    renderUpgrades(list, tier);
    renderConversions(section, tier, index);
    if (tier.key === "bit") renderBitButton(section);
  });
}

/**
 * Renders the list of available upgrades for a tier.
 * @param {HTMLElement} listEl - The element to render upgrades into.
 * @param {Object} tier - The tier data object.
 * @private
 */
function renderUpgrades(listEl, tier) {
  const tierKey = tier.key;

  tier.upgrades.forEach((upg) => {
    const isAutoMax = upg.key.endsWith("AutoMax");
    if (isAutoMax) {
      const hasBase = tier.upgrades.some(base =>
        /Combiner|Assembler|Synthesizer|Compiler|writer/.test(base.key) &&
        gameState.upgrades.owned.has(base.key)
      );
      if (!hasBase) return;
    }

    if (!gameState.upgrades.owned.has(upg.key)) {
      const el = document.createElement("div");
      el.className = "upgrade";
      el.innerHTML = `
        <strong>${upg.key}</strong><br>
        ${upg.desc}<br>
        Cost: ${upg.cost} ${tierKey}s
      `;
      el.onclick = () => purchaseUpgrade(upg, tierKey);
      listEl.appendChild(el);
    }
  });
}

/**
 * Renders conversion buttons and auto-convert controls for a tier.
 * @param {HTMLElement} section - The tier section element.
 * @param {Object} tier - The tier data object.
 * @param {number} index - The index of the tier in tierData.
 * @private
 */
function renderConversions(section, tier, index) {
  // Clear previous buttons
  [...section.querySelectorAll(".conversion-button, .toggle-button, label.slider-label")].forEach(el => el.remove());

  const tierKey = tier.key;
  const lowerIndex = index - 1;

  // Make sure a lower tier exists
  if (lowerIndex < 0) return;

  const lowerTier = tierData[lowerIndex];
  const fromKey = lowerTier.key;
  const toKey = tierKey;
  const convertKey = `${fromKey}_to_${toKey}`;

  // Convert button (single)
  const singleRate = conversionRate(fromKey, toKey);
  const convertBtn = document.createElement("button");
  convertBtn.className = "conversion-button";
  convertBtn.textContent = `Convert ${singleRate} ${capitalize(fromKey)}s → 1 ${capitalize(toKey)}`;
  convertBtn.onclick = () => manualConvert(fromKey, toKey);
  section.appendChild(convertBtn);

  // Convert Max button
  if (gameState.systems.convertMaxUnlocked[convertKey]) {
    const convertMaxBtn = document.createElement("button");
    convertMaxBtn.className = "conversion-button";
    convertMaxBtn.textContent = `Convert max ${capitalize(fromKey)}s → ${capitalize(toKey)}s`;
    convertMaxBtn.onclick = () => manualConvertMax(fromKey, toKey);
    section.appendChild(convertMaxBtn);
  }

  // Auto-Convert toggle and slider
  if (convertKey in gameState.systems.autoConvertToggles) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-button";
    toggleBtn.textContent = gameState.systems.autoConvertToggles[convertKey]
      ? "Pause Auto-Convert"
      : "Resume Auto-Convert";
    toggleBtn.onclick = () => {
      const next = !gameState.systems.autoConvertToggles[convertKey];
      gameState.systems.autoConvertToggles[convertKey] = next;
      toggleBtn.textContent = next ? "Pause Auto-Convert" : "Resume Auto-Convert";
    };
    section.appendChild(toggleBtn);

    if (gameState.systems.autoConvertMaxUnlocked[convertKey]) {
      const label = document.createElement("label");
      label.className = "slider-label";
      label.style.marginLeft = "10px";
      label.style.display = "inline-block";
      label.style.color = "var(--text-color)";
      label.textContent = "Auto-Convert Max";

      const slider = document.createElement("input");
      slider.type = "checkbox";
      slider.checked = gameState.systems.autoConvertToggles[convertKey + "_max"] ?? false;
      slider.className = "auto-slider";
      slider.style.marginLeft = "8px";
      slider.onchange = () => {
        gameState.systems.autoConvertToggles[convertKey + "_max"] = slider.checked;
      };

      label.appendChild(slider);
      section.appendChild(label);
    }
  }
}

/**
 * Renders the manual bit generation button for the bit tier.
 * @param {HTMLElement} section - The tier section element.
 * @private
 */
function renderBitButton(section) {
  const bitBtn = document.createElement("button");
  bitBtn.className = "conversion-button";
  bitBtn.textContent = "Manual Bit +1";
  bitBtn.onclick = generateBit;
  section.appendChild(bitBtn);
}