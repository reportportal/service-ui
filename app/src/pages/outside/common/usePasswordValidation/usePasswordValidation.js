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

import { useCallback, useMemo, useState } from 'react';
import {
  areAllPasswordRulesMet,
  getPasswordRuleStatus,
} from 'common/utils/validation/passwordRules';

/**
 * Shared hook for password + confirm-password validation used by the
 * Registration and Change-Password forms.
 *
 * Errors are revealed only after the field is blurred or the form is submitted
 * (not while the user is actively typing). Blurring an empty field immediately
 * shows "Field is required".
 *
 * @param {object} params
 * @param {string}   params.password           - current password field value
 * @param {string}   params.confirmPassword    - current confirm-password field value
 * @param {number}   params.minLength          - minimum password length from app config
 * @param {Function} params.formatMessage      - react-intl formatMessage
 * @param {object}   params.messages           - message descriptors (ruleMinLength, ruleDigit,
 *                                               ruleSpecialSymbol, ruleUppercase, ruleLowercase,
 *                                               passwordPolicySummary, passwordRequirementsError,
 *                                               passwordsDoNotMatch, requiredField)
 */
export const usePasswordValidation = ({
  password,
  confirmPassword,
  minLength,
  formatMessage,
  messages,
}) => {
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showConfirmPasswordValidation, setShowConfirmPasswordValidation] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const ruleStatus = useMemo(
    () => getPasswordRuleStatus(password, minLength),
    [password, minLength],
  );
  const allRulesMet = areAllPasswordRulesMet(ruleStatus);
  const hasSpace = password.length > 0 && /\s/.test(password);
  const passwordFullyValid = allRulesMet && !hasSpace;

  const ruleLabels = useMemo(
    () => ({
      minLength: formatMessage(messages.ruleMinLength, { minLength }),
      digit: formatMessage(messages.ruleDigit),
      specialSymbol: formatMessage(messages.ruleSpecialSymbol),
      uppercase: formatMessage(messages.ruleUppercase),
      lowercase: formatMessage(messages.ruleLowercase),
    }),
    [formatMessage, minLength, messages],
  );

  // Fail styling on checklist rows only when rules are unmet (not when space is the sole issue)
  const showPasswordFailState = showPasswordValidation && !allRulesMet && password.length > 0;

  const passwordError = useMemo(() => {
    if (!showPasswordValidation) return undefined;
    if (!password) return formatMessage(messages.requiredField);
    if (allRulesMet && hasSpace) return formatMessage(messages.passwordPolicySummary, { minLength });
    if (!allRulesMet) return formatMessage(messages.passwordRequirementsError);
    return undefined;
  }, [showPasswordValidation, password, allRulesMet, hasSpace, minLength, formatMessage, messages]);

  const hasMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const shouldShowConfirmPasswordValidation = showConfirmPasswordValidation && !isConfirmPasswordFocused;

  const confirmPasswordError = useMemo(() => {
    if (!shouldShowConfirmPasswordValidation) return undefined;
    if (!confirmPassword.trim()) return formatMessage(messages.requiredField);
    if (hasMismatch) return formatMessage(messages.passwordsDoNotMatch);
    return undefined;
  }, [shouldShowConfirmPasswordValidation, confirmPassword, hasMismatch, formatMessage, messages]);

  const handlePasswordChange = useCallback(() => {
    setShowPasswordValidation(false);
  }, []);

  // Always reveal validation on blur — including empty fields — so "Field is required" appears
  // immediately when the user tabs away without typing, not only after submit.
  const handlePasswordBlur = useCallback(() => {
    setShowPasswordValidation(true);
  }, []);

  const handleConfirmPasswordFocus = useCallback(() => {
    setIsConfirmPasswordFocused(true);
  }, []);

  const handleConfirmPasswordBlur = useCallback(() => {
    setIsConfirmPasswordFocused(false);
    setShowConfirmPasswordValidation(true);
  }, []);

  return {
    ruleStatus,
    allRulesMet,
    passwordFullyValid,
    ruleLabels,
    showPasswordValidation,
    setShowPasswordValidation,
    showConfirmPasswordValidation,
    setShowConfirmPasswordValidation,
    isConfirmPasswordFocused,
    setIsConfirmPasswordFocused,
    showPasswordFailState,
    passwordError,
    hasMismatch,
    shouldShowConfirmPasswordValidation,
    confirmPasswordError,
    handlePasswordChange,
    handlePasswordBlur,
    handleConfirmPasswordFocus,
    handleConfirmPasswordBlur,
  };
};
