import { mapDataEntries, mapSecurityPractices } from '../datasafety.js';

export const FALLBACK_MAPPINGS_DATASAFETY = [
  {
    name: 'mappingV1',
    mapping: {
      sharedData: { path: ['ds:3', 1, 2, 137, 4, 0, 0], fun: mapDataEntries },
      collectedData: { path: ['ds:3', 1, 2, 137, 4, 1, 0], fun: mapDataEntries },
      securityPractices: { path: ['ds:3', 1, 2, 137, 9, 2], fun: mapSecurityPractices },
      privacyPolicyUrl: ['ds:3', 1, 2, 99, 0, 5, 2]
    }
  },
  {
    name: 'mappingV2',
    mapping: {
      sharedData: { path: ['ds:3', 1, 2, 1, 138, 4, 0, 0], fun: mapDataEntries },
      collectedData: { path: ['ds:3', 1, 2, 1, 138, 4, 1, 0], fun: mapDataEntries },
      securityPractices: { path: ['ds:3', 1, 2, 1, 138, 9, 2], fun: mapSecurityPractices },
      privacyPolicyUrl: ['ds:3', 1, 2, 1, 100, 0, 5, 2]
    }
  }
];


