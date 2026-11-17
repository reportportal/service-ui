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
import { Dropdown } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceAttemptSwitcherProps {
  attempts?: StageTraceAttempt[];
  selectedAttempt?: number;
  onChange: (value: string) => void;
}
const cx = createClassnames(styles);
const getAttemptLabel = (
  attempt: StageTraceAttempt,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) =>
  [
    formatMessage(messages.attempt, { number: attempt.attempt }),
    attempt.current ? formatMessage(messages.current) : undefined,
    attempt.stageStatus,
    formatMessage(attempt.traceStatus === 'REPORTED' ? messages.reported : messages.notReported),
  ]
    .filter(Boolean)
    .join(' · ');

export const StageTraceAttemptSwitcher = ({
  attempts = [],
  selectedAttempt,
  onChange,
}: StageTraceAttemptSwitcherProps) => {
  const { formatMessage } = useIntl();
  if (attempts.length < 2) return null;
  const options = attempts.map((attempt) => ({
    value: String(attempt.attempt),
    label: getAttemptLabel(attempt, formatMessage),
  }));
  return (
    <Dropdown
      className={cx('attempt-switcher')}
      label={formatMessage(messages.attempts)}
      options={options}
      value={selectedAttempt === undefined ? '' : String(selectedAttempt)}
      onChange={(value) => {
        if (typeof value === 'string' && options.some((option) => option.value === value)) {
          onChange(value);
        }
      }}
      data-automation-id="stageTraceAttemptSwitcher"
    />
  );
};
