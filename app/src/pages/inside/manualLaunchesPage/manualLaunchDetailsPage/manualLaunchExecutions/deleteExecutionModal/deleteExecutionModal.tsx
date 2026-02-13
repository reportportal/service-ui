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

import { FC, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { UseModalData } from 'common/hooks';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useModalButtons } from 'pages/inside/testCaseLibraryPage/hooks/useModalButtons';

import { useDeleteExecution } from './useDeleteExecution';
import { DELETE_EXECUTION_MODAL_KEY } from './constants';
import { DeleteExecutionModalData } from './types';
import { messages } from './messages';

import styles from './deleteExecutionModal.scss';

const cx = createClassnames(styles);

const BoldText: FC<{ children: ReactNode }> = ({ children }) => (
  <span className={cx('delete-execution-modal__text--bold')}>{children}</span>
);

const boldFormatter = (chunks: ReactNode) => <BoldText>{chunks}</BoldText>;

const DeleteExecutionModalComponent = ({
  data: { execution, launchId },
}: UseModalData<DeleteExecutionModalData>) => {
  const { formatMessage } = useIntl();
  const { deleteExecution, isLoading } = useDeleteExecution();

  const onSubmit = () => deleteExecution(launchId, execution.id);

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    variant: 'danger',
    onSubmit: onSubmit as () => void,
  });

  return (
    <Modal
      title={formatMessage(messages.deleteExecutionTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      {formatMessage(messages.deleteExecutionText, {
        b: boldFormatter,
        name: execution.testCaseName,
      })}
    </Modal>
  );
};

export default withModal(DELETE_EXECUTION_MODAL_KEY)(DeleteExecutionModalComponent);
