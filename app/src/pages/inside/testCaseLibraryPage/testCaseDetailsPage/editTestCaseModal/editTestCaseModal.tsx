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

import { MouseEventHandler, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { FieldText, Modal } from '@reportportal/ui-kit';

import { hideModalAction, withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { UpdateTestCasePayload, useUpdateTestCase } from './useUpdateTestCase';
import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';
import { PrioritySelect } from '../../prioritySelect/prioritySelect';

import styles from './editTestCaseModal.scss';

export const EDIT_TEST_CASE_MODAL_KEY = 'editTestCaseModalKey';

const cx = classNames.bind(styles) as typeof classNames;

interface EditTestCaseModalProps {
  data: {
    initialValues: UpdateTestCasePayload;
    testCaseId: number;
  };
}

const EditTestCaseModal = ({
  handleSubmit,
  pristine,
  invalid,
  initialize,
  data: { testCaseId, initialValues },
}: InjectedFormProps<UpdateTestCasePayload> & EditTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { updateTestCase, isUpdateTestCaseLoading } = useUpdateTestCase();

  const hideModal = () => dispatch(hideModalAction());
  const handleUpdate = (formData: UpdateTestCasePayload) => updateTestCase(testCaseId, formData);

  useEffect(() => {
    initialize(initialValues);
  }, [initialValues, initialize]);

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    onClick: handleSubmit(handleUpdate) as unknown as MouseEventHandler<HTMLButtonElement>,
    disabled: pristine || invalid || isUpdateTestCaseLoading,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    onClick: hideModal,
  };

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
