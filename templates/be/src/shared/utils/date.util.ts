export class DateUtil {
  static nowIso(): string {
    return new Date().toISOString();
  }

  static now(): Date {
    return new Date();
  }

  static toIso(date: Date): string {
    return date.toISOString();
  }

  static addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  static addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  static isExpired(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  static diffSeconds(a: Date, b: Date): number {
    return Math.round((a.getTime() - b.getTime()) / 1000);
  }

  static isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }
}
