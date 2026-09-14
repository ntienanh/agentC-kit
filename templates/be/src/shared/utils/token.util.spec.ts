import { TokenUtil } from './token.util';
import { UserRole } from '../enums';

describe('TokenUtil (Native Crypto JWT Test)', () => {
  const secret = 'super-secure-secret-key-123456';
  const samplePayload = {
    sub: 'user-uuid-1234',
    email: 'admin@example.com',
    role: UserRole.SUPER_ADMIN,
  };

  it('signs and verifies token successfully', () => {
    const token = TokenUtil.sign(samplePayload, secret, 3600);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const verified = TokenUtil.verify(token, secret);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe(samplePayload.sub);
    expect(verified?.email).toBe(samplePayload.email);
    expect(verified?.role).toBe(samplePayload.role);
    expect(verified?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects token signed with different secret', () => {
    const token = TokenUtil.sign(samplePayload, secret, 3600);
    const verified = TokenUtil.verify(token, 'wrong-secret');
    expect(verified).toBeNull();
  });

  it('rejects tampered token', () => {
    const token = TokenUtil.sign(samplePayload, secret, 3600);
    const [h, p] = token.split('.');
    const tampered = `${h}.${p}.invalidsignature`;
    expect(TokenUtil.verify(tampered, secret)).toBeNull();
  });

  it('rejects expired token', () => {
    const expiredToken = TokenUtil.sign(samplePayload, secret, -10);
    expect(TokenUtil.verify(expiredToken, secret)).toBeNull();
  });

  it('rejects malformed token strings', () => {
    expect(TokenUtil.verify('', secret)).toBeNull();
    expect(TokenUtil.verify('invalid.token', secret)).toBeNull();
    expect(TokenUtil.verify('a.b.c.d', secret)).toBeNull();
  });
});
