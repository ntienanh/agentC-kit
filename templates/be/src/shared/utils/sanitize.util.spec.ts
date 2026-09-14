import { SanitizeUtil } from './sanitize.util';

describe('SanitizeUtil', () => {
  describe('cleanText()', () => {
    it('should strip script tags and HTML elements completely', () => {
      const dirtyHtml = '<script>alert("XSS")</script>Hello <b>World</b>';
      const cleaned = SanitizeUtil.cleanText(dirtyHtml);

      expect(cleaned).toBe('alert(&quot;XSS&quot;)Hello World');
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('<b>');
      expect(cleaned).not.toContain('</b>');
    });

    it('should escape HTML entities like quotes and ampersands in remaining text', () => {
      const input = 'Tom & Jerry "Special" \'Edition\'';
      const cleaned = SanitizeUtil.cleanText(input);

      expect(cleaned).toBe(
        'Tom &amp; Jerry &quot;Special&quot; &#x27;Edition&#x27;',
      );
    });

    it('should escape greater-than symbols and loose characters safely', () => {
      const input = 'Value is > 100 & valid';
      const cleaned = SanitizeUtil.cleanText(input);

      expect(cleaned).toBe('Value is &gt; 100 &amp; valid');
    });

    it('should remove null bytes (Null-Byte Injection prevention)', () => {
      const inputWithNullBytes = 'Admin\0User\0\0Payload';
      const cleaned = SanitizeUtil.cleanText(inputWithNullBytes);

      expect(cleaned).toBe('AdminUserPayload');
      expect(cleaned).not.toContain('\0');
    });

    it('should trim surrounding whitespace', () => {
      const paddedInput = '   Valid User Name   ';
      const cleaned = SanitizeUtil.cleanText(paddedInput);

      expect(cleaned).toBe('Valid User Name');
    });

    it('should return empty string for non-string inputs (null, undefined, numbers, objects)', () => {
      expect(SanitizeUtil.cleanText(null as unknown as string)).toBe('');
      expect(SanitizeUtil.cleanText(undefined as unknown as string)).toBe('');
      expect(SanitizeUtil.cleanText(12345 as unknown as string)).toBe('');
      expect(SanitizeUtil.cleanText({} as unknown as string)).toBe('');
      expect(SanitizeUtil.cleanText([] as unknown as string)).toBe('');
    });

    it('should handle complex nested malicious payloads safely', () => {
      const attackPayload =
        '<img src=x onerror=alert(1)>John <iframe src="evil.com"></iframe>Doe';
      const cleaned = SanitizeUtil.cleanText(attackPayload);

      expect(cleaned).toBe('John Doe');
      expect(cleaned).not.toContain('<img');
      expect(cleaned).not.toContain('<iframe');
    });

    it('should preserve unicode, Vietnamese accents, and emojis safely', () => {
      const unicodeInput = 'Nguyễn Văn Ánh 🚀 🎉 & Associates';
      const cleaned = SanitizeUtil.cleanText(unicodeInput);

      expect(cleaned).toBe('Nguyễn Văn Ánh 🚀 🎉 &amp; Associates');
    });
  });
});
