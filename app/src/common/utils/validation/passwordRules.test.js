/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  areAllPasswordRulesMet,
  getPasswordRuleStatus,
} from './passwordRules';

describe('passwordRules.getPasswordRuleStatus', () => {
  test('returns all rules unmet for empty password', () => {
    expect(getPasswordRuleStatus('', 8)).toEqual({
      minLength: false,
      specialSymbol: false,
      uppercase: false,
      lowercase: false,
    });
  });

  test('returns met rules for a valid password', () => {
    expect(getPasswordRuleStatus('QwertY_1', 8)).toEqual({
      minLength: true,
      specialSymbol: true,
      uppercase: true,
      lowercase: true,
    });
  });

  test('uses configured minimum length', () => {
    expect(getPasswordRuleStatus('QwertY_1', 12).minLength).toBe(false);
    expect(getPasswordRuleStatus('QwertY_12345', 12).minLength).toBe(true);
  });
});

describe('passwordRules.areAllPasswordRulesMet', () => {
  test('returns true only when every rule is met', () => {
    expect(
      areAllPasswordRulesMet({
        minLength: true,
        specialSymbol: true,
        uppercase: true,
        lowercase: true,
      }),
    ).toBe(true);

    expect(
      areAllPasswordRulesMet({
        minLength: true,
        specialSymbol: false,
        uppercase: true,
        lowercase: true,
      }),
    ).toBe(false);
  });
});
