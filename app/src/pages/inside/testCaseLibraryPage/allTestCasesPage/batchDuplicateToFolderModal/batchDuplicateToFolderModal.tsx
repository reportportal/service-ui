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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';

import { DestinationFolderSwitch } from '../../testCaseFolders/shared/DestinationFolderSwitch';
import { useFolderModalMode } from '../../hooks/useFolderModalMode';
import { useModalButtons } from '../../hooks/useModalButtons';
import { validateFolderModalForm } from '../../utils/validateFolderModalForm';
import { FolderModalFormValues } from '../../utils/folderModalFormConfig';
import { commonFolderMessages } from '../../testCaseFolders/modals/commonFolderMessages';
import { useBatchDuplicateToFolder } from './useBatchDuplicateToFolder';
import { messages } from './messages';

import styles from './batchDuplicateToFolderModal.scss';

const cx = createClassnames(styles);

export const BATCH_DUPLICATE_TO_FOLDER_MODAL_KEY = 'batchDuplicateToFolderModalKey';
const BATCH_DUPLICATE_TO_FOLDER_FORM = 'batchDuplicateToFolderForm';

export interface BatchDuplicateToFolderModalData {
  selectedTestCaseIds: number[];
  count: number;
  onClearSelection: () => void;
}

type BatchDuplicateToFolderModalProps = UseModalData<BatchDuplicateToFolderModalData>;

const BatchDuplicateToFolderModal = reduxForm<
  FolderModalFormValues,
  BatchDuplicateToFolderModalProps
>({
  form: BATCH_DUPLICATE_TO_FOLDER_FORM,
  destroyOnUnmount: true,
  shouldValidate: () => true,
  validate: (values) => validateFolderModalForm(values),
  initialValues: {
    mode: ButtonSwitcherOption.EXISTING,
    destinationFolder: undefined,
    folderName: '',
    parentFolder: undefined,
    isRootFolder: false,
  },
})(({
  dirty,
  handleSubmit,
  change,
  data: { selectedTestCaseIds = [], count = 0, onClearSelection },
}: BatchDuplicateToFolderModalProps &
  InjectedFormProps<FolderModalFormValues, BatchDuplicateToFolderModalProps>) => {
  const { formatMessage } = useIntl();
  const { isLoading, batchDuplicate } = useBatchDuplicateToFolder({ onSuccess: onClearSelection });
  const { currentMode, handleModeChange } = useFolderModalMode({ change });

  const onSubmit = useCallback(
    (values: FolderModalFormValues) => {
      if (currentMode === ButtonSwitcherOption.EXISTING) {
        const testFolderId = coerceToNumericId(values.destinationFolder?.id);

        if (testFolderId) {
          batchDuplicate({
            testCaseIds: selectedTestCaseIds,
            testFolderId,
          }).catch(noop);
        }
      } else {
        batchDuplicate({
          testCaseIds: selectedTestCaseIds,
          testFolder: {
            name: values.folderName || '',
            parentTestFolderId: coerceToNumericId(values.parentFolder?.id ?? null),
          },
        }).catch(noop);
      }
    },
    [currentMode, batchDuplicate, selectedTestCaseIds],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE),
    isLoading,
    onSubmit: handleSubmit(onSubmit) as () => void,
  });

  return (
    <Modal
      title={formatMessage(messages.batchDuplicateToFolderTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('batch-duplicate-modal__form')}>
        <DestinationFolderSwitch
          formName={BATCH_DUPLICATE_TO_FOLDER_FORM}
          description={formatMessage(messages.batchDuplicateDescription, {
            count,
            b: (text) => <b>{text}</b>,
          })}
          existingFolderButtonLabel={formatMessage(messages.duplicateToExistingFolder)}
          newFolderButtonLabel={formatMessage(commonFolderMessages.createNewFolder)}
          rootFolderToggleLabel={formatMessage(messages.duplicateToRootDirectory)}
          currentMode={currentMode}
          onModeChange={handleModeChange}
          change={change}
        />
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
});

export default withModal(BATCH_DUPLICATE_TO_FOLDER_MODAL_KEY)(BatchDuplicateToFolderModal);
