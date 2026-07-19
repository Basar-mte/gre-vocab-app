/**
 * Parses a free-form set-selection string like "1-5, 8, 10-12" into a
 * sorted, de-duplicated array of set numbers. Used together with the
 * checkbox grid so students can either click sets or type a range.
 */
export function parseSetRanges(input: string): number[] {
  const result = new Set<number>();
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      let start = parseInt(rangeMatch[1], 10);
      let end = parseInt(rangeMatch[2], 10);
      if (start > end) [start, end] = [end, start];
      for (let i = start; i <= end; i++) result.add(i);
    } else if (/^\d+$/.test(part)) {
      result.add(parseInt(part, 10));
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

export function formatSetNumbers(numbers: number[]): string {
  if (numbers.length === 0) return "";
  const sorted = [...numbers].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    if (current !== prev + 1) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = current;
    }
    prev = current;
  }

  return ranges.join(", ");
}
