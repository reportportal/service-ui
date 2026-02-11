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

import { MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { UseModalData } from 'common/hooks';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { useDeleteExecution } from './useDeleteExecution';
import { DELETE_EXECUTION_MODAL_KEY } from './constants';
import { DeleteExecutionModalData } from './types';
import { messages } from './messages';

import styles from './deleteExecutionModal.scss';

const cx = createClassnames(styles);

const DeleteExecutionModalComponent = ({
  data: { execution, launchId },
}: UseModalData<DeleteExecutionModalData>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { deleteExecution, isLoading } = useDeleteExecution();

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = () => deleteExecution(launchId, execution.id);

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
      </LoadingSubmitButton>
    ),
    onClick: onSubmit as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isLoading,
    variant: 'danger' as const,
    'data-automation-id': 'submitButton',
  };
  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.deleteExecutionTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      {formatMessage(messages.deleteExecutionText, {
        b: (data) => <span className={cx('delete-execution-modal__text--bold')}>{data}</span>,
        name: execution.testCaseName,
      })}
    </Modal>
  );
};

export default withModal(DELETE_EXECUTION_MODAL_KEY)(DeleteExecutionModalComponent);
