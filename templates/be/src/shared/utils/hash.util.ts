import * as crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

export class HashUtil {
  private static readonly SALT_LENGTH = 16;
  private static readonly KEY_LENGTH = 64;

  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(HashUtil.SALT_LENGTH).toString('hex');
    const derivedKey = (await scryptAsync(
      password,
      salt,
      HashUtil.KEY_LENGTH,
    )) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  static async verifyPassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) {
      return false;
    }

    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== HashUtil.KEY_LENGTH) {
      return false;
    }

    const derivedKey = (await scryptAsync(
      password,
      salt,
      HashUtil.KEY_LENGTH,
    )) as Buffer;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }
}
