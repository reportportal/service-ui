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

import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useVirtualizer } from '@tanstack/react-virtual';

import { createClassnames } from 'common/utils';
import { StageTraceEvent } from 'controllers/aiFactory/stageTrace';
import { TraceEvent } from 'pages/inside/aiFactory/stageTracePage/stageTraceEvent';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceTimelineProps {
  events: StageTraceEvent[];
}
const cx = createClassnames(styles);

export const StageTraceTimeline = ({ events }: StageTraceTimelineProps) => {
  const { formatMessage } = useIntl();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const isVirtual = events.length > 100;
  const virtualizer = useVirtualizer({
    count: isVirtual ? events.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });
  const toggleEvent = (seq: number) =>
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(seq)) next.delete(seq);
      else next.add(seq);
      return next;
    });
  const renderEvent = (event: StageTraceEvent) => (
    <TraceEvent
      key={event.seq}
      event={event}
      expanded={expanded.has(event.seq)}
      onToggle={() => toggleEvent(event.seq)}
    />
  );
  return (
    <section className={cx('timeline')} aria-label={formatMessage(messages.timeline)}>
      <h2>{formatMessage(messages.eventCount, { count: events.length })}</h2>
      <div ref={scrollRef} className={cx('timeline__scroll')}>
        {isVirtual ? (
          <div className={cx('timeline__virtual')} style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => (
              <div
                key={events[row.index].seq}
                data-index={row.index}
                ref={virtualizer.measureElement}
                className={cx('timeline__row')}
                style={{ transform: `translateY(${row.start}px)` }}
              >
                {renderEvent(events[row.index])}
              </div>
            ))}
          </div>
        ) : (
          events.map(renderEvent)
        )}
      </div>
    </section>
  );
};
