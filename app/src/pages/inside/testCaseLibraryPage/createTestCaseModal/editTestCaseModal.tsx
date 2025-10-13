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

import { FormEvent, MouseEvent, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { reduxForm, InjectedFormProps, initialize } from 'redux-form';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ExtendedTestCase, ManualScenarioType, CreateTestCaseFormData } from '../types';

import { commonMessages } from '../commonMessages';
import { BasicInformation } from './basicInformation';
import { TestCaseDetails } from './testCaseDetails';
import { useEditTestCase } from './useEditTestCase';

import styles from './createTestCaseModal.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const EDIT_SELECTED_TEST_CASE_MODAL_KEY = 'editSelectedTestCaseModalKey';

interface EditSelectedTestCaseModalProps extends InjectedFormProps<CreateTestCaseFormData> {
  data?: {
    testCase?: ExtendedTestCase;
  };
}

const EditSelectedTestCaseModalComponent = ({
  dirty,
  handleSubmit,
  data,
}: EditSelectedTestCaseModalProps) => {
  const testCase = data?.testCase;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isEditTestCaseLoading, editTestCase } = useEditTestCase(testCase?.id);

  useEffect(() => {
    if (testCase) {
      // Transform test case data to form format
      const manualScenario = testCase?.manualScenario;
      // Using type assertion to access union type properties safely
      const manualScenarioData = manualScenario as unknown as Record<string, unknown> | undefined;

      const formData = {
        name: testCase.name,
        description: testCase.description,
        folder: testCase.testFolder,
        priority: (testCase.priority?.toLowerCase() || 'unspecified') as TestCasePriority,
        tags: testCase.tags?.map((tag: { key: string }) => tag.key),
        manualScenarioType: manualScenario?.manualScenarioType || ManualScenarioType.STEPS,
        executionEstimationTime: manualScenario?.executionEstimationTime || 5,
        linkToRequirements: manualScenario?.linkToRequirements,
        precondition: manualScenario?.preconditions?.value,
        ...(manualScenarioData?.steps && {
          steps: manualScenarioData?.steps,
        }),
        ...(manualScenarioData?.instructions && {
          instructions: manualScenarioData?.instructions,
        }),
        ...(manualScenarioData?.expectedResult && {
          expectedResult: manualScenarioData?.expectedResult,
        }),
      };

      dispatch(
        initialize('edit-selected-test-case-modal-form', formData as CreateTestCaseFormData),
      );
    }
  }, [testCase, dispatch]);

  const handleUpdate = (formData: CreateTestCaseFormData) => {
    return editTestCase(formData, testCase?.testFolder?.id);
  };

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isEditTestCaseLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(handleUpdate) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isEditTestCaseLoading,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isEditTestCaseLoading,
  };

  return (
    <Modal
      title={formatMessage(commonMessages.editTestCase)}
      okButton={okButton}
      className={cx('create-test-case-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('create-test-case-modal__content-wrapper')}>
        <form onSubmit={handleSubmit(handleUpdate) as (event: FormEvent) => void}>
          <div className={cx('create-test-case-modal__container')}>
            <BasicInformation className={cx('create-test-case-modal__scrollable-section')} />
            <TestCaseDetails className={cx('create-test-case-modal__scrollable-section')} />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isEditTestCaseLoading} />
      </div>
    </Modal>
  );
};

const EditSelectedTestCaseModalForm = reduxForm<
  CreateTestCaseFormData,
  EditSelectedTestCaseModalProps
>({
  form: 'edit-selected-test-case-modal-form',
  validate: ({ name, folder }) => ({
    name: commonValidators.requiredField(name),
    folder: commonValidators.requiredField(folder),
  }),
  enableReinitialize: false,
})(EditSelectedTestCaseModalComponent);

export default withModal(EDIT_SELECTED_TEST_CASE_MODAL_KEY)(EditSelectedTestCaseModalForm);
