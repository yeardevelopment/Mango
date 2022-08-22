export function splitify({ number }: { number: number }): string {
  return Number(number).toLocaleString('en-US');
}
