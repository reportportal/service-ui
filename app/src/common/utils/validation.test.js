import { email, password } from './validation';

describe('Email', () => {
  test(' validation should be correct', () => {
    expect(email('email@example.com')).toBe(true);
    expect(email('firstname.lastname@example.com')).toBe(true);
    expect(email('email@subdomain.example.com')).toBe(true);
    expect(email('firstname+lastname@example.com')).toBe(true);
    expect(email('email@123.123.123.123')).toBe(true);
    expect(email('1234567890@example.com')).toBe(true);
    expect(email('email@example-one.com')).toBe(true);
    expect(email('_______@example.com')).toBe(true);
    expect(email('firstname-lastname@example.com')).toBe(true);
    expect(email('email@example.co.jp')).toBe(true);
    expect(email('.email@example.com')).toBe(true);
  });

  test(' validation should be not correct', () => {
    expect(email('plainaddress')).toBe(false);
    expect(email('#@%^%#$@#$@#.com')).toBe(false);
    expect(email('@example.com')).toBe(false);
    expect(email('Joe Smith <email@example.com>')).toBe(false);
    expect(email('email.example.com')).toBe(false);
    expect(email('email@example@example.com')).toBe(false);
    expect(email('email@example.com (Joe Smith)')).toBe(false);
    expect(email('email@example')).toBe(false);
    expect(email('あいうえお@example.com')).toBe(false);
  });
});

describe('Password', () => {
  test('validation should be correct', () => {
    expect(password('1234')).toBe(true);
    expect(password('1234567890123456789012345')).toBe(true);
    expect(password('Aa1@3@.?n&()*^HFU')).toBe(true);
    expect(password('firstname+lastname@ex')).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(password('1')).toBe(false);
    expect(password('12')).toBe(false);
    expect(password('123')).toBe(false);
    expect(password('12345678901234567890123456')).toBe(false);
  });
});

