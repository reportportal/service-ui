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

import { useDispatch } from 'react-redux';

import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';

import { useDebouncedSpinner } from './useDebouncedSpinner';
import { noop } from 'es-toolkit';

interface UseDebouncedSpinnerFormSubmitOptions<TArgs extends unknown[], TResult> {
  requestFn: (...args: TArgs) => Promise<TResult>;
  successMessageId?: string;
  errorMessageId?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

export const useDebouncedSpinnerFormSubmit = <TArgs extends unknown[], TResult = void>({
  requestFn,
  successMessageId,
  errorMessageId,
  onSuccess = noop,
  onError = noop,
}: UseDebouncedSpinnerFormSubmitOptions<TArgs, TResult>): {
  isLoading: boolean;
  submit: (...args: TArgs) => Promise<TResult>;
} => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();

  const submit = async (...args: TArgs): Promise<TResult> => {
    try {
      showSpinner();

      const result = await requestFn(...args);

      dispatch(hideModalAction());

      if (successMessageId) {
        dispatch(
          showSuccessNotification({
            messageId: successMessageId,
          }),
        );
      }
      onSuccess(result);

      return result;
    } catch (error: unknown) {
      onError(error);

      if (errorMessageId) {
        dispatch(
          showErrorNotification({
            messageId: errorMessageId,
          }),
        );
      }

      throw error;
    } finally {
      hideSpinner();
    }
  };

  return {
    isLoading,
    submit,
  };
};
