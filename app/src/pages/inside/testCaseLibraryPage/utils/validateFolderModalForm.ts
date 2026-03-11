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

import { commonValidators } from 'common/utils/validation';
import { ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';

import { FolderModalFormValues } from './folderModalFormConfig';

interface FolderModalValidationOptions {
  validateMoveToRoot?: boolean;
}

export const validateFolderModalForm = (
  values: Partial<FolderModalFormValues>,
  options: FolderModalValidationOptions = {},
): Partial<Record<keyof FolderModalFormValues, string>> => {
  const errors: Partial<Record<keyof FolderModalFormValues, string>> = {};
  const { validateMoveToRoot = false } = options;

  const addError = <K extends keyof FolderModalFormValues>(field: K, value: unknown) => {
    const error = commonValidators.requiredField(value);

    if (error) {
      errors[field] = error;
    }
  };

  const isNewMode = values.mode === ButtonSwitcherOption.NEW;

  if (isNewMode) {
    addError('folderName', values.folderName);

    if (!values.isRootFolder) {
      addError('parentFolder', values.parentFolder);
    }
  } else if (!validateMoveToRoot || !values.moveToRoot) {
    addError('destinationFolder', values.destinationFolder);
  }

  return errors;
};
