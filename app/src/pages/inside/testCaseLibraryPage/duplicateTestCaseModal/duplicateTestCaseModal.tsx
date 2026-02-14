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

import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { FieldText, Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { useModalButtons } from 'pages/inside/testCaseLibraryPage/hooks/useModalButtons';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { CreateFolderAutocomplete } from 'pages/inside/testCaseLibraryPage/testCaseFolders/shared/CreateFolderAutocomplete';

import { useDuplicateTestCase } from './useDuplicateTestCase';
import { messages } from './messages';
import { commonMessages } from '../commonMessages';
import { DuplicateTestCaseFormValues, DuplicateTestCaseModalProps } from './types';

import styles from './duplicateTestCaseModal.scss';

export const DUPLICATE_TEST_CASE_MODAL_KEY = 'duplicateTestCaseModalKey';

const cx = createClassnames(styles);

const DuplicateTestCaseModal = ({
  data: { testCase },
  pristine,
  invalid,
  handleSubmit,
}: InjectedFormProps<DuplicateTestCaseFormValues> & DuplicateTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const { duplicateTestCase, isLoading } = useDuplicateTestCase();

  const handleDuplicate = (formData: DuplicateTestCaseFormValues) =>
    duplicateTestCase({
      testCaseId: testCase.id,
      testFolderId: formData.folder.id,
      name: formData.name,
    });

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE),
    isLoading: isLoading,
    isSubmitButtonDisabled: pristine || invalid,
    onSubmit: handleSubmit(handleDuplicate) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(messages.duplicateTestCase)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <form>
        <FieldProvider name="name" placeholder={formatMessage(messages.enterTestCaseName)}>
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(commonMessages.testCaseName)}
              defaultWidth={false}
              isRequired
            />
          </FieldErrorHint>
        </FieldProvider>
        <div className={cx('folder-select')}>
          <FieldProvider name="folder">
            <FieldErrorHint provideHint={false}>
              <CreateFolderAutocomplete label={formatMessage(commonMessages.folder)} isRequired />
            </FieldErrorHint>
          </FieldProvider>
          <span className={cx('folder-description')}>
            {formatMessage(messages.selectFolderForDuplicate)}
          </span>
        </div>
      </form>
    </Modal>
  );
};

export default withModal(DUPLICATE_TEST_CASE_MODAL_KEY)(
  reduxForm<DuplicateTestCaseFormValues, DuplicateTestCaseModalProps>({
    form: 'duplicate-test-case-form',
    shouldValidate: () => true,
    validate: ({ name, folder }: Partial<DuplicateTestCaseFormValues>) => ({
      name: commonValidators.requiredField(name),
      folder: commonValidators.requiredField(folder),
    }),
  })(DuplicateTestCaseModal),
);
