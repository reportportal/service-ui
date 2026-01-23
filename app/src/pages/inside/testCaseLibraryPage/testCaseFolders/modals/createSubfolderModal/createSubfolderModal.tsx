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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { UseModalData } from 'common/hooks';
import { createClassnames, commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { createFoldersAction } from 'controllers/testCase/actionCreators';
import {
  isCreatingFolderSelector,
  TransformedFolder,
  transformedFoldersWithFullPathSelector,
} from 'controllers/testCase';
import { findFolderById } from 'pages/inside/testCaseLibraryPage/utils';

import { commonMessages } from '../../../commonMessages';
import { commonFolderMessages } from '../commonFolderMessages';
import { CREATE_SUBFOLDER_FORM_NAME } from '../constants';
import { FolderFormValues } from '../types';
import { FolderNameField } from '../folderFormFields';
import { useModalButtons } from '../../../hooks/useModalButtons';

import styles from './createSubfolderModal.scss';

const cx = createClassnames(styles);

export const CREATE_SUBFOLDER_MODAL_KEY = 'createSubfolderModalKey';

export interface CreateSubfolderModalData {
  folder: TransformedFolder;
}

type CreateSubfolderModalProps = UseModalData<CreateSubfolderModalData>;

const CreateSubfolderModalComponent = ({
  data: { folder },
  dirty,
  pristine,
  invalid,
  handleSubmit,
}: CreateSubfolderModalProps & InjectedFormProps<FolderFormValues, CreateSubfolderModalProps>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const isCreatingFolder = useSelector(isCreatingFolderSelector);
  const folders = useSelector(transformedFoldersWithFullPathSelector);

  const parentFolder = useMemo(() => findFolderById(folders, folder.id), [folders, folder.id]);

  const onSubmit = (values: FolderFormValues) => {
    dispatch(
      createFoldersAction({
        folderName: values.folderName,
        parentFolderId: folder.id,
      }),
    );
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    isLoading: isCreatingFolder,
    isSubmitButtonDisabled: pristine || invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(commonMessages.createSubfolder)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form onSubmit={handleSubmit(onSubmit) as VoidFn}>
        <div className={cx('create-subfolder-modal__parent-folder')}>
          <div className={cx('create-subfolder-modal__parent-folder__label')}>
            {formatMessage(commonFolderMessages.newFolderLocation)}
          </div>
          {formatMessage(commonFolderMessages.root)} / {parentFolder?.fullPath || folder.name}
        </div>
        <FolderNameField />
        <ModalLoadingOverlay isVisible={isCreatingFolder} />
      </form>
    </Modal>
  );
};

export default withModal(CREATE_SUBFOLDER_MODAL_KEY)(
  reduxForm<FolderFormValues, CreateSubfolderModalProps>({
    form: CREATE_SUBFOLDER_FORM_NAME,
    shouldValidate: () => true,
    validate: ({ folderName }) => ({
      folderName: commonValidators.requiredField(folderName),
    }),
  })(CreateSubfolderModalComponent),
);
