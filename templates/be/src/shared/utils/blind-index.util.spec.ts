import { BlindIndexUtil } from './blind-index.util';

const SECRET = 'test-secret-key-32bytes-long!!';

describe('BlindIndexUtil', () => {
  describe('generate', () => {
    it('should return a 64-char hex string', () => {
      const idx = BlindIndexUtil.generate('test@example.com', SECRET);
      expect(idx).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should be deterministic — same input always yields same hash', () => {
      const a = BlindIndexUtil.generate('user@example.com', SECRET);
      const b = BlindIndexUtil.generate('user@example.com', SECRET);
      expect(a).toBe(b);
    });

    it('should be case-insensitive for email normalization', () => {
      const lower = BlindIndexUtil.generate('user@example.com', SECRET);
      const upper = BlindIndexUtil.generate('USER@EXAMPLE.COM', SECRET);
      expect(lower).toBe(upper);
    });

    it('should produce different hashes for different values', () => {
      const a = BlindIndexUtil.generate('user1@example.com', SECRET);
      const b = BlindIndexUtil.generate('user2@example.com', SECRET);
      expect(a).not.toBe(b);
    });

    it('should produce different hashes for different secrets', () => {
      const a = BlindIndexUtil.generate('user@example.com', 'secret-1');
      const b = BlindIndexUtil.generate('user@example.com', 'secret-2');
      expect(a).not.toBe(b);
    });

    it('should throw when value is empty', () => {
      expect(() => BlindIndexUtil.generate('', SECRET)).toThrow();
    });

    it('should throw when secret is empty', () => {
      expect(() => BlindIndexUtil.generate('user@example.com', '')).toThrow();
    });
  });

  describe('verify', () => {
    it('should return true when value matches stored index', () => {
      const idx = BlindIndexUtil.generate('user@example.com', SECRET);
      expect(BlindIndexUtil.verify('user@example.com', idx, SECRET)).toBe(true);
    });

    it('should return false when value does not match', () => {
      const idx = BlindIndexUtil.generate('user@example.com', SECRET);
      expect(BlindIndexUtil.verify('other@example.com', idx, SECRET)).toBe(
        false,
      );
    });
  });
});
