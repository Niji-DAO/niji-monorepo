/**
 * Given a `state` value, returns the corresponding entry in `stateResults` by index lookup.
 * Generic over the state type `S` and the result type `R` so call sites stop losing type info.
 * @returns the matched result, or `undefined` if `state` is not in `states` or `stateResults`
 *          is shorter than `states` (runtime-honest: `Array.indexOf(...)` can be `-1`).
 */
export const usePickByState = <S, R>(
  state: S,
  states: readonly S[],
  stateResults: readonly R[],
): R | undefined => {
  return stateResults[states.indexOf(state)];
};
