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
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { CreateTestCaseFormData } from '../../types';
import { BasicInformation } from '../basicInformation';
import { TestCaseDetails } from '../testCaseDetails';

import styles from '../testCaseModal.scss';

const cx = createClassnames(styles);

interface TestCaseModalProps {
  title: string;
  submitButtonText: string;
  isLoading: boolean;
  onSubmitHandler: (formData: CreateTestCaseFormData) => void | Promise<void>;
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
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const okButton = useMemo(
    () => ({
      children: <LoadingSubmitButton isLoading={isLoading}>{submitButtonText}</LoadingSubmitButton>,
      onClick: handleSubmit(onSubmitHandler) as (event: MouseEvent<HTMLButtonElement>) => void,
      disabled: isLoading || pristine,
    }),
    [isLoading, pristine, submitButtonText, handleSubmit, onSubmitHandler],
  );

  const cancelButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isLoading,
    }),
    [formatMessage, isLoading],
  );

  const handleClose = useCallback(() => {
    dispatch(hideModalAction());
  }, [dispatch]);

  const handleFormSubmit = useMemo(
    () => handleSubmit(onSubmitHandler) as (event: FormEvent) => void,
    [handleSubmit, onSubmitHandler],
  );

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
