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

import { FormEvent, MouseEvent, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames, commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { commonMessages } from '../commonMessages';
import { CreateTestCaseFormData, ManualScenarioType } from '../types';
import { BasicInformation } from './basicInformation';
import { TestCaseDetails } from './testCaseDetails';
import { useCreateTestCase } from './useCreateTestCase';

import styles from './testCaseModal.scss';

const cx = createClassnames(styles);

export const CREATE_TEST_CASE_MODAL_KEY = 'createTestCaseModalKey';
export const CREATE_TEST_CASE_FORM_NAME: string = 'create-test-case-modal-form';

type CreateTestCaseModalProps = InjectedFormProps<CreateTestCaseFormData>;

const CreateTestCaseModalComponent = ({ dirty, handleSubmit }: CreateTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isCreateTestCaseLoading, createTestCase } = useCreateTestCase();

  const okButton = useMemo(
    () => ({
      children: (
        <LoadingSubmitButton isLoading={isCreateTestCaseLoading}>
          {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
        </LoadingSubmitButton>
      ),
      onClick: handleSubmit(createTestCase) as (event: MouseEvent<HTMLButtonElement>) => void,
      disabled: isCreateTestCaseLoading,
    }),
    [isCreateTestCaseLoading, formatMessage, handleSubmit, createTestCase],
  );

  const cancelButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isCreateTestCaseLoading,
    }),
    [formatMessage, isCreateTestCaseLoading],
  );

  const handleClose = useCallback(() => {
    dispatch(hideModalAction());
  }, [dispatch]);

  const handleFormSubmit = useMemo(
    () => handleSubmit(createTestCase) as (event: FormEvent) => void,
    [handleSubmit, createTestCase],
  );

  return (
    <Modal
      title={formatMessage(commonMessages.createTestCase)}
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
              formName={CREATE_TEST_CASE_FORM_NAME}
            />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isCreateTestCaseLoading} />
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
