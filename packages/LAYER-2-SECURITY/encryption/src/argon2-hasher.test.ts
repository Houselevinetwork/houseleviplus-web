import { describe, test, expect } from '@jest/globals';
import { Argon2Hasher } from './argon2-hasher';

describe('Argon2 Hasher', () => {
  test('should hash password', async () => {
    const hasher = new Argon2Hasher();
    const password = 'MyPassword123!';
    const hash = await hasher.hash(password);

    expect(hash).toBeDefined();
    expect(hash).toContain(':');
  });

  test('should verify correct password', async () => {
    const hasher = new Argon2Hasher();
    const password = 'MyPassword123!';
    const hash = await hasher.hash(password);

    const isValid = await hasher.verify(password, hash);
    expect(isValid).toBe(true);
  });

  test('should reject incorrect password', async () => {
    const hasher = new Argon2Hasher();
    const hash = await hasher.hash('Password123!');

    const isValid = await hasher.verify('WrongPassword', hash);
    expect(isValid).toBe(false);
  });
});
