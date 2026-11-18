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

import type { NativeFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';
import { messages } from './messages';

interface LiveFixRoundDetailsProps {
  round: NativeFixRound;
}

const STATUS_MESSAGES = {
  PENDING: messages.pending,
  FIXED: messages.fixed,
  FIXED_GRADE_FAILED: messages.gradeFailed,
  FAILED: messages.failed,
};

export const LiveFixRoundDetails = ({ round }: LiveFixRoundDetailsProps) => {
  const { formatMessage, formatDate, formatTime } = useIntl();
  const date = (value: string) => `${formatDate(value)} ${formatTime(value)}`;
  return (
    <>
      <strong>{formatMessage(messages.round, { number: round.roundNumber })}</strong>
      <span>{formatMessage(STATUS_MESSAGES[round.status])}</span>
      {round.requestedAt && (
        <span>{formatMessage(messages.requested, { date: date(round.requestedAt) })}</span>
      )}
      {round.finishedAt && (
        <span>{formatMessage(messages.finished, { date: date(round.finishedAt) })}</span>
      )}
      {round.failureReason && (
        <p>{formatMessage(messages.failure, { reason: round.failureReason })}</p>
      )}
      {!round.resultIterationId && <p>{formatMessage(messages.noResult)}</p>}
    </>
  );
};
