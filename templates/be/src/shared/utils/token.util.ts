import * as crypto from 'crypto';
import { DOMAIN_CONSTANTS } from '@repo/contracts';
import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export class TokenUtil {
  static sign(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
    secret: string,
    expiresInSeconds: number = DOMAIN_CONSTANTS.AUTH.ACCESS_TOKEN_EXPIRY_SECONDS,
  ): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');

    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString(
      'base64url',
    );

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${encodedPayload}`)
      .digest('base64url');

    return `${header}.${encodedPayload}.${signature}`;
  }

  static verify(token: string, secret: string): JwtPayload | null {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    const sigBuffer = Buffer.from(signatureB64);
    const expectedSigBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedSigBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
    ) {
      return null;
    }

    try {
      const decodedPayload = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString('utf-8'),
      ) as JwtPayload;

      const now = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp && decodedPayload.exp < now) {
        return null;
      }

      return decodedPayload;
    } catch {
      return null;
    }
  }
}
