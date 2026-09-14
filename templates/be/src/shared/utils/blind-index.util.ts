import { createHmac } from 'crypto';

export class BlindIndexUtil {
  static generate(value: string, secret: string): string {
    if (!value || !secret) {
      throw new Error('BlindIndexUtil: value and secret are required');
    }
    return createHmac('sha256', secret)
      .update(value.toLowerCase().trim())
      .digest('hex');
  }

  static verify(value: string, storedIndex: string, secret: string): boolean {
    const computed = BlindIndexUtil.generate(value, secret);
    return computed === storedIndex;
  }
}
