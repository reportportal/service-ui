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

import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { EXECUTION_STATUSES } from 'controllers/manualLaunch';

import { STATUS_BUTTONS } from 'pages/inside/manualLaunchesPage';
import type { ExecutionStatusButtonsProps, StatusButtonConfig } from '../types';
import { useExecutionStatusModal } from '../executionStatusConfirmModal';

import styles from './executionStatusButtons.scss';

const cx = createClassnames(styles);

export const ExecutionStatusButtons = ({ executionId }: ExecutionStatusButtonsProps) => {
  const { formatMessage } = useIntl();
  const { openModal } = useExecutionStatusModal();

  const handleStatusClick = (status: EXECUTION_STATUSES) => {
    openModal({
      executionId,
      status,
    });
  };

  return (
    <div className={cx('execution-status-buttons')}>
      {(STATUS_BUTTONS as StatusButtonConfig[]).map(({ status, message }) => (
        <button
          key={status}
          type="button"
          className={cx('status-button', `status-button--${status.toLowerCase()}`)}
          onClick={() => handleStatusClick(status)}
        >
          {formatMessage(message)}
        </button>
      ))}
    </div>
  );
};
