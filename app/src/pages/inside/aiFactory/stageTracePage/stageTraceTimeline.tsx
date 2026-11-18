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

import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useVirtualizer } from '@tanstack/react-virtual';

import { createClassnames } from 'common/utils';
import { StageTraceEvent } from 'controllers/aiFactory/stageTrace';
import type { ReducedPipelineSection } from 'controllers/aiFactory/pipelines/liveAdapters';
import { TraceEvent } from 'pages/inside/aiFactory/stageTracePage/stageTraceEvent';
import { StageTraceUnitSelector } from 'pages/inside/aiFactory/stageTracePage/stageTraceUnitSelector';
import {
  filterStageTraceEvents,
  getStageTraceEventUnit,
  getStageTraceUnitFilter,
  getStageTraceUnits,
  type StageTraceUnitFilter,
} from 'pages/inside/aiFactory/stageTracePage/stageTraceUnits';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceTimelineProps {
  events: StageTraceEvent[];
  sections?: ReducedPipelineSection[];
}
const cx = createClassnames(styles);

export const StageTraceTimeline = ({ events, sections }: StageTraceTimelineProps) => {
  const { formatMessage } = useIntl();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [filter, setFilter] = useState<StageTraceUnitFilter>('all');
  const units = useMemo(() => getStageTraceUnits(sections), [sections]);
  const selectedFilter = getStageTraceUnitFilter(filter, units);
  const filteredEvents = useMemo(
    () => filterStageTraceEvents(events, units, selectedFilter),
    [events, units, selectedFilter],
  );
  const isVirtual = filteredEvents.length > 100;
  const virtualizer = useVirtualizer({
    count: isVirtual ? filteredEvents.length : 0,
    getItemKey: (index) => filteredEvents[index].seq,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });
  useEffect(() => {
    setFilter(selectedFilter);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedFilter]);
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
      groupLabel={
        selectedFilter === 'all'
          ? (units.get(getStageTraceEventUnit(event, units)) ?? formatMessage(messages.stageEvents))
          : undefined
      }
      expanded={expanded.has(event.seq)}
      onToggle={() => toggleEvent(event.seq)}
    />
  );
  return (
    <section className={cx('timeline')} aria-label={formatMessage(messages.timeline)}>
      <h2>{formatMessage(messages.eventCount, { count: filteredEvents.length })}</h2>
      <StageTraceUnitSelector units={units} value={selectedFilter} onChange={setFilter} />
      {filteredEvents.length === 0 && <p>{formatMessage(messages.noUnitEvents)}</p>}
      <div ref={scrollRef} className={cx('timeline__scroll')}>
        {isVirtual ? (
          <div className={cx('timeline__virtual')} style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => (
              <div
                key={filteredEvents[row.index].seq}
                data-index={row.index}
                ref={virtualizer.measureElement}
                className={cx('timeline__row')}
                style={{ transform: `translateY(${row.start}px)` }}
              >
                {renderEvent(filteredEvents[row.index])}
              </div>
            ))}
          </div>
        ) : (
          filteredEvents.map(renderEvent)
        )}
      </div>
    </section>
  );
};
