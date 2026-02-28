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

import { FormEvent } from 'react';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { ModalCommonProps } from '../../editScenarioModal/types';
import { CreateTestCaseFormData } from '../../types';
import { useModalActions } from '../../hooks/useModalActions';
import { BasicInformation } from '../basicInformation';
import { TestCaseDetails } from '../testCaseDetails';

import styles from '../testCaseModal.scss';

const cx = createClassnames(styles);

interface TestCaseModalProps extends ModalCommonProps {
  formName: string;
  pristine?: boolean;
  handleSubmit: (
    handler: (formData: CreateTestCaseFormData) => void | Promise<void>,
  ) => (event: FormEvent) => void;
  hideFolderField?: boolean;
  isTemplateFieldDisabled?: boolean;
}

export const TestCaseModal = ({
  title,
  submitButtonText,
  isLoading,
  onSubmitHandler,
  formName,
  pristine,
  handleSubmit,
  hideFolderField = false,
  isTemplateFieldDisabled = false,
}: TestCaseModalProps) => {
  const { okButton, cancelButton, handleClose, handleFormSubmit } = useModalActions({
    submitButtonText,
    isLoading,
    pristine,
    handleSubmit,
    onSubmitHandler,
  });

  return (
    <Modal
      title={title}
      okButton={okButton}
      className={cx('test-case-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={pristine}
      onClose={handleClose}
    >
      <div className={cx('test-case-modal__content-wrapper')}>
        <form onSubmit={handleFormSubmit}>
          <div className={cx('test-case-modal__container')}>
            <BasicInformation
              className={cx('test-case-modal__scrollable-section')}
              hideFolderField={hideFolderField}
              formName={formName}
            />
            <TestCaseDetails
              className={cx('test-case-modal__scrollable-section')}
              formName={formName}
              isTemplateFieldDisabled={isTemplateFieldDisabled}
            />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};
