
/**
 * @fileoverview Maps program schemas to program data, attaching program definitions for each schema.
 * @module data/programs/programData
 */
import { programDefinitions } from './programDefinitions.js';
import { programSchemas } from './programSchemas.js';


/**
 * Array of program data objects, each with attached program definitions.
 * @type {Array<Object>}
 */
export const programData = programSchemas.map(schema => ({
  ...schema,
  programs: schema.programs.map(key => programDefinitions[key])
}));