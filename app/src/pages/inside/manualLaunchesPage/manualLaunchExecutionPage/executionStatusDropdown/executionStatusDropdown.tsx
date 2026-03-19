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

import { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';

import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import { createClassnames } from 'common/utils';
import { EXECUTION_STATUSES } from 'controllers/manualLaunch';
import { ExecutionStatusPopover, STATUS_CONFIG } from 'pages/inside/manualLaunchesPage';

import type { ExecutionStatusData, StatusConfig } from '../types';
import { messages } from './messages';

import styles from './executionStatusDropdown.scss';

const cx = createClassnames(styles);

export const ExecutionStatusDropdown: FC<ExecutionStatusData> = ({ executionId, status }) => {
  const { formatMessage } = useIntl();
  const [isOpened, setIsOpened] = useState(false);

  const currentConfig = (STATUS_CONFIG as Record<EXECUTION_STATUSES, StatusConfig>)[status];

  if (!currentConfig) {
    return null;
  }

  return (
    <div className={cx('execution-status-dropdown')}>
      <span className={cx('label')}>{formatMessage(messages.currentExecutionStatus)}</span>
      <ExecutionStatusPopover
        executionId={executionId}
        currentStatus={status}
        isOpened={isOpened}
        setIsOpened={setIsOpened}
      >
        <button
          type="button"
          className={cx('status-button', {
            open: isOpened,
          })}
        >
          <span className={cx('status-indicator', `status-indicator--${status.toLowerCase()}`)} />
          {formatMessage(currentConfig.label)}
          <span className={cx('arrow-icon', { rotated: isOpened })}>
            {Parser(ArrowDownIcon as unknown as string)}
          </span>
        </button>
      </ExecutionStatusPopover>
    </div>
  );
};
