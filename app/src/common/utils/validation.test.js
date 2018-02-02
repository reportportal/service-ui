import { email } from './validation';

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

