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
import { Popover } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { EXECUTION_STATUSES } from 'controllers/manualLaunch';
import { Divider } from 'pages/common';

import { STATUS_CONFIG } from '../constants';
import { useExecutionStatusModal } from '../executionStatusConfirmModal';
import { messages } from './messages';
import { messages as commonExecutionMessages } from '../messages';

import styles from './executionStatusPopover.scss';

const cx = createClassnames(styles);

interface ExecutionStatusPopoverProps {
  executionId: number;
  currentStatus: EXECUTION_STATUSES;
  isOpened: boolean;
  setIsOpened: (isOpened: boolean) => void;
  children: ReactNode;
}

export const ExecutionStatusPopover: FC<ExecutionStatusPopoverProps> = ({
  executionId,
  currentStatus,
  isOpened,
  setIsOpened,
  children,
}) => {
  const { formatMessage } = useIntl();
  const { openModal } = useExecutionStatusModal();

  const availableStatuses = (Object.keys(STATUS_CONFIG) as EXECUTION_STATUSES[]).filter(
    (status) => status !== currentStatus,
  );

  const handleStatusChange = (newStatus: EXECUTION_STATUSES) => {
    openModal({
      executionId,
      status: newStatus,
    });
    setIsOpened(false);
  };

  const handleClearStatus = () => {
    // TODO: implement later
  };

  const renderPopoverContent = () => (
    <div className={cx('status-options')}>
      {availableStatuses.map((status) => {
        const config = STATUS_CONFIG[status];

        if (status === EXECUTION_STATUSES.TO_RUN) {
          return (
            <div key={currentStatus}>
              <Divider />
              <button
                type="button"
                className={cx('status-option')}
                onClick={() => handleClearStatus()}
              >
                {formatMessage(commonExecutionMessages.clearStatus)}
              </button>
            </div>
          );
        }

        return (
          <button
            key={status}
            type="button"
            className={cx('status-option')}
            onClick={() => handleStatusChange(status)}
          >
            {formatMessage(messages.markAs, { status: formatMessage(config.label) })}
          </button>
        );
      })}
    </div>
  );

  return (
    <Popover
      content={renderPopoverContent()}
      className={cx('popover')}
      placement="bottom"
      isOpened={isOpened}
      setIsOpened={setIsOpened}
      isCentered={false}
    >
      {children}
    </Popover>
  );
};
