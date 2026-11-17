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

// Punctuation (\p{P}) and symbols (\p{S}) only — letters from any language are excluded.
const PASSWORD_SPECIAL_SYMBOL_PATTERN = /[\p{P}\p{S}]/u;

export const PASSWORD_RULE_IDS = ['minLength', 'digit', 'specialSymbol', 'uppercase', 'lowercase'];

export const getPasswordRuleStatus = (password = '', minLength = 8) => ({
  minLength: password.length >= minLength,
  digit: /\d/.test(password),
  specialSymbol: PASSWORD_SPECIAL_SYMBOL_PATTERN.test(password),
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
});

export const areAllPasswordRulesMet = (ruleStatus) =>
  PASSWORD_RULE_IDS.every((ruleId) => ruleStatus[ruleId]);
