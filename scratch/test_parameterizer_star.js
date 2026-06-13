import { resolveParameters } from '../lib/parameterResolver.js';

const templateName = 'star-connection';
const paramsToSolve = { V: '415V', f: '50Hz', R: '15 ohm', XL: '0 ohm' };
const prompt = "A balanced 3-phase star connected load consists of R=15 ohm and L=0.03H coil in each phase connected to 415V, 50Hz supply.";

const resolved = resolveParameters(templateName, paramsToSolve, prompt);
console.log('Resolved parameters:', resolved.normalizedParams);
console.log('Assumed values:', resolved.assumedValues);
