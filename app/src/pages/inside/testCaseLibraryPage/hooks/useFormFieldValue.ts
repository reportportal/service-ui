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

import { useSelector } from 'react-redux';
import { formValueSelector, FormStateMap } from 'redux-form';

interface UseFormFieldValueOptions<T> {
  formName: string;
  fieldName: keyof T;
}

export const useFormFieldValue = <T extends object>({
  formName,
  fieldName,
}: UseFormFieldValueOptions<T>) => {
  const selector = formValueSelector(formName);

  return useSelector((state: FormStateMap) => selector(state, fieldName as string) as T[keyof T]);
};

export const useBooleanFormFieldValue = <T extends object>({
  formName,
  fieldName,
}: UseFormFieldValueOptions<T>) => {
  const value = useFormFieldValue<T>({ formName, fieldName });

  return Boolean(value);
};
