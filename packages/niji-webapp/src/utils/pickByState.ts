/**
 * Given a `state` value, returns the corresponding entry in `stateResults` by index lookup.
 * Generic over the state type `S` and the result type `R` so call sites stop losing type info.
 */
export const usePickByState = <S, R>(
  state: S,
  states: readonly S[],
  stateResults: readonly R[],
): R => {
  return stateResults[states.indexOf(state)];
};
