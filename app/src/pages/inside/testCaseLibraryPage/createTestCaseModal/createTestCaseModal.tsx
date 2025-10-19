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
import { reduxForm, InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames, commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { FolderWithFullPath } from 'controllers/testCase';

import { commonMessages } from '../commonMessages';
import { BasicInformation } from './basicInformation';
import { TestCaseDetails } from './testCaseDetails';
import { Attachment, TestStep, useCreateTestCase } from './useCreateTestCase';

import styles from './createTestCaseModal.scss';

const cx = createClassnames(styles);

export const CREATE_TEST_CASE_MODAL_KEY = 'createTestCaseModalKey';
export const CREATE_TEST_CASE_FORM_NAME: string = 'create-test-case-modal-form';

export type ManualScenarioType = 'STEPS' | 'TEXT';

export interface CreateTestCaseFormData {
  name: string;
  description?: string;
  folder: FolderWithFullPath | string;
  priority?: TestCasePriority;
  linkToRequirements?: string;
  executionEstimationTime?: number;
  manualScenarioType: ManualScenarioType;
  precondition?: string;
  preconditionAttachments?: Attachment[];
  steps?: TestStep[];
  instructions?: string;
  expectedResult?: string;
  textAttachments?: Attachment[];
  tags?: string[];
}

interface CreateTestCaseModalProps {
  data?: {
    folder?: FolderWithFullPath;
  };
}

export const CreateTestCaseModal = reduxForm<CreateTestCaseFormData, CreateTestCaseModalProps>({
  form: CREATE_TEST_CASE_FORM_NAME,
  validate: ({ name, folder, linkToRequirements }) => ({
    name: commonValidators.requiredField(name),
    folder: commonValidators.requiredField(folder),
    linkToRequirements: commonValidators.optionalUrl(linkToRequirements),
  }),
})(({
  data,
  dirty,
  initialize,
  handleSubmit,
}: InjectedFormProps<CreateTestCaseFormData, CreateTestCaseModalProps> &
  CreateTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isCreateTestCaseLoading, createTestCase } = useCreateTestCase();

  useEffect(() => {
    initialize({
      priority: 'unspecified',
      manualScenarioType: 'STEPS',
      executionEstimationTime: 5,
      folder: data?.folder,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isCreateTestCaseLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(createTestCase) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isCreateTestCaseLoading,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isCreateTestCaseLoading,
  };

  return (
    <Modal
      title={formatMessage(commonMessages.createTestCase)}
      okButton={okButton}
      className={cx('create-test-case-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('create-test-case-modal__content-wrapper')}>
        <form onSubmit={handleSubmit(createTestCase) as (event: FormEvent) => void}>
          <div className={cx('create-test-case-modal__container')}>
            <BasicInformation className={cx('create-test-case-modal__scrollable-section')} />
            <TestCaseDetails className={cx('create-test-case-modal__scrollable-section')} />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isCreateTestCaseLoading} />
      </div>
    </Modal>
  );
});
