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

import { ComponentType, SVGProps } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ErrorIcon, RefreshIcon, StatusSuccessIcon, WarningIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { AiIterationStatus, IterationStatus } from 'types/aiFactory';

import styles from './iterationStatusBadge.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  running: {
    id: 'IterationStatusBadge.running',
    defaultMessage: 'Running',
  },
  inReview: {
    id: 'IterationStatusBadge.inReview',
    defaultMessage: 'In review',
  },
  completed: {
    id: 'IterationStatusBadge.completed',
    defaultMessage: 'Completed',
  },
  failed: {
    id: 'IterationStatusBadge.failed',
    defaultMessage: 'Failed',
  },
});

const VARIANT_BY_STATUS: Record<AiIterationStatus, string> = {
  [IterationStatus.RUNNING]: 'running',
  [IterationStatus.IN_REVIEW]: 'in-review',
  [IterationStatus.COMPLETED]: 'completed',
  [IterationStatus.FAILED]: 'failed',
};

const MESSAGE_BY_STATUS: Record<AiIterationStatus, { id: string; defaultMessage: string }> = {
  [IterationStatus.RUNNING]: messages.running,
  [IterationStatus.IN_REVIEW]: messages.inReview,
  [IterationStatus.COMPLETED]: messages.completed,
  [IterationStatus.FAILED]: messages.failed,
};

const ICON_BY_STATUS: Record<AiIterationStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
  [IterationStatus.RUNNING]: RefreshIcon,
  [IterationStatus.IN_REVIEW]: WarningIcon,
  [IterationStatus.COMPLETED]: StatusSuccessIcon,
  [IterationStatus.FAILED]: ErrorIcon,
};

export interface IterationStatusBadgeProps {
  status: AiIterationStatus;
  showIcon?: boolean;
}

export const IterationStatusBadge = ({ status, showIcon = false }: IterationStatusBadgeProps) => {
  const { formatMessage } = useIntl();
  const StatusIcon = ICON_BY_STATUS[status];

  return (
    <span
      className={cx('badge', VARIANT_BY_STATUS[status])}
      data-automation-id="iterationStatusBadge"
    >
      {showIcon && <StatusIcon className={cx('badge__icon')} aria-hidden="true" />}
      {formatMessage(MESSAGE_BY_STATUS[status])}
    </span>
  );
};
