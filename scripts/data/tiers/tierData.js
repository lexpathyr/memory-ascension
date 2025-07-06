
/**
 * @fileoverview Maps tier schemas to tier data, attaching upgrade definitions for each tier.
 * @module data/tiers/tierData
 */


import { tierSchemas } from './tierSchemas.js';
import { upgradeDefinitions } from '../upgrades/upgradeDefinitions.js';


/**
 * Array of tier data objects, each with attached upgrade definitions.
 * @type {Array<Object>}
 */
export const tierData = tierSchemas.map(tier => ({
  ...tier,
  upgrades: tier.upgrades.map(key => upgradeDefinitions[key])
}));