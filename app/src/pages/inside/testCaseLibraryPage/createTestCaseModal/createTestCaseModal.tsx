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
import { reduxForm, InjectedFormProps } from 'redux-form';

import { commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';

import { commonMessages } from '../commonMessages';
import { CreateTestCaseFormData } from '../types';
import { TestCaseModal } from './testCaseModal/testCaseModal';
import { useTestCase } from './useTestCase';
import { TEST_CASE_FORM_INITIAL_VALUES } from './constants';

export const CREATE_TEST_CASE_MODAL_KEY = 'createTestCaseModalKey';
export const CREATE_TEST_CASE_FORM_NAME: string = 'create-test-case-modal-form';

type CreateTestCaseModalProps = InjectedFormProps<CreateTestCaseFormData>;

const CreateTestCaseModalComponent = ({ pristine, handleSubmit }: CreateTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const { isLoading: isCreateTestCaseLoading, createTestCase } = useTestCase();

  return (
    <TestCaseModal
      pristine={pristine}
      handleSubmit={handleSubmit}
      title={formatMessage(commonMessages.createTestCase)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      isLoading={isCreateTestCaseLoading}
      onSubmitHandler={createTestCase}
      formName={CREATE_TEST_CASE_FORM_NAME}
    />
  );
};

const ReduxFormComponent = reduxForm<CreateTestCaseFormData, CreateTestCaseModalProps>({
  form: CREATE_TEST_CASE_FORM_NAME,
  initialValues: TEST_CASE_FORM_INITIAL_VALUES,
  validate: ({ name, folder, linkToRequirements }) => ({
    name: commonValidators.requiredField(name),
    folder: commonValidators.requiredField(folder),
    linkToRequirements: commonValidators.optionalUrl(linkToRequirements),
  }),
  enableReinitialize: false,
})(CreateTestCaseModalComponent);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const CreateTestCaseModal = withModal(CREATE_TEST_CASE_MODAL_KEY)(ReduxFormComponent);
