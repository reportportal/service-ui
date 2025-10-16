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

import { FormEvent, MouseEvent, useEffect, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { reduxForm, InjectedFormProps, initialize } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames, commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { commonMessages } from '../commonMessages';
import { ExtendedTestCase, CreateTestCaseFormData, ManualScenarioType } from '../types';
import { convertStepsArrayToObject } from '../utils';
import { BasicInformation } from '../createTestCaseModal/basicInformation';
import { TestCaseDetails } from '../createTestCaseModal/testCaseDetails';
import { useEditTestCase } from './useEditTestCase';

import styles from '../createTestCaseModal/testCaseModal.scss';

const cx = createClassnames(styles);

export const EDIT_SELECTED_TEST_CASE_MODAL_KEY = 'editSelectedTestCaseModalKey';
export const EDIT_TEST_CASE_FORM_NAME: string = 'edit-test-case-modal-form';

interface EditTestCaseModalProps extends InjectedFormProps<CreateTestCaseFormData> {
  data?: {
    testCase?: ExtendedTestCase;
  };
}

const EditTestCaseModalComponent = ({ dirty, handleSubmit, data }: EditTestCaseModalProps) => {
  const testCase = data?.testCase;

  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isEditTestCaseLoading, editTestCase } = useEditTestCase(testCase?.id);

  useEffect(() => {
    if (testCase) {
      const manualScenario = testCase?.manualScenario;
      const stepsObject = convertStepsArrayToObject(manualScenario?.steps);

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

      dispatch(initialize(EDIT_TEST_CASE_FORM_NAME, formData));
    }
  }, [testCase, dispatch]);

  const handleUpdate = useCallback(
    (formData: CreateTestCaseFormData) => {
      return editTestCase(formData, testCase?.testFolder?.id);
    },
    [editTestCase, testCase?.testFolder?.id],
  );

  const okButton = useMemo(
    () => ({
      children: (
        <LoadingSubmitButton isLoading={isEditTestCaseLoading}>
          {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
        </LoadingSubmitButton>
      ),
      onClick: handleSubmit(handleUpdate) as (event: MouseEvent<HTMLButtonElement>) => void,
      disabled: isEditTestCaseLoading,
    }),
    [isEditTestCaseLoading, formatMessage, handleSubmit, handleUpdate],
  );

  const cancelButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isEditTestCaseLoading,
    }),
    [formatMessage, isEditTestCaseLoading],
  );

  const handleClose = useCallback(() => {
    dispatch(hideModalAction());
  }, [dispatch]);

  const handleFormSubmit = useMemo(
    () => handleSubmit(handleUpdate) as (event: FormEvent) => void,
    [handleSubmit, handleUpdate],
  );

  return (
    <Modal
      title={formatMessage(commonMessages.editTestCase)}
      okButton={okButton}
      className={cx('test-case-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={handleClose}
    >
      <div className={cx('test-case-modal__content-wrapper')}>
        <form onSubmit={handleFormSubmit}>
          <div className={cx('test-case-modal__container')}>
            <BasicInformation className={cx('test-case-modal__scrollable-section')} />
            <TestCaseDetails
              className={cx('test-case-modal__scrollable-section')}
              formName={EDIT_TEST_CASE_FORM_NAME}
            />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isEditTestCaseLoading} />
      </div>
    </Modal>
  );
};

const ReduxFormComponent = reduxForm<CreateTestCaseFormData, EditTestCaseModalProps>({
  form: EDIT_TEST_CASE_FORM_NAME,
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
})(EditTestCaseModalComponent);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const EditSelectedTestCaseModal = withModal(EDIT_SELECTED_TEST_CASE_MODAL_KEY)(
  ReduxFormComponent,
);
