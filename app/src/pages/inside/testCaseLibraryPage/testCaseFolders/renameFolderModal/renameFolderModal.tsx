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

import { MouseEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { commonValidators } from 'common/utils/validation';
import { renameFolderAction } from 'controllers/testCase/actionCreators';
import { isLoadingFolderSelector } from 'controllers/testCase';
import { FolderNameField } from '../shared/FolderFormFields';

import styles from './renameFolderModal.scss';

const messages = defineMessages({
  title: {
    id: 'RenameFolderModal.title',
    defaultMessage: 'Rename Folder',
  },
});

const cx = classNames.bind(styles) as typeof classNames;

export const RENAME_FOLDER_MODAL_KEY = 'renameFolderModalKey';

import { FolderFormValues } from '../shared/types';

interface RenameFolderModalProps {
  data: {
    folderId: number;
    folderName: string;
  };
}

const RenameFolderModalComponent = ({
  data: { folderId, folderName },
  dirty,
  initialize,
  handleSubmit,
}: RenameFolderModalProps & InjectedFormProps<FolderFormValues, RenameFolderModalProps>) => {
  const dispatch = useDispatch();
  const isLoadingFolder = useSelector(isLoadingFolderSelector);
  const { formatMessage } = useIntl();

  useEffect(() => {
    initialize({ folderName });
  }, [folderName, initialize]);

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = (values: FolderFormValues) => {
    dispatch(
      renameFolderAction({
        folderName: values.folderName,
        folderId,
      }),
    );
  };

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoadingFolder}>
        {formatMessage(COMMON_LOCALE_KEYS.RENAME)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(onSubmit) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isLoadingFolder,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoadingFolder,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.title)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <form onSubmit={handleSubmit(onSubmit)} className={cx('rename-folder-modal__form')}>
        <FolderNameField />
        <ModalLoadingOverlay isVisible={isLoadingFolder} />
      </form>
    </Modal>
  );
};

export default withModal(RENAME_FOLDER_MODAL_KEY)(
  reduxForm<FolderFormValues, RenameFolderModalProps>({
    form: 'rename-folder-modal-form',
    validate: ({ folderName }) => ({
      folderName: commonValidators.requiredField(folderName),
    }),
  })(RenameFolderModalComponent),
);
