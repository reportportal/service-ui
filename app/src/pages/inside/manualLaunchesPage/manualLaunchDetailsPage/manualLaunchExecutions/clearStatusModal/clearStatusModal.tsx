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
import { asyncNoop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';

import { useModalButtons } from 'pages/inside/testCaseLibraryPage/hooks/useModalButtons';
import { withModal } from 'controllers/modal';

import { useClearStatus } from './useClearStatus';
import { ClearStatusModalData } from './types';
import { messages } from '../messages';

const ClearStatusModal = ({ data }: { data: ClearStatusModalData }) => {
  const { formatMessage } = useIntl();
  const { clearStatus, isLoading } = useClearStatus();

  const handleClearStatus = useCallback(() => {
    clearStatus(data).catch(asyncNoop);
  }, [clearStatus, data]);

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(messages.clearStatus),
    isLoading,
    variant: 'primary',
    onSubmit: handleClearStatus,
  });

  return (
    <Modal
      title={formatMessage(messages.clearStatus)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <div>
        <p>{formatMessage(messages.clearStatusDescription)}</p>
      </div>
    </Modal>
  );
};

export default withModal('clearStatusModal')(ClearStatusModal);
