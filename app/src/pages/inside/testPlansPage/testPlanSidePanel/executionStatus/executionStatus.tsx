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

import { ExecutionStatusType } from './types';
import styles from './executionStatus.scss';

const cx = createClassnames(styles);

interface ExecutionItem {
  title: string;
  status: ExecutionStatusType;
}

interface ExecutionStatusProps {
  executions: ExecutionItem[];
}

const STATUS_COLOR_MAP: Record<ExecutionStatusType, string> = {
  [ExecutionStatusType.PASSED]: 'var(--rp-ui-base-test-execution-status-passed)',
  [ExecutionStatusType.FAILED]: 'var(--rp-ui-base-error)',
  [ExecutionStatusType.RUNNING]: 'var(--rp-ui-base-topaz-focused)',
  [ExecutionStatusType.SKIPPED]: 'var(--rp-ui-base-e-400)',
};

export const ExecutionStatus = memo(({ executions }: ExecutionStatusProps) => {
  if (isEmpty(executions)) {
    return null;
  }

  return (
    <div className={cx('execution-status-wrapper')}>
      {executions.map((execution) => (
        <div key={`${execution.title}-${execution.status}`} className={cx('execution-item')}>
          <span className={cx('execution-title')}>{execution.title}</span>
          <div
            className={cx('status-indicator')}
            style={{
              backgroundColor: STATUS_COLOR_MAP[execution.status] || 'var(--rp-ui-base-e-400)',
            }}
          />
        </div>
      ))}
    </div>
  );
});
