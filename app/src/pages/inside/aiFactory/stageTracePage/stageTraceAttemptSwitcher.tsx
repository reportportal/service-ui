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
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceAttemptSwitcherProps {
  attempts?: StageTraceAttempt[];
  selectedAttempt?: number;
  onChange: (value: string) => void;
}
const cx = createClassnames(styles);
export const StageTraceAttemptSwitcher = ({
  attempts = [],
  selectedAttempt,
  onChange,
}: StageTraceAttemptSwitcherProps) => {
  const { formatMessage } = useIntl();
  if (attempts.length < 2) return null;
  return (
    <label className={cx('attempt-switcher')}>
      {formatMessage(messages.attempts)}
      <select
        value={selectedAttempt ?? ''}
        onChange={(event) => onChange(event.target.value)}
        data-automation-id="stageTraceAttemptSwitcher"
      >
        {attempts.map((item) => (
          <option key={item.attempt} value={item.attempt}>
            {formatMessage(messages.attempt, { number: item.attempt })}
            {item.current ? ` · ${formatMessage(messages.current)}` : ''}
            {item.stageStatus ? ` · ${item.stageStatus}` : ''}
            {` · ${formatMessage(item.traceStatus === 'REPORTED' ? messages.reported : messages.notReported)}`}
          </option>
        ))}
      </select>
    </label>
  );
};
