export function ratioOk(adults: number, children: number, present: number, staffOnFloor = 1) {
  if (present === 0) return true;
  const required = Math.ceil(present / children) * adults;
  return staffOnFloor >= required;
}

export function requiredAdults(adults: number, children: number, present: number) {
  if (present === 0) return 0;
  return Math.ceil(present / children) * adults;
}
