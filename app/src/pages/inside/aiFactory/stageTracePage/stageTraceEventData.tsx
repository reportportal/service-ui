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

import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import type { StageTraceEvent } from 'controllers/aiFactory/stageTrace';
import { StageTraceGraders } from 'pages/inside/aiFactory/stageTracePage/stageTraceGraders';
import { StageTraceText } from 'pages/inside/aiFactory/stageTracePage/stageTraceText';
import { readTraceGraderData } from 'pages/inside/aiFactory/stageTracePage/stageTraceGraderUtils';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceEventDataProps {
  event: StageTraceEvent;
}
interface TraceEventJsonProps {
  data: Record<string, unknown>;
}
const cx = createClassnames(styles);
const TraceEventJson = ({ data }: TraceEventJsonProps) => {
  const { formatMessage } = useIntl();
  const text = useMemo(() => JSON.stringify(data, null, 2), [data]);
  return <StageTraceText value={text} label={formatMessage(messages.eventData)} />;
};
export const StageTraceEventData = ({ event }: StageTraceEventDataProps) => {
  const { formatMessage } = useIntl();
  const [isRawOpen, setRawOpen] = useState(false);
  const graderData = useMemo(
    () =>
      event.type === 'GRADERS' && event.data !== undefined
        ? readTraceGraderData(event.data)
        : undefined,
    [event.type, event.data],
  );
  if (event.data === undefined) return null;
  if (!graderData) return <TraceEventJson data={event.data} />;
  return (
    <>
      <StageTraceGraders data={graderData} />
      <details
        className={cx('graders__raw')}
        onToggle={(event) => setRawOpen(event.currentTarget.open)}
      >
        <summary>{formatMessage(messages.eventData)}</summary>
        {isRawOpen && <TraceEventJson data={event.data} />}
      </details>
    </>
  );
};
