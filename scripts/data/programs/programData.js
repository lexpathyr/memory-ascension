// programData.js
import { programDefinitions } from './programDefinitions.js';
import { programSchemas } from './programSchemas.js';

export const programData = programSchemas.map(schema => ({
  ...schema,
  programs: schema.programs.map(key => programDefinitions[key])
}));