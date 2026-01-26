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
import { isEmpty } from 'es-toolkit/compat';
import { Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { DestinationFolderSwitch } from '../testCaseFolders/shared/DestinationFolderSwitch';
import { commonFolderMessages } from '../testCaseFolders/modals/commonFolderMessages';
import { ExtendedTestCase } from '../types';
import { useFolderModalMode } from '../hooks/useFolderModalMode';
import { useModalButtons } from '../hooks/useModalButtons';
import { validateFolderModalForm } from '../utils/validateFolderModalForm';
import { getFolderFromFormValues } from '../utils/getFolderFromFormValues';
import { FolderModalFormValues, FOLDER_MODAL_INITIAL_VALUES } from '../utils/folderModalFormConfig';
import { useTestCase } from '../hooks/useTestCase';
import { messages } from './messages';

import styles from './moveTestCaseModal.scss';

const cx = createClassnames(styles);

export const MOVE_TEST_CASE_MODAL_KEY = 'moveTestCaseModalKey';
const MOVE_TEST_CASE_FORM = 'moveTestCaseForm';

export interface MoveTestCaseModalData {
  testCase?: ExtendedTestCase;
  selectedTestCaseIds?: number[];
  sourceFolderDeltasMap?: Record<string, number>;
  onClearSelection?: VoidFn;
}

type MoveTestCaseModalProps = UseModalData<MoveTestCaseModalData>;

const MoveTestCaseModal = reduxForm<FolderModalFormValues, MoveTestCaseModalProps>({
  form: MOVE_TEST_CASE_FORM,
  destroyOnUnmount: true,
  initialValues: FOLDER_MODAL_INITIAL_VALUES,
  shouldValidate: () => true,
  validate: (values) => validateFolderModalForm(values),
})(({
  dirty,
  data: { testCase, selectedTestCaseIds = [], sourceFolderDeltasMap = {}, onClearSelection },
  handleSubmit,
  change,
}: MoveTestCaseModalProps & InjectedFormProps<FolderModalFormValues, MoveTestCaseModalProps>) => {
  const { formatMessage } = useIntl();
  const { isLoading, patchTestCase, batchMove } = useTestCase();
  const { currentMode, handleModeChange } = useFolderModalMode({ change });

  const isBatch = !isEmpty(selectedTestCaseIds.length);

  const moveTestCase = useCallback(
    async (values: FolderModalFormValues) => {
      if (!testCase) {
        return;
      }

      await patchTestCase({
        testCaseId: testCase.id,
        destinationFolder: getFolderFromFormValues(values),
        testCasesSourceFolderId: testCase.testFolder?.id,
        successMessageId: 'testCaseMovedSuccess',
        errorMessageId: 'testCaseMoveFailed',
      });
    },
    [testCase, patchTestCase],
  );

  const batchMoveTestCases = useCallback(
    async (values: FolderModalFormValues) => {
      const destinationFolder = getFolderFromFormValues(values);

      if (destinationFolder) {
        await batchMove({
          testCaseIds: selectedTestCaseIds,
          destinationFolder,
          sourceFolderDeltasMap,
          onSuccess: onClearSelection,
        });
      }
    },
    [selectedTestCaseIds, sourceFolderDeltasMap, onClearSelection, batchMove],
  );

  const onSubmit = useCallback(
    async (values: FolderModalFormValues) => {
      if (isBatch) {
        await batchMoveTestCases(values);
      } else {
        await moveTestCase(values);
      }
    },
    [isBatch, batchMoveTestCases, moveTestCase],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.MOVE),
    isLoading,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  const description = isBatch
    ? formatMessage(messages.moveTestCasesDescription, {
        count: selectedTestCaseIds.length,
        b: (text: ReactNode) => <b>{text}</b>,
      })
    : formatMessage(messages.moveTestCaseDescription, {
        testCaseName: testCase?.name,
        b: (text: ReactNode) => <b>{text}</b>,
      });

  const excludeFolderIds = testCase?.testFolder?.id ? [testCase.testFolder.id] : [];

  return (
    <Modal
      title={
        isBatch ? formatMessage(messages.moveToFolder) : formatMessage(messages.moveTestCaseTitle)
      }
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('move-test-case-modal__form')}>
        <DestinationFolderSwitch
          formName={MOVE_TEST_CASE_FORM}
          description={description}
          existingFolderButtonLabel={formatMessage(commonFolderMessages.moveToExistingFolder)}
          newFolderButtonLabel={formatMessage(commonFolderMessages.createNewFolder)}
          rootFolderToggleLabel={formatMessage(commonFolderMessages.createAsRootFolder)}
          currentMode={currentMode}
          excludeFolderIds={excludeFolderIds}
          change={change}
          onModeChange={handleModeChange}
        />
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
});

export default withModal(MOVE_TEST_CASE_MODAL_KEY)(MoveTestCaseModal);
