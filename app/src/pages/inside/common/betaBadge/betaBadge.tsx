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

import { useIntl, defineMessages } from 'react-intl';
import { Tooltip } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import styles from './betaBadge.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  beta: {
    id: 'BetaBadge.beta',
    defaultMessage: 'Beta',
  },
  tooltip: {
    id: 'BetaBadge.tooltip',
    defaultMessage:
      'This feature is currently under development and testing. Some functionality may be unstable or limited.',
  },
});

interface BetaBadgeProps {
  className?: string;
}

export const BetaBadge = ({ className = '' }: BetaBadgeProps) => {
  const { formatMessage } = useIntl();

  return (
    <Tooltip
      placement="bottom-start"
      content={formatMessage(messages.tooltip)}
      wrapperClassName={cx('beta-badge-wrapper', className)}
      contentClassName={cx('tooltip-content')}
      dataAutomationId="betaBadge"
    >
      <span className={cx('beta-badge')}>{formatMessage(messages.beta)}</span>
    </Tooltip>
  );
};
