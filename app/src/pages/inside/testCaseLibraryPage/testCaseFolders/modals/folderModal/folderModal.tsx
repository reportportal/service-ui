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

import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, getFormValues } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { hideModalAction } from 'controllers/modal';

import { CreateFolderForm } from '../../shared/CreateFolderForm';
import { FolderFormValues } from '../types';
import { PARENT_FOLDER_FIELD } from '../constants';

import styles from './folderModal.scss';

const cx = createClassnames(styles);

interface FolderModalConfig {
  title: string;
  isLoading: boolean;
  isToggled: boolean;
  toggleLabel: string;
  formName: string;
  toggleFieldName: string;
  parentFolderFieldName: string;
  parentFolderFieldLabel: string;
  toggleDisabled?: boolean;
  isInvertedToggle?: boolean;
  customContent?: ReactNode;
  excludeFolderIds?: number[];
  onSubmit: (values: unknown) => void;
}

type FolderModalProps = FolderModalConfig &
  Pick<InjectedFormProps<unknown>, 'dirty' | 'handleSubmit' | 'change'>;

export const FolderModal = ({
  title,
  dirty,
  isLoading,
  isToggled,
  toggleLabel,
  toggleFieldName,
  formName,
  toggleDisabled = false,
  parentFolderFieldName,
  parentFolderFieldLabel,
  isInvertedToggle = false,
  customContent,
  excludeFolderIds = [],
  handleSubmit,
  change,
  onSubmit,
}: FolderModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const hideModal = () => dispatch(hideModalAction());
  const formValues = useSelector((state) => getFormValues(formName)(state) as FolderFormValues);

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: handleSubmit(onSubmit) as () => void,
    disabled:
      isLoading || parentFolderFieldName === PARENT_FOLDER_FIELD
        ? isToggled && !formValues?.[parentFolderFieldName as keyof FolderFormValues]
        : false,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
    onClick: hideModal,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={title}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('folder-modal__form')} onSubmit={handleSubmit(onSubmit) as () => void}>
        {customContent}
        <CreateFolderForm
          isToggled={isToggled}
          toggleLabel={toggleLabel}
          toggleFieldName={toggleFieldName}
          parentFolderFieldName={parentFolderFieldName}
          parentFolderFieldLabel={parentFolderFieldLabel}
          toggleDisabled={toggleDisabled}
          isInvertedToggle={isInvertedToggle}
          excludeFolderIds={excludeFolderIds}
          change={change}
        />
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
};
