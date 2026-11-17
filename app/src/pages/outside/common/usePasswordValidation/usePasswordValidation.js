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

const isFocusMovingToSubmit = (event) => {
  const relatedTarget = event?.relatedTarget;

  if (!(relatedTarget instanceof HTMLElement)) {
    return false;
  }

  return relatedTarget.closest('button[type="submit"], input[type="submit"]') !== null;
};

/**
 * Shared hook for password + confirm-password validation used by the
 * Registration and Change-Password forms.
 *
 * Errors are revealed after blur or submit. While a field is focused, its error
 * is hidden (same pattern as other forms in the app) — not cleared on typing.
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
 *
 * Returns `isPasswordSubmitReady` for the submit button:
 * - while **New Password** is focused and non-empty: enabled unless confirm / another
 *   field already shows an error;
 * - otherwise: requires non-empty password, all rules met (no spaces), and matching confirm.
 *
 * @param {boolean} [params.hasBlockingExternalError] - when true (e.g. visible Full Name
 *   error on registration), typing in password must not re-enable submit
 */
export const usePasswordValidation = ({
  password,
  confirmPassword,
  minLength,
  formatMessage,
  messages,
  hasBlockingExternalError = false,
}) => {
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showConfirmPasswordValidation, setShowConfirmPasswordValidation] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const ruleStatus = useMemo(
    () => getPasswordRuleStatus(password, minLength),
    [password, minLength],
  );
  const allRulesMet = areAllPasswordRulesMet(ruleStatus);
  const hasSpace = password.length > 0 && /\s/.test(password);
  const passwordFullyValid = allRulesMet && !hasSpace;

  const hasMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const shouldShowPasswordValidation = showPasswordValidation && !isPasswordFocused;
  const shouldShowConfirmPasswordValidation =
    showConfirmPasswordValidation && !isConfirmPasswordFocused;

  const confirmPasswordError = useMemo(() => {
    if (!shouldShowConfirmPasswordValidation) return undefined;
    if (!confirmPassword.trim()) return formatMessage(messages.requiredField);
    if (hasMismatch) return formatMessage(messages.passwordsDoNotMatch);
    return undefined;
  }, [shouldShowConfirmPasswordValidation, confirmPassword, hasMismatch, formatMessage, messages]);

  const isPasswordSubmitReady = useMemo(() => {
    const hasOtherFieldError = !!confirmPasswordError || hasBlockingExternalError;

    // While editing password (focused), keep Save enabled — but not if confirm /
    // another field already shows a validation error.
    if (isPasswordFocused && password.length > 0 && !hasOtherFieldError) {
      return true;
    }

    return (
      password.length > 0 &&
      passwordFullyValid &&
      password === confirmPassword
    );
  }, [
    isPasswordFocused,
    password,
    confirmPassword,
    passwordFullyValid,
    confirmPasswordError,
    hasBlockingExternalError,
  ]);

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
  const showPasswordFailState =
    shouldShowPasswordValidation && !allRulesMet && password.length > 0;

  const passwordError = useMemo(() => {
    if (!shouldShowPasswordValidation) return undefined;
    if (!password) return formatMessage(messages.requiredField);
    if (allRulesMet && hasSpace) return formatMessage(messages.passwordPolicySummary, { minLength });
    if (!allRulesMet) return formatMessage(messages.passwordRequirementsError);
    return undefined;
  }, [
    shouldShowPasswordValidation,
    password,
    allRulesMet,
    hasSpace,
    minLength,
    formatMessage,
    messages,
  ]);

  const handlePasswordFocus = useCallback(() => {
    setIsPasswordFocused(true);
  }, []);

  // Always reveal validation on blur — including empty fields — so "Field is required" appears
  // immediately when the user tabs away without typing, not only after submit.
  // Skip when focus moves to the submit button: blur fires before click and would disable the
  // button early, swallowing the click; the submit handler reveals validation instead.
  const handlePasswordBlur = useCallback((event) => {
    if (isFocusMovingToSubmit(event)) {
      return;
    }

    setIsPasswordFocused(false);
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
    isPasswordSubmitReady,
    ruleLabels,
    showPasswordValidation,
    setShowPasswordValidation,
    showConfirmPasswordValidation,
    setShowConfirmPasswordValidation,
    isConfirmPasswordFocused,
    setIsConfirmPasswordFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    showPasswordFailState,
    passwordError,
    hasMismatch,
    shouldShowConfirmPasswordValidation,
    confirmPasswordError,
    handlePasswordFocus,
    handlePasswordBlur,
    handleConfirmPasswordFocus,
    handleConfirmPasswordBlur,
  };
};
