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

import { memo } from 'react';

import { createClassnames } from 'common/utils';
import { isEmpty } from 'es-toolkit/compat';

import { Execution, ExecutionStatus } from 'pages/inside/testCaseLibraryPage/types';

import styles from './executionStatusCard.scss';

const cx = createClassnames(styles);

interface ExecutionStatusProps {
  executions: Execution[];
}

const STATUS_CLASS_MAP: Record<ExecutionStatus, string> = {
  [ExecutionStatus.PASSED]: 'passed',
  [ExecutionStatus.FAILED]: 'failed',
  [ExecutionStatus.STOPPED]: 'stopped',
  [ExecutionStatus.INTERRUPTED]: 'interrupted',
  [ExecutionStatus.CANCELLED]: 'cancelled',
  [ExecutionStatus.INFO]: 'info',
  [ExecutionStatus.WARN]: 'warn',
  [ExecutionStatus.TO_RUN]: 'to-run',
  [ExecutionStatus.SKIPPED]: 'skipped',
};

export const ExecutionStatusCard = memo(({ executions }: ExecutionStatusProps) => {
  if (isEmpty(executions)) {
    return null;
  }

  return (
    <div className={cx('execution-status-wrapper')}>
      {executions.map((execution) => (
        <div key={`${execution.launch.name}-${execution.status}`} className={cx('execution-item')}>
          <span className={cx('execution-title')}>{execution.launch.name}</span>
          <div
            className={cx(
              'status-indicator',
              `status-indicator--${STATUS_CLASS_MAP[execution.status] || 'default'}`,
            )}
          />
        </div>
      ))}
    </div>
  );
});
