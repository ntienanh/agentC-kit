import { HashUtil } from './hash.util';

describe('HashUtil (Security Scrypt Unit Test)', () => {
  it('nên băm mật khẩu với salt và xác minh mật khẩu khớp 100%', async () => {
    const password = 'MySecurePassword123!';
    const hashed = await HashUtil.hashPassword(password);

    expect(hashed).toContain(':');
    expect(await HashUtil.verifyPassword(password, hashed)).toBe(true);
    expect(await HashUtil.verifyPassword('WrongPassword', hashed)).toBe(false);
  });

  it('nên tạo ra 2 hash khác nhau cho cùng 1 password do random salt', async () => {
    const password = 'SamePassword123!';
    const hash1 = await HashUtil.hashPassword(password);
    const hash2 = await HashUtil.hashPassword(password);

    expect(hash1).not.toEqual(hash2);
    expect(await HashUtil.verifyPassword(password, hash1)).toBe(true);
    expect(await HashUtil.verifyPassword(password, hash2)).toBe(true);
  });

  it('nên trả về false khi storedHash không đúng định dạng salt:key', async () => {
    expect(
      await HashUtil.verifyPassword('password', 'invalid-hash-format'),
    ).toBe(false);
    expect(await HashUtil.verifyPassword('password', '')).toBe(false);
    expect(await HashUtil.verifyPassword('password', ':key')).toBe(false);
    expect(await HashUtil.verifyPassword('password', 'salt:')).toBe(false);
  });
});
