/*
 * Copyright 2026 EPAM Systems
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

import { useCallback, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';
import { DestinationFolderSwitch } from '../../testCaseFolders/shared/DestinationFolderSwitch';
import { useFolderModalMode } from '../../hooks/useFolderModalMode';
import { useModalButtons } from 'hooks/useModalButtons';
import { validateFolderModalForm } from '../../utils/validateFolderModalForm';
import { FolderModalFormValues } from '../../utils/folderModalFormConfig';
import { commonFolderMessages } from '../../testCaseFolders/modals/commonFolderMessages';
import { useBatchDuplicateTestCases } from './useBatchDuplicateTestCases';
import { messages } from './messages';

import styles from './batchDuplicateTestCasesModal.scss';

const cx = createClassnames(styles);

export const BATCH_DUPLICATE_TEST_CASES_MODAL_KEY = 'batchDuplicateTestCasesModalKey';
const BATCH_DUPLICATE_TEST_CASES_FORM = 'batchDuplicateTestCasesForm';

export interface BatchDuplicateTestCasesModalData {
  selectedTestCaseIds: number[];
  count: number;
  onClearSelection?: VoidFn;
}

type BatchDuplicateTestCasesModalProps = UseModalData<BatchDuplicateTestCasesModalData>;

const BatchDuplicateTestCasesModal = reduxForm<
  FolderModalFormValues,
  BatchDuplicateTestCasesModalProps
>({
  form: BATCH_DUPLICATE_TEST_CASES_FORM,
  destroyOnUnmount: true,
  initialValues: {
    mode: ButtonSwitcherOption.EXISTING,
    destinationFolder: undefined,
    folderName: '',
    parentFolder: undefined,
    isRootFolder: false,
  },
  shouldValidate: () => true,
  validate: (values) => validateFolderModalForm(values),
})(({
  dirty,
  pristine,
  invalid,
  data: { selectedTestCaseIds = [], count = 0, onClearSelection = noop },
  handleSubmit,
  change,
}: BatchDuplicateTestCasesModalProps &
  InjectedFormProps<FolderModalFormValues, BatchDuplicateTestCasesModalProps>) => {
  const { formatMessage } = useIntl();
  const { isLoading, batchDuplicateTestCases } = useBatchDuplicateTestCases({
    onSuccess: onClearSelection,
  });
  const { currentMode, handleModeChange } = useFolderModalMode({ change });

  const onSubmit = useCallback(
    (values: FolderModalFormValues) => {
      if (currentMode === ButtonSwitcherOption.EXISTING) {
        const testFolderId = coerceToNumericId(values.destinationFolder?.id);

        if (testFolderId) {
          batchDuplicateTestCases({
            testCaseIds: selectedTestCaseIds,
            testFolderId,
          }).catch(noop);
        }
      } else {
        batchDuplicateTestCases({
          testCaseIds: selectedTestCaseIds,
          testFolder: {
            name: values.folderName || '',
            parentTestFolderId: coerceToNumericId(values.parentFolder?.id ?? null),
          },
        }).catch(noop);
      }
    },
    [currentMode, batchDuplicateTestCases, selectedTestCaseIds],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE),
    isLoading,
    isSubmitButtonDisabled: pristine || invalid,
    onSubmit: handleSubmit(onSubmit) as () => void,
  });

  const description = formatMessage(messages.batchDuplicateDescription, {
    count,
    b: (text: ReactNode) => <b>{text}</b>,
  });

  return (
    <Modal
      title={formatMessage(messages.title)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('batch-duplicate-test-cases-modal__form')}>
        <DestinationFolderSwitch
          formName={BATCH_DUPLICATE_TEST_CASES_FORM}
          description={description}
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

export default withModal(BATCH_DUPLICATE_TEST_CASES_MODAL_KEY)(BatchDuplicateTestCasesModal);
