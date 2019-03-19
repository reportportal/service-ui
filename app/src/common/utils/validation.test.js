import { email, password, login, name } from './validation';

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
  });
});

describe('Login', () => {
  test('validation should be correct', () => {
    expect(login('login')).toBe(true);
    expect(login('login-test_123.foo')).toBe(true);
  });
  test('validation should not be correct', () => {
    expect(login('')).toBe(false);
    expect(login('login^test')).toBe(false);
    expect(login('логин')).toBe(false);
  });
});

describe('Name', () => {
  test('validation should be correct', () => {
    expect(name('abc')).toBe(true);
    expect(name('full name')).toBe(true);
    expect(name('полное имя')).toBe(true);
    expect(name('full name with.some_symbols-123')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(name('')).toBe(false);
    expect(name('a')).toBe(false);
    expect(name('ab')).toBe(false);
    expect(name('name#')).toBe(false);
    expect(name('Hello 世界')).toBe(false);
  });
});
