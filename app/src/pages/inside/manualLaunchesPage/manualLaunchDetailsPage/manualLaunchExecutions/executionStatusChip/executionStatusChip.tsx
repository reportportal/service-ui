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

import { memo } from 'react';
import { createClassnames } from 'common/utils';
import Parser from 'html-react-parser';

import { ExecutionStatus, ExecutionStatusChipProps } from './types';
import { STATUS_CLASS_MAP, STATUS_ICON_MAP } from './constants';
import { getTemporaryStatus } from './utils';
import styles from './executionStatusChip.scss';

const cx = createClassnames(styles);

export { ExecutionStatus } from './types';

export const ExecutionStatusChip = memo(({ status, startedAt }: ExecutionStatusChipProps) => {
  const statusKey = getTemporaryStatus(status, startedAt);
  const statusClass = STATUS_CLASS_MAP[statusKey] || STATUS_CLASS_MAP[ExecutionStatus.TO_RUN];
  const statusIcon = STATUS_ICON_MAP[statusKey] || STATUS_ICON_MAP[ExecutionStatus.TO_RUN];

  return (
    <div className={cx('execution-status-chip', statusClass)}>
      <div className={cx('status-icon')}>{Parser(statusIcon)}</div>
    </div>
  );
});
