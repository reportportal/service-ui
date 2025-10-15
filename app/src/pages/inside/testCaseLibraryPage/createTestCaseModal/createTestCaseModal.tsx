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

import { commonMessages } from '../commonMessages';
import { ExtendedTestCase, CreateTestCaseFormData, ManualScenarioType } from '../types';
import { convertStepsArrayToObject } from '../utils';
import { BasicInformation } from './basicInformation';
import { StepData, TestCaseDetails } from './testCaseDetails';
import { useCreateTestCase } from './useCreateTestCase';
import { useEditTestCase } from './useEditTestCase';

import styles from './createTestCaseModal.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const CREATE_TEST_CASE_MODAL_KEY = 'createTestCaseModalKey';
export const EDIT_SELECTED_TEST_CASE_MODAL_KEY = 'editSelectedTestCaseModalKey';
export const CREATE_TEST_CASE_FORM_NAME: string = 'create-test-case-modal-form';

interface CreateTestCaseModalProps extends InjectedFormProps<CreateTestCaseFormData> {
  data?: {
    testCase?: ExtendedTestCase;
  };
}

const CreateTestCaseModalComponent = ({ dirty, handleSubmit, data }: CreateTestCaseModalProps) => {
  const testCase = data?.testCase;
  const isEditMode = !!testCase;

  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isCreateTestCaseLoading, createTestCase } = useCreateTestCase();
  const { isEditTestCaseLoading, editTestCase } = useEditTestCase(testCase?.id);

  const isLoading = isEditMode ? isEditTestCaseLoading : isCreateTestCaseLoading;

  useEffect(() => {
    if (testCase) {
      const manualScenario = testCase?.manualScenario;
      const stepsObject = convertStepsArrayToObject(manualScenario?.steps as StepData[]);

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
        preconditionAttachments: manualScenario?.preconditions?.attachments || [],
        ...(stepsObject && {
          steps: stepsObject,
        }),
      };

      dispatch(initialize(CREATE_TEST_CASE_FORM_NAME, formData));
    }
  }, [testCase, dispatch]);

  const handleUpdate = (formData: CreateTestCaseFormData) => {
    return editTestCase(formData, testCase?.testFolder?.id);
  };

  const handleAction = isEditMode ? handleUpdate : createTestCase;

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(isEditMode ? COMMON_LOCALE_KEYS.SAVE : COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(handleAction) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isLoading,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
  };

  return (
    <Modal
      title={formatMessage(
        isEditMode ? commonMessages.editTestCase : commonMessages.createTestCase,
      )}
      okButton={okButton}
      className={cx('create-test-case-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('create-test-case-modal__content-wrapper')}>
        <form onSubmit={handleSubmit(handleAction) as (event: FormEvent) => void}>
          <div className={cx('create-test-case-modal__container')}>
            <BasicInformation className={cx('create-test-case-modal__scrollable-section')} />
            <TestCaseDetails className={cx('create-test-case-modal__scrollable-section')} />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};

const ReduxFormComponent = reduxForm<CreateTestCaseFormData, CreateTestCaseModalProps>({
  form: CREATE_TEST_CASE_FORM_NAME,
  initialValues: {
    priority: 'unspecified',
    manualScenarioType: ManualScenarioType.STEPS,
    executionEstimationTime: 5,
  },
  validate: ({ name, folder, linkToRequirements }) => ({
    name: commonValidators.requiredField(name),
    folder: commonValidators.requiredField(folder),
    linkToRequirements: commonValidators.optionalUrl(linkToRequirements),
  }),
  enableReinitialize: false,
})(CreateTestCaseModalComponent);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const CreateTestCaseModal = withModal(CREATE_TEST_CASE_MODAL_KEY)(ReduxFormComponent);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const EditSelectedTestCaseModal = withModal(EDIT_SELECTED_TEST_CASE_MODAL_KEY)(
  ReduxFormComponent,
);
