export class SanitizeUtil {
  static cleanText(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/\0/g, '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/[<>'"&]/g, (char) => {
        switch (char) {
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
          case '"':
            return '&quot;';
          case "'":
            return '&#x27;';
          case '&':
            return '&amp;';
          default:
            return char;
        }
      })
      .trim();
  }
}
