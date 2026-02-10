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

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { useBatchDeleteManualLaunches } from './useBatchDeleteManualLaunches';
import { messages } from './messages';

export const BATCH_DELETE_MANUAL_LAUNCHES_MODAL_KEY = 'batchDeleteManualLaunchesModalKey';

export interface BatchDeleteManualLaunchesModalData {
  launchIds: number[];
  onClearSelection?: () => void;
}

interface BatchDeleteManualLaunchesModalProps {
  data: BatchDeleteManualLaunchesModalData;
}

export const BatchDeleteManualLaunchesModal = ({
  data: { launchIds = [], onClearSelection = noop },
}: BatchDeleteManualLaunchesModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const { isLoading, batchDelete } = useBatchDeleteManualLaunches({
    onSuccess: () => {
      dispatch(hideModalAction());
      onClearSelection();
    },
  });

  const handleCancel = () => {
    dispatch(hideModalAction());
  };

  const handleDelete = useCallback(() => {
    batchDelete(launchIds).catch(noop);
  }, [batchDelete, launchIds]);

  const okButton = useMemo(
    () => ({
      children: (
        <LoadingSubmitButton isLoading={isLoading}>
          {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
        </LoadingSubmitButton>
      ),
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
      title={formatMessage(messages.batchDeleteTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={handleCancel}
    >
      <div>
        {formatMessage(messages.batchDeleteDescription, {
          count: launchIds.length,
        })}
      </div>
    </Modal>
  );
};
