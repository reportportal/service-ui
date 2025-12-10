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

import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps, formValueSelector } from 'redux-form';

import { commonValidators } from 'common/utils/validation';
import { createFoldersAction } from 'controllers/testCase/actionCreators';
import { isCreatingFolderSelector } from 'controllers/testCase/selectors';

import { commonMessages } from '../../../commonMessages';
import { sharedFolderMessages } from '../messages';
import { CREATE_FORM_NAME, PARENT_FOLDER_FIELD } from '../constants';
import { FolderFormValues } from '../types';
import { FolderModal } from '../folderModal';
import { coerceToNumericId } from '../../../utils';

const selector = formValueSelector(CREATE_FORM_NAME);

export const CREATE_FOLDER_MODAL_KEY = 'createFolderModalKey';

const CreateFolderModal = reduxForm<FolderFormValues>({
  form: CREATE_FORM_NAME,
  initialValues: {
    folderName: '',
    parentFolder: null,
    isToggled: false,
  },
  shouldValidate: () => true,
  validate: ({ folderName, parentFolder, isToggled }) => {
    return {
      folderName: commonValidators.requiredField(folderName),
      parentFolder: isToggled ? commonValidators.requiredField(parentFolder) : undefined,
    };
  },
})(({ dirty, handleSubmit, change }: InjectedFormProps<FolderFormValues>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const isCreatingFolder = useSelector(isCreatingFolderSelector);
  const isSubfolderToggled = Boolean(
    useSelector((state) => selector(state, 'isToggled') as boolean | undefined),
  );

  const onSubmit = (values: FolderFormValues) => {
    const parentFolderId = coerceToNumericId(values?.parentFolder?.id);

    dispatch(
      createFoldersAction({
        folderName: values.folderName,
        ...(parentFolderId ? { parentFolderId } : {}),
      }),
    );
  };

  return (
    <FolderModal
      formName={CREATE_FORM_NAME}
      title={formatMessage(commonMessages.createFolder)}
      dirty={dirty}
      isLoading={isCreatingFolder}
      isToggled={isSubfolderToggled}
      toggleLabel={formatMessage(sharedFolderMessages.createAsSubfolder)}
      toggleFieldName="isToggled"
      parentFolderFieldName={PARENT_FOLDER_FIELD}
      parentFolderFieldLabel={formatMessage(sharedFolderMessages.parentFolder)}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      change={change}
    />
  );
});

export default CreateFolderModal;
