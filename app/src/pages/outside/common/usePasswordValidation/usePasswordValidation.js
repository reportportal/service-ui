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
 *
 * Returns `isPasswordSubmitReady` for the submit button:
 * - while typing in **New Password** before password validation is revealed: enabled
 *   (non-empty value), unless another field already shows an error (confirm, or
 *   optional `hasBlockingExternalError` e.g. full name);
 * - when password validation errors are visible (after blur/submit): disabled until
 *   password is fully valid and confirm matches — including when the field is
 *   re-focused with errors still showing;
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

    // While typing in password (errors not yet revealed for this field), keep Save
    // enabled — but not if confirm / another field already shows a validation error.
    if (
      isPasswordFocused &&
      password.length > 0 &&
      !showPasswordValidation &&
      !hasOtherFieldError
    ) {
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
    showPasswordValidation,
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
  const showPasswordFailState = showPasswordValidation && !allRulesMet && password.length > 0;

  const passwordError = useMemo(() => {
    if (!showPasswordValidation) return undefined;
    if (!password) return formatMessage(messages.requiredField);
    if (allRulesMet && hasSpace) return formatMessage(messages.passwordPolicySummary, { minLength });
    if (!allRulesMet) return formatMessage(messages.passwordRequirementsError);
    return undefined;
  }, [showPasswordValidation, password, allRulesMet, hasSpace, minLength, formatMessage, messages]);

  const handlePasswordChange = useCallback(() => {
    setShowPasswordValidation(false);
  }, []);

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
    handlePasswordChange,
    handlePasswordFocus,
    handlePasswordBlur,
    handleConfirmPasswordFocus,
    handleConfirmPasswordBlur,
  };
};
