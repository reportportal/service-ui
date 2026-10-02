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

import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import type { TestCaseAiExtension } from 'types/aiFactory';

import { messages } from './messages';
import styles from './reviewFlags.scss';

const cx = createClassnames(styles);

export interface ReviewFlagsProps {
  review?: TestCaseAiExtension['review'];
}

export const ReviewFlags = ({ review }: ReviewFlagsProps) => {
  const { formatMessage } = useIntl();
  const unsentCommentsCount = review?.unsentCommentsCount ?? 0;
  const hasUnsentComments = unsentCommentsCount > 0;
  const isAgentFixing = review?.fixRound?.status === 'RUNNING';

  if (!hasUnsentComments && !isAgentFixing) {
    return null;
  }

  return (
    <div className={cx('review-flags')}>
      {hasUnsentComments && (
        <span className={cx('review-flags__comments')}>
          {formatMessage(messages.unsentComments, { count: unsentCommentsCount })}
        </span>
      )}
      {isAgentFixing && (
        <span className={cx('review-flags__fixing')}>{formatMessage(messages.agentFixing)}</span>
      )}
    </div>
  );
};
