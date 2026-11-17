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

import { ReactNode, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useModalButtons } from 'hooks/useModalButtons';
import { MANUAL_LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';

import { useDeleteManualLaunches } from './useDeleteManualLaunches';
import { messages } from './messages';
import { DeleteManualLaunchModalData } from './types';

import styles from './deleteManualLaunchModal.scss';

const cx = createClassnames(styles);

export const DELETE_MANUAL_LAUNCH_MODAL_KEY = 'deleteManualLaunchModalKey';

interface DeleteManualLaunchModalProps {
  data: DeleteManualLaunchModalData;
  onSuccess?: VoidFn;
}

export const DeleteManualLaunchModal = ({
  data,
  onSuccess = noop,
}: DeleteManualLaunchModalProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const isBatch = data.type === 'batch';

  const { isLoading, deleteLaunches } = useDeleteManualLaunches({ onSuccess, data });

  const handleDelete = useCallback(() => {
    if (data.type === 'batch' && data.launchIds.length > 1) {
      trackEvent(MANUAL_LAUNCHES_PAGE_EVENTS.confirmBulkDeleteLaunches(data.launchIds.length));
    } else {
      trackEvent(MANUAL_LAUNCHES_PAGE_EVENTS.CONFIRM_DELETE_LAUNCH);
    }
    deleteLaunches(data).catch(noop);
  }, [deleteLaunches, data, trackEvent]);

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    variant: 'danger',
    onSubmit: handleDelete,
  });

  const boldFormatter = (chunks: ReactNode) => <strong>{chunks}</strong>; // NOSONAR

  const description = isBatch ? messages.batchDeleteDescription : messages.deleteConfirmation;
  const descriptionParams = isBatch
    ? {
        count: data?.launchIds.length,
        b: boldFormatter,
      }
    : {
        launchName: data.name,
        b: boldFormatter,
      };

  return (
    <Modal
      title={formatMessage(isBatch ? messages.batchDeleteTitle : messages.deleteLaunchTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
      className={cx('delete-manual-launch-modal')}
    >
      <>
        <p>{formatMessage(description, descriptionParams)}</p>
        <p>{formatMessage(messages.deletePermanentWarning)}</p>
      </>
    </Modal>
  );
};
