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
import type { StageTraceEvent } from 'controllers/aiFactory/stageTrace';
import { StageTraceEventData } from 'pages/inside/aiFactory/stageTracePage/stageTraceEventData';
import { StageTraceText } from 'pages/inside/aiFactory/stageTracePage/stageTraceText';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface TraceEventProps {
  event: StageTraceEvent;
  expanded: boolean;
  onToggle: () => void;
}
const cx = createClassnames(styles);
export const TraceEvent = ({ event, expanded, onToggle }: TraceEventProps) => {
  const { formatMessage } = useIntl();
  return (
    <article className={cx('event')}>
      <button
        type="button"
        className={cx('event__toggle')}
        aria-expanded={expanded}
        aria-controls={expanded ? `trace-event-${event.seq}` : undefined}
        onClick={onToggle}
        data-automation-id={`traceEvent-${event.seq}`}
      >
        <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
        <strong>{event.type}</strong>
        <span>{event.title}</span>
        {event.offsetMs !== undefined && (
          <span className={cx('event__time')}>+{event.offsetMs} ms</span>
        )}
        {event.durationMs !== undefined && <span>{event.durationMs} ms</span>}
      </button>
      {expanded && (
        <div id={`trace-event-${event.seq}`} className={cx('event__body')}>
          {event.target !== undefined && (
            <p>
              <strong>{formatMessage(messages.eventTarget)}: </strong>
              {event.target}
            </p>
          )}
          {event.text !== undefined && (
            <StageTraceText value={event.text} label={formatMessage(messages.eventText)} />
          )}
          <StageTraceEventData event={event} />
        </div>
      )}
    </article>
  );
};
