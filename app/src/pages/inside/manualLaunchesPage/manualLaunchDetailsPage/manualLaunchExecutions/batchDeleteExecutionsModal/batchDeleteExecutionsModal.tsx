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

import { useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal, hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { useBatchDeleteExecutions } from './useBatchDeleteExecutions';
import { BATCH_DELETE_EXECUTIONS_MODAL_KEY } from './constants';
import { messages } from './messages';

import styles from './batchDeleteExecutionsModal.scss';

const cx = createClassnames(styles);

export interface BatchDeleteExecutionsModalData {
  selectedExecutionIds: number[];
  launchId: string | number;
  onClearSelection?: () => void;
}

type BatchDeleteExecutionsModalProps = UseModalData<BatchDeleteExecutionsModalData>;

const BatchDeleteExecutionsModal = ({
  data: {
    selectedExecutionIds = [],
    launchId,
    onClearSelection = noop,
  } = {} as BatchDeleteExecutionsModalData,
}: BatchDeleteExecutionsModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isLoading, batchDelete } = useBatchDeleteExecutions({
    onSuccess: () => {
      dispatch(hideModalAction());
      onClearSelection();
    },
    launchId,
  });

  const hideModal = () => dispatch(hideModalAction());

  const handleDelete = useCallback(() => {
    batchDelete(selectedExecutionIds).catch(noop);
  }, [batchDelete, selectedExecutionIds]);

  const okButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      disabled: isLoading,
      variant: 'danger' as const,
      onClick: handleDelete,
    }),
    [formatMessage, isLoading, handleDelete],
  );

  const cancelButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isLoading,
    }),
    [formatMessage, isLoading],
  );

  return (
    <Modal
      title={formatMessage(messages.batchDeleteExecutionsTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <div>
        {formatMessage(messages.batchDeleteDescription, {
          count: selectedExecutionIds.length,
          b: (text) => <span className={cx('batch-delete-modal__text--bold')}>{text}</span>,
        })}
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};

export default withModal(BATCH_DELETE_EXECUTIONS_MODAL_KEY)(BatchDeleteExecutionsModal);
