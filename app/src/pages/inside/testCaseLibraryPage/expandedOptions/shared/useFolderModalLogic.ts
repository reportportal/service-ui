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

import { ChangeEvent, MouseEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { registerField, unregisterField } from 'redux-form';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { createFoldersAction } from 'controllers/testCase/actionCreators';
import { isCreatingFolderSelector } from 'controllers/testCase';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';

interface FormValues {
  folderName: string;
  [key: string]: string | boolean | number | null | undefined;
}

interface ReduxFormFunction {
  (fieldName: string, value: string | boolean): void;
}

interface HandleSubmitFunction {
  (onSubmit: (values: FormValues) => void): (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface UseFolderModalLogicParams {
  formName: string;
  parentFieldName: string;
  onSubmit?: (values: FormValues) => void;
}

export const useFolderModalLogic = ({
  formName,
  parentFieldName,
  onSubmit: customOnSubmit,
}: UseFolderModalLogicParams) => {
  const dispatch = useDispatch();
  const isCreatingFolder = useSelector(isCreatingFolderSelector);
  const { formatMessage } = useIntl();

  const [isToggled, setIsToggled] = useState(false);

  const hideModal = () => dispatch(hideModalAction());

  const defaultOnSubmit = (values: FormValues) => {
    const parentFieldValue = values[parentFieldName];
    const idFromNameInput = coerceToNumericId(parentFieldValue as string);
    dispatch(
      createFoldersAction({
        folderName: values.folderName,
        ...(idFromNameInput !== undefined ? { parentFolderId: idFromNameInput } : {}),
      }),
    );
  };

  const onSubmit = customOnSubmit || defaultOnSubmit;

  const handleToggle =
    (change: ReduxFormFunction, untouch: ReduxFormFunction) =>
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      if (target.checked) {
        dispatch(registerField(formName, parentFieldName, 'Field'));
        untouch(parentFieldName, true);
      } else {
        dispatch(unregisterField(formName, parentFieldName));
      }
      setIsToggled(target.checked);
      change('isToggled', target.checked);
    };

  const handleParentFieldClear = (change: ReduxFormFunction, initialValue?: string) => () => {
    change(parentFieldName, initialValue || '');
  };

  const createOkButton = (handleSubmit: HandleSubmitFunction) => ({
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: handleSubmit(onSubmit),
    disabled: isCreatingFolder,
    'data-automation-id': 'submitButton',
  });

  const createCancelButton = () => ({
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isCreatingFolder,
    'data-automation-id': 'cancelButton',
  });

  return {
    isCreatingFolder,
    isToggled,
    setIsToggled,
    hideModal,
    onSubmit,
    handleToggle,
    handleParentFieldClear,
    createOkButton,
    createCancelButton,
  };
};
