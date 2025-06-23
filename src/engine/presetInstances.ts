import type { ObjaxInstanceDefinition } from './types';

// Preset instances that are always available
export const presetInstances: ObjaxInstanceDefinition[] = [
  {
    name: 'world',
    className: 'World',
    properties: {
      currentPage: ''
    }
  }
];