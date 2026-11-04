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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useModalButtons } from 'hooks/useModalButtons';
import { MANUAL_LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';

import { useChangeRetentionPolicy } from './useChangeRetentionPolicy';
import { messages } from './messages';
import { RetentionPolicyModalData } from './types';

interface RetentionPolicyModalProps {
  data: RetentionPolicyModalData;
  onSuccess?: VoidFn;
}

export const RetentionPolicyModal = ({ data, onSuccess = noop }: RetentionPolicyModalProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { launchId, policy } = data;
  const isMark = policy === RETENTION_POLICY.IMPORTANT;

  const { isLoading, changeRetentionPolicy } = useChangeRetentionPolicy({
    launchId,
    policy,
    onSuccess,
  });

  const handleSubmit = useCallback(() => {
    trackEvent(
      isMark
        ? MANUAL_LAUNCHES_PAGE_EVENTS.CONFIRM_MARK_AS_IMPORTANT
        : MANUAL_LAUNCHES_PAGE_EVENTS.CONFIRM_UNMARK_AS_IMPORTANT,
    );
    changeRetentionPolicy().catch(noop);
  }, [isMark, trackEvent, changeRetentionPolicy]);

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(isMark ? messages.markAsImportantTitle : messages.unmark)}
      </LoadingSubmitButton>
    ),
    isLoading,
    variant: isMark ? 'primary' : 'danger',
    onSubmit: handleSubmit,
  });

  return (
    <Modal
      title={formatMessage(isMark ? messages.markAsImportantTitle : messages.unmarkAsImportantTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <p>
        {formatMessage(
          isMark ? messages.markAsImportantDescription : messages.unmarkAsImportantDescription,
        )}
      </p>
    </Modal>
  );
};
