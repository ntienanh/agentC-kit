import { DateUtil } from './date.util';

describe('DateUtil', () => {
  describe('nowIso', () => {
    it('should return a valid ISO 8601 UTC string', () => {
      const iso = DateUtil.nowIso();
      expect(typeof iso).toBe('string');
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('now', () => {
    it('should return a Date object close to current time', () => {
      const date = DateUtil.now();
      expect(date).toBeInstanceOf(Date);
      expect(Math.abs(date.getTime() - Date.now())).toBeLessThan(100);
    });
  });

  describe('addHours', () => {
    it('should add hours correctly', () => {
      const base = new Date('2024-01-01T00:00:00.000Z');
      const result = DateUtil.addHours(base, 3);
      expect(result.toISOString()).toBe('2024-01-01T03:00:00.000Z');
    });
  });

  describe('addMinutes', () => {
    it('should add minutes correctly', () => {
      const base = new Date('2024-01-01T00:00:00.000Z');
      const result = DateUtil.addMinutes(base, 30);
      expect(result.toISOString()).toBe('2024-01-01T00:30:00.000Z');
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      const base = new Date('2024-01-01T00:00:00.000Z');
      const result = DateUtil.addDays(base, 7);
      expect(result.toISOString()).toBe('2024-01-08T00:00:00.000Z');
    });
  });

  describe('isExpired', () => {
    it('should return true for a past date', () => {
      const past = new Date(Date.now() - 10000);
      expect(DateUtil.isExpired(past)).toBe(true);
    });

    it('should return false for a future date', () => {
      const future = new Date(Date.now() + 10000);
      expect(DateUtil.isExpired(future)).toBe(false);
    });
  });

  describe('diffSeconds', () => {
    it('should calculate difference in seconds', () => {
      const a = new Date('2024-01-01T01:00:00.000Z');
      const b = new Date('2024-01-01T00:00:00.000Z');
      expect(DateUtil.diffSeconds(a, b)).toBe(3600);
    });
  });

  describe('isValidDate', () => {
    it('should return true for a valid Date', () => {
      expect(DateUtil.isValidDate(new Date())).toBe(true);
    });

    it('should return false for an invalid Date', () => {
      expect(DateUtil.isValidDate(new Date('invalid'))).toBe(false);
    });

    it('should return false for non-Date values', () => {
      expect(DateUtil.isValidDate('2024-01-01')).toBe(false);
      expect(DateUtil.isValidDate(null)).toBe(false);
    });
  });
});
