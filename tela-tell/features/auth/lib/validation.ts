export function isValidUsername(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_.]{2,19}$/.test(value.trim());
}