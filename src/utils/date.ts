export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length < 4) return digits;
  if (digits.length === 4) return `${digits}/`;
  if (digits.length < 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  if (digits.length === 6) return `${digits.slice(0, 4)}/${digits.slice(4)}/`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

export function toDateInput(date: Date): string {
  return toISODate(date).replace(/-/g, "/");
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})([-/])(\d{2})\2(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[3]);
  const day = Number(match[4]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function isISODate(value: string): boolean {
  return parseISODate(value) !== null;
}
