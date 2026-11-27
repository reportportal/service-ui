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

import type { ReactElement } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';

import { EXECUTION_STATUS_BADGE_DOTS, EXECUTION_STATUS_BADGE_LABELS } from './constants';
import { toExecutionStatus } from './utils';

import styles from './executionStatusBadge.scss';

const cx = createClassnames(styles);

interface ExecutionStatusBadgeProps {
  status: string;
  className?: string;
}

export const ExecutionStatusBadge = ({
  status,
  className,
}: ExecutionStatusBadgeProps): ReactElement | null => {
  const { formatMessage } = useIntl();
  const statusKey = toExecutionStatus(status);
  const label = EXECUTION_STATUS_BADGE_LABELS[statusKey];
  const dot = EXECUTION_STATUS_BADGE_DOTS[statusKey];

  if (!label) {
    return null;
  }

  return (
    <span
      className={cx('execution-status-badge', className)}
      data-automation-id="execution-status-badge"
    >
      {dot && <span className={cx('dot', `dot--${dot}`)} />}
      <span className={cx('label')}>{formatMessage(label)}</span>
    </span>
  );
};
