/** An empty text is no number. */
export function parseNumber(text: string): number | null {
  return text.trim() === '' ? null : Number(text);
}
