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

import { useCallback, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { useLastItemOnThePage } from 'pages/inside/testCaseLibraryPage/hooks/useLastItemOnThePage';

import { DestinationFolderSwitch } from '../testCaseFolders/shared/DestinationFolderSwitch';
import { commonFolderMessages } from '../testCaseFolders/modals/commonFolderMessages';
import { ExtendedTestCase } from '../types';
import { useFolderModalMode } from '../hooks/useFolderModalMode';
import { useModalButtons } from '../hooks/useModalButtons';
import { validateFolderModalForm } from '../utils/validateFolderModalForm';
import { getFolderFromFormValues } from '../utils/getFolderFromFormValues';
import { FolderModalFormValues, FOLDER_MODAL_INITIAL_VALUES } from '../utils/folderModalFormConfig';
import { useTestCase } from '../createTestCaseModal/useTestCase';
import { messages } from './messages';

import styles from './moveTestCaseModal.scss';

const cx = createClassnames(styles);

export const MOVE_TEST_CASE_MODAL_KEY = 'moveTestCaseModalKey';
const MOVE_TEST_CASE_FORM = 'moveTestCaseForm';

export interface MoveTestCaseModalData {
  testCase: ExtendedTestCase;
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
  data: { testCase },
  handleSubmit,
  change,
}: MoveTestCaseModalProps & InjectedFormProps<FolderModalFormValues, MoveTestCaseModalProps>) => {
  const { formatMessage } = useIntl();
  const { isLoading, patchTestCase } = useTestCase();
  const { currentMode, handleModeChange } = useFolderModalMode({ change });
  const { updateUrl, isSingleItemOnTheLastPage } = useLastItemOnThePage();

  const onSubmit = useCallback(
    (values: FolderModalFormValues) => {
      if (!testCase) {
        return;
      }

      const folder = getFolderFromFormValues(values);

      patchTestCase({
        testCaseId: testCase.id,
        currentFolderId: testCase.testFolder?.id,
        folder,
        successMessageId: 'testCaseMovedSuccess',
        errorMessageId: 'testCaseMoveFailed',
        updateUrl,
        isSingleItemOnTheLastPage,
      }).catch(noop);
    },
    [testCase, patchTestCase, updateUrl, isSingleItemOnTheLastPage],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.MOVE),
    isLoading,
    onSubmit: handleSubmit(onSubmit) as () => void,
  });

  return (
    <Modal
      title={formatMessage(messages.moveTestCaseTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('move-test-case-modal__form')}>
        <DestinationFolderSwitch
          formName={MOVE_TEST_CASE_FORM}
          description={formatMessage(messages.moveTestCaseDescription, {
            testCaseName: testCase?.name,
            b: (text: ReactNode) => <b>{text}</b>,
          })}
          existingFolderButtonLabel={formatMessage(commonFolderMessages.moveToExistingFolder)}
          newFolderButtonLabel={formatMessage(commonFolderMessages.createNewFolder)}
          rootFolderToggleLabel={formatMessage(commonFolderMessages.createAsRootFolder)}
          currentMode={currentMode}
          onModeChange={handleModeChange}
          change={change}
          excludeFolderIds={testCase?.testFolder?.id ? [testCase.testFolder.id] : []}
        />
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
});

export default withModal(MOVE_TEST_CASE_MODAL_KEY)(MoveTestCaseModal);
