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

import { FormEvent, MouseEvent, useMemo, useCallback, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { CreateTestCaseFormData } from '../types';

interface ModalButton {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

interface UseModalActionsParams {
  submitButtonText: string;
  isLoading: boolean;
  pristine?: boolean;
  handleSubmit: (
    handler: (formData: CreateTestCaseFormData) => void | Promise<void>,
  ) => (event: FormEvent) => void;
  onSubmitHandler: (formData: CreateTestCaseFormData) => void | Promise<void>;
}

interface UseModalActionsReturn {
  okButton: ModalButton;
  cancelButton: ModalButton;
  handleClose: () => void;
  handleFormSubmit: (event: FormEvent) => void;
}

export const useModalActions = ({
  submitButtonText,
  isLoading,
  pristine,
  handleSubmit,
  onSubmitHandler,
}: UseModalActionsParams): UseModalActionsReturn => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const okButton: ModalButton = useMemo(
    () => ({
      children: <LoadingSubmitButton isLoading={isLoading}>{submitButtonText}</LoadingSubmitButton>,
      onClick: handleSubmit(onSubmitHandler) as (event: MouseEvent<HTMLButtonElement>) => void,
      disabled: Boolean(isLoading || pristine),
    }),
    [isLoading, pristine, submitButtonText, handleSubmit, onSubmitHandler],
  );

  const cancelButton: ModalButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isLoading,
    }),
    [formatMessage, isLoading],
  );

  const handleClose = useCallback(() => {
    dispatch(hideModalAction());
  }, [dispatch]);

  const handleFormSubmit = useMemo(
    () => handleSubmit(onSubmitHandler) as (event: FormEvent) => void,
    [handleSubmit, onSubmitHandler],
  );

  return {
    okButton,
    cancelButton,
    handleClose,
    handleFormSubmit,
  };
};
