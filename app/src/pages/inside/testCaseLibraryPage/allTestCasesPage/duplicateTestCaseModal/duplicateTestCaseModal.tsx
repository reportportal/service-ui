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

import { useCallback, useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { noop } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
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
import { useModalButtons } from '../../hooks/useModalButtons';
import { validateFolderModalForm } from '../../utils/validateFolderModalForm';
import { FolderModalFormValues } from '../../utils/folderModalFormConfig';
import { commonFolderMessages } from '../../testCaseFolders/modals/commonFolderMessages';
import { useDuplicateTestCase } from './useDuplicateTestCase';
import { messages } from './messages';
import { ExtendedTestCase } from '../../types';

import styles from './duplicateTestCaseModal.scss';

const cx = createClassnames(styles);

export const DUPLICATE_TEST_CASE_MODAL_KEY = 'duplicateTestCaseModalKey';
const DUPLICATE_TEST_CASE_FORM = 'duplicateTestCaseForm';

export interface DuplicateTestCaseModalData {
  selectedTestCaseIds: number[];
  count: number;
  testCase?: ExtendedTestCase;
  onClearSelection?: VoidFn;
}

type DuplicateTestCaseModalProps = UseModalData<DuplicateTestCaseModalData>;

const DuplicateTestCaseModal = reduxForm<FolderModalFormValues, DuplicateTestCaseModalProps>({
  form: DUPLICATE_TEST_CASE_FORM,
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
  data: { selectedTestCaseIds = [], count = 0, testCase, onClearSelection = noop },
  handleSubmit,
  change,
}: DuplicateTestCaseModalProps &
  InjectedFormProps<FolderModalFormValues, DuplicateTestCaseModalProps>) => {
  const { formatMessage } = useIntl();
  const { isLoading, duplicateTestCase } = useDuplicateTestCase({ onSuccess: onClearSelection });
  const { currentMode, handleModeChange } = useFolderModalMode({ change });

  const testCaseIds = useMemo(() => {
    if (testCase) {
      return [testCase.id];
    }
    if (!isEmpty(selectedTestCaseIds)) {
      return selectedTestCaseIds;
    }

    return [];
  }, [selectedTestCaseIds, testCase]);
  const isBatch = testCaseIds.length > 1 || !testCase;

  const onSubmit = useCallback(
    (values: FolderModalFormValues) => {
      if (currentMode === ButtonSwitcherOption.EXISTING) {
        const testFolderId = coerceToNumericId(values.destinationFolder?.id);

        if (testFolderId) {
          duplicateTestCase({
            testCaseIds,
            testFolderId,
          }).catch(noop);
        }
      } else {
        duplicateTestCase({
          testCaseIds,
          testFolder: {
            name: values.folderName || '',
            parentTestFolderId: coerceToNumericId(values.parentFolder?.id ?? null),
          },
        }).catch(noop);
      }
    },
    [currentMode, duplicateTestCase, testCaseIds],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE),
    isLoading,
    isSubmitButtonDisabled: pristine || invalid,
    onSubmit: handleSubmit(onSubmit) as () => void,
  });

  const description = isBatch
    ? formatMessage(messages.batchDuplicateDescription, {
        count,
        b: (text: ReactNode) => <b>{text}</b>,
      })
    : formatMessage(messages.duplicateTestCaseDescription, {
        testCaseName: testCase?.name || '',
        b: (text: ReactNode) => <b>{text}</b>,
      });

  return (
    <Modal
      title={
        isBatch
          ? formatMessage(messages.duplicateToFolderTitle)
          : formatMessage(messages.duplicateTestCaseTitle)
      }
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('duplicate-test-case-modal__form')}>
        <DestinationFolderSwitch
          formName={DUPLICATE_TEST_CASE_FORM}
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

export default withModal(DUPLICATE_TEST_CASE_MODAL_KEY)(DuplicateTestCaseModal);
