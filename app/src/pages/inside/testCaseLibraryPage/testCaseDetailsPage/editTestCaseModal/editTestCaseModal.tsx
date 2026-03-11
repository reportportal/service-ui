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

import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { FieldText, Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { useModalButtons } from 'pages/inside/testCaseLibraryPage/hooks/useModalButtons';

import { FieldErrorHint, FieldProvider } from 'components/fields';
import { UpdateTestCasePayload } from '../../hooks/useTestCaseMutations';
import { useTestCase } from '../../hooks/useTestCase';
import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';

import { PrioritySelect } from '../../prioritySelect/prioritySelect';

import styles from './editTestCaseModal.scss';

export const EDIT_TEST_CASE_MODAL_KEY = 'editTestCaseModalKey';

const cx = createClassnames(styles);

type EditTestCaseModalProps = UseModalData<{
  initialValues: UpdateTestCasePayload;
  testCaseId: number;
}>;

const EditTestCaseModal = ({
  data: { testCaseId, initialValues },
  pristine,
  invalid,
  handleSubmit,
  initialize,
}: InjectedFormProps<UpdateTestCasePayload> & EditTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const { patchTestCase, isLoading } = useTestCase(testCaseId);

  const handleUpdate = (formData: UpdateTestCasePayload) =>
    patchTestCase({ testCaseId, payload: formData });

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    isLoading: isLoading,
    isSubmitButtonDisabled: pristine || invalid,
    onSubmit: handleSubmit(handleUpdate) as VoidFn,
  });

  useEffect(() => {
    initialize(initialValues);
  }, [initialValues, initialize]);

  return (
    <Modal
      title={formatMessage(messages.editTestCase)}
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
        <div className={cx('priority-select')}>
          <FieldProvider name="priority">
            <PrioritySelect />
          </FieldProvider>
        </div>
      </form>
    </Modal>
  );
};

export default withModal(EDIT_TEST_CASE_MODAL_KEY)(
  reduxForm<UpdateTestCasePayload, EditTestCaseModalProps>({
    form: 'edit-test-case-form',
    shouldValidate: () => true,
    validate: ({ name }: { name: string }) => ({
      name: commonValidators.requiredField(name),
    }),
  })(EditTestCaseModal),
);
