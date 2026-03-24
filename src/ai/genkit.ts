/**
 * @module AI/Genkit Configuration
 * @status DORMANT — This module is not currently imported by any active page or server action.
 * It is retained for planned future AI integration features.
 * Last audited: 2026-03-24
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
