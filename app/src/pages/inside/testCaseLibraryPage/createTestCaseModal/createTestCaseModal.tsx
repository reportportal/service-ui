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

import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';

import { BasicInformation } from './basicInformation';
import { TestCaseDetails, StepData } from './testCaseDetails';
import { commonMessages } from '../commonMessages';

import styles from './createTestCaseModal.scss';

const cx = classNames.bind(styles);

export const CREATE_TEST_CASE_MODAL_KEY = 'createTestCaseModalKey';

interface CreateTestCaseFormValues {
  testCaseName: string;
  folder: string;
  priority: TestCasePriority;
  description: string;
  template: 'steps' | 'text';
  requirementsLink: string;
  executionTime: number;
  steps: StepData[];
}

interface CreateTestCaseModalProps {
  onSubmit: (values: CreateTestCaseFormValues) => void;
}

export const CreateTestCaseModal = reduxForm<CreateTestCaseFormValues, CreateTestCaseModalProps>({
  form: 'create-test-case-modal-form',
  initialValues: {
    priority: 'unspecified',
    template: 'steps',
    executionTime: 5,
  },
  validate: ({ testCaseName, folder }) => ({
    testCaseName: commonValidators.requiredField(testCaseName),
    folder: commonValidators.requiredField(folder),
  }),
})(({ onSubmit, handleSubmit }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: handleSubmit(onSubmit),
  };

  return (
    <Modal
      title={formatMessage(commonMessages.createTestCase)}
      okButton={okButton}
      className={cx('create-test-case-modal')}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CANCEL) }}
      scrollable
      onClose={() => dispatch(hideModalAction())}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={cx('create-test-case-modal__container')}>
          <BasicInformation />
          <TestCaseDetails />
        </div>
      </form>
    </Modal>
  );
});
