/**
 * If the result of subtraction is lesser than 0, then returns 0, otherwise
 * return the result.
 */
export function saturatingSub(lhs: number, rhs: number): number {
  if (lhs - rhs < 0) {
    return 0;
  } else {
    return lhs - rhs;
  }
}
