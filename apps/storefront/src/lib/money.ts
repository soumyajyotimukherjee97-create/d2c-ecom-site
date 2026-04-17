export function formatInr(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`
}
