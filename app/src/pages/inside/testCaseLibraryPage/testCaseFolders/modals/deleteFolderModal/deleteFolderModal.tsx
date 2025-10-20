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

import { MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { UseModalData } from 'common/hooks';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { deleteFolderAction, DeleteFolderParams } from 'controllers/testCase/actionCreators';
import { isLoadingFolderSelector } from 'controllers/testCase';

import styles from './deleteFolderModal.scss';

const messages = defineMessages({
  deleteFolderTitle: {
    id: 'TestCaseLibraryPage.deleteFolderTitle',
    defaultMessage: 'Delete Folder',
  },
  deleteFolderText: {
    id: 'TestCaseLibraryPage.deleteFolderText',
    defaultMessage:
      'Are you sure you want to delete folder <b>{name}</b>? This action is irreversible and will also permanently remove all test cases and subfolders, if any.',
  },
});

const cx = createClassnames(styles);

export const DELETE_FOLDER_MODAL_KEY = 'deleteFolderModalKey';

const DeleteFolderModalComponent = ({
  data: { folder, activeFolderId, setAllTestCases },
}: UseModalData<DeleteFolderParams>) => {
  const dispatch = useDispatch();
  const isLoadingFolder = useSelector(isLoadingFolderSelector);
  const { formatMessage } = useIntl();

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = () => {
    dispatch(
      deleteFolderAction({
        folder,
        activeFolderId,
        setAllTestCases,
      }),
    );
  };

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoadingFolder}>
        {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
      </LoadingSubmitButton>
    ),
    onClick: onSubmit as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isLoadingFolder,
    variant: 'danger' as const,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoadingFolder,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.deleteFolderTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      {formatMessage(messages.deleteFolderText, {
        b: (data) => <span className={cx('delete-folder-modal__text--bold')}>{data}</span>,
        name: folder.name,
      })}
    </Modal>
  );
};

export default withModal(DELETE_FOLDER_MODAL_KEY)(DeleteFolderModalComponent);
