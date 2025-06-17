// src/tools/fiberPathCalculator/index.ts
// This file will export the public functions and types from the fiberPathCalculator module.

export type { FiberPathResult, FiberCalculatorParams, FiberPathSegment } from './types';
export { performFiberPathAnalysisAction } from './actions';
// export { calculateFiberPath } from './calculator'; // Core logic, might not be directly exported if only used by actions
