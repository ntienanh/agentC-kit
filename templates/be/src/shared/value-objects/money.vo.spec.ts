import { MoneyVO } from './money.vo';

describe('MoneyVO', () => {
  describe('fromFloat', () => {
    it('should convert float to integer cents correctly', () => {
      expect(MoneyVO.fromFloat(99.99).cents).toBe(9999);
      expect(MoneyVO.fromFloat(1.0).cents).toBe(100);
      expect(MoneyVO.fromFloat(0.1).cents).toBe(10);
    });

    it('should eliminate floating-point error (0.1 + 0.2)', () => {
      const a = MoneyVO.fromFloat(0.1);
      const b = MoneyVO.fromFloat(0.2);
      const sum = a.add(b);
      expect(sum.toFloat()).toBe(0.3);
      expect(sum.cents).toBe(30);
    });
  });

  describe('fromCents', () => {
    it('should create MoneyVO from integer cents', () => {
      expect(MoneyVO.fromCents(500).toFloat()).toBe(5.0);
    });
  });

  describe('zero', () => {
    it('should create zero amount', () => {
      const z = MoneyVO.zero();
      expect(z.isZero()).toBe(true);
      expect(z.cents).toBe(0);
    });
  });

  describe('add', () => {
    it('should add two amounts correctly', () => {
      const a = MoneyVO.fromFloat(99.99);
      const b = MoneyVO.fromFloat(10.0);
      expect(a.add(b).toFloat()).toBe(109.99);
    });
  });

  describe('subtract', () => {
    it('should subtract correctly', () => {
      const a = MoneyVO.fromFloat(100.0);
      const b = MoneyVO.fromFloat(30.5);
      expect(a.subtract(b).toFloat()).toBe(69.5);
    });

    it('should allow negative result', () => {
      const a = MoneyVO.fromFloat(10.0);
      const b = MoneyVO.fromFloat(20.0);
      expect(a.subtract(b).isNegative()).toBe(true);
    });
  });

  describe('multiply', () => {
    it('should multiply by scalar quantity', () => {
      const price = MoneyVO.fromFloat(9.99);
      expect(price.multiply(3).toFloat()).toBe(29.97);
    });
  });

  describe('equals', () => {
    it('should return true for equal amounts', () => {
      expect(MoneyVO.fromCents(500).equals(MoneyVO.fromCents(500))).toBe(true);
    });

    it('should return false for different amounts', () => {
      expect(MoneyVO.fromCents(500).equals(MoneyVO.fromCents(501))).toBe(false);
    });
  });

  describe('isGreaterThan', () => {
    it('should compare amounts correctly', () => {
      expect(MoneyVO.fromCents(600).isGreaterThan(MoneyVO.fromCents(500))).toBe(
        true,
      );
      expect(MoneyVO.fromCents(400).isGreaterThan(MoneyVO.fromCents(500))).toBe(
        false,
      );
    });
  });

  describe('format', () => {
    it('should format as USD currency string', () => {
      const result = MoneyVO.fromFloat(109.99).format('USD', 'en-US');
      expect(result).toBe('$109.99');
    });
  });
});
