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
import { useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { LiveFixTraceAction } from 'pages/inside/aiFactory/iterationDetailsPage/stageTraceAction/liveFixTraceAction';
import type { NativeFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';
import { LiveFixRoundDetails } from './liveFixRoundDetails';
import { useLiveFixRoundHistory } from './useLiveFixRoundHistory';
import { messages } from './messages';
import styles from './liveFixRoundHistory.scss';

interface LiveFixRoundHistoryProps {
  testCaseId: number;
  resourceKey: object;
  currentRound?: NativeFixRound;
}

const cx = createClassnames(styles);

export const LiveFixRoundHistory = ({
  testCaseId,
  resourceKey,
  currentRound,
}: LiveFixRoundHistoryProps) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);
  const history = useLiveFixRoundHistory(projectKey, testCaseId, resourceKey, currentRound);
  return (
    <section className={cx('fix-round-history')} data-automation-id="live-fix-round-history">
      <h3>{formatMessage(messages.title)}</h3>
      <Button
        variant="text"
        disabled={history.loading}
        onClick={history.load}
        data-automation-id="load-fix-round-history"
      >
        {formatMessage(history.enabled ? messages.refresh : messages.load)}
      </Button>
      {history.loading && <output aria-live="polite">{formatMessage(messages.loading)}</output>}
      {history.error && <p role="alert">{formatMessage(messages.unavailable)}</p>}
      {history.rounds?.length === 0 && <p>{formatMessage(messages.empty)}</p>}
      <ul className={cx('fix-round-history__list')}>
        {history.rounds?.map((round) => (
          <li key={`${round.testCaseId}:${round.id}`} className={cx('fix-round-history__round')}>
            <LiveFixRoundDetails round={round} />
            {round.resultIterationId && (
              <LiveFixTraceAction
                projectKey={projectKey}
                resourceKey={history.resource}
                previousIterationId={round.previousIterationId}
                resultIterationId={round.resultIterationId}
                roundNumber={round.roundNumber}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
