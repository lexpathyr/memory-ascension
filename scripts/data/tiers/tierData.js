// tierData.js

import { tierSchemas } from './tierSchemas.js';
import { upgradeDefinitions } from '../upgrades/upgradeDefinitions.js';

export const tierData = tierSchemas.map(tier => ({
  ...tier,
  upgrades: tier.upgrades.map(key => upgradeDefinitions[key])
}));