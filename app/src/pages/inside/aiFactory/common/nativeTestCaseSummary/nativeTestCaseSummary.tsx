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

import { createClassnames, formatCost } from 'common/utils';
import type { NativeTestCaseSummary as NativeSummary } from 'common/utils/nativeTestCase';
import { AiChip, LifecycleBadge, ScoreChip } from 'pages/inside/aiFactory/common';
import { messages } from 'pages/inside/aiFactory/common/nativeTestCaseSummary/messages';
import styles from 'pages/inside/aiFactory/common/nativeTestCaseSummary/nativeTestCaseSummary.scss';

interface NativeTestCaseSummaryProps {
  summary: NativeSummary;
  showIdentity?: boolean;
  showMetrics?: boolean;
}

const cx = createClassnames(styles);

export const NativeTestCaseSummary = ({
  summary,
  showIdentity = false,
  showMetrics = true,
}: NativeTestCaseSummaryProps) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('native-summary')} data-automation-id="native-test-case-summary">
      {showIdentity && summary.isAi && <AiChip tooltip={formatMessage(messages.origin)} />}
      {showIdentity && summary.status && <LifecycleBadge lifecycle={summary.status} />}
      {showMetrics && summary.score !== undefined && (
        <ScoreChip score={summary.score} obsolete={summary.isObsolete} />
      )}
      {showMetrics && summary.model && (
        <span>{formatMessage(messages.model, { model: summary.model })}</span>
      )}
      {showMetrics && summary.costUsd !== undefined && (
        <span>{formatMessage(messages.cost, { cost: formatCost(summary.costUsd) })}</span>
      )}
    </div>
  );
};
