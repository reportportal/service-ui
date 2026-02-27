/*
 * Copyright 2026 EPAM Systems
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

import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { useModalActions } from '../hooks/useModalActions';
import { ScenarioFields } from './scenarioFields';
import { EditScenarioModalContentProps } from './types';

import styles from './editScenarioModal.scss';

const cx = createClassnames(styles);

export const EditScenarioModalContent = ({
  title,
  submitButtonText,
  isLoading,
  onSubmitHandler,
  formName,
  pristine,
  handleSubmit,
}: EditScenarioModalContentProps) => {
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
      className={cx('scenario-edit-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={pristine}
      onClose={handleClose}
    >
      <div className={cx('scenario-edit-modal__wrapper')}>
        <form onSubmit={handleFormSubmit}>
          <div className={cx('scenario-edit-modal__form-container')}>
            <ScenarioFields formName={formName} />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};
