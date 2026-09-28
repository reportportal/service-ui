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

import { defineMessages, useIntl } from 'react-intl';
import { createClassnames } from 'common/utils';
import { Lifecycle } from 'types/aiFactory';
import styles from './lifecycleBadge.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  draft: {
    id: 'LifecycleBadge.draft',
    defaultMessage: 'Draft',
  },
  ready: {
    id: 'LifecycleBadge.ready',
    defaultMessage: 'Ready',
  },
});

export interface LifecycleBadgeProps {
  lifecycle: Lifecycle;
}

export const LifecycleBadge = ({ lifecycle }: LifecycleBadgeProps) => {
  const { formatMessage } = useIntl();
  const isReady = lifecycle === Lifecycle.READY;

  return (
    <span className={cx('badge', isReady ? 'ready' : 'draft')} data-automation-id="lifecycleBadge">
      {formatMessage(isReady ? messages.ready : messages.draft)}
    </span>
  );
};
