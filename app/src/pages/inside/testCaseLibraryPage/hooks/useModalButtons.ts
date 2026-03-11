/*
 * Copyright 2025 EPAM Systems
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

import { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { VoidFn } from '@reportportal/ui-kit/common';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'text' | 'ghost-danger' | 'text-danger';

interface UseModalButtonsProps {
  okButtonText: ReactNode;
  isLoading: boolean;
  isSubmitButtonDisabled?: boolean;
  variant?: ButtonVariant;
  onSubmit: VoidFn;
}

export const useModalButtons = ({
  okButtonText,
  isLoading,
  isSubmitButtonDisabled = false,
  variant,
  onSubmit,
}: UseModalButtonsProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const okButton = useMemo(
    () => ({
      children: okButtonText,
      disabled: isLoading || isSubmitButtonDisabled,
      ...(variant && { variant }),
      onClick: onSubmit,
    }),
    [okButtonText, isLoading, isSubmitButtonDisabled, variant, onSubmit],
  );

  const cancelButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isLoading,
    }),
    [formatMessage, isLoading],
  );

  const hideModal = () => dispatch(hideModalAction());

  return { okButton, cancelButton, hideModal };
};
