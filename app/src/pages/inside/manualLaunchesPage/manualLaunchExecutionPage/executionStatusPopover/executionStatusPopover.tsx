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

import { STATUS_CONFIG } from '../constants';
import type { ExecutionStatusType } from '../types';
import { useExecutionStatusModal } from '../executionStatusConfirmModal';
import { messages } from './messages';

import styles from './executionStatusPopover.scss';

const cx = createClassnames(styles);

interface ExecutionStatusPopoverProps {
  executionId: number;
  currentStatus: string;
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

  const statusKey = currentStatus.toLowerCase() as ExecutionStatusType;
  const availableStatuses = (Object.keys(STATUS_CONFIG) as ExecutionStatusType[]).filter(
    (status) => status !== statusKey,
  );

  const handleStatusChange = (newStatus: string) => {
    openModal({
      executionId,
      status: newStatus as ExecutionStatusType,
    });
    setIsOpened(false);
  };

  const renderPopoverContent = () => (
    <div className={cx('status-options')}>
      {availableStatuses.map((status) => {
        const config = STATUS_CONFIG[status];

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
