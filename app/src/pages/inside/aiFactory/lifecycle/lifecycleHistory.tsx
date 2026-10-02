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
import type { MessageDescriptor } from 'react-intl';
import { BubblesLoader, Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { AbsRelTime } from 'components/main/absRelTime';
import { CollapsibleSection } from 'components/collapsibleSection';
import { LifecycleBadge } from 'pages/inside/aiFactory/common';
import { Lifecycle, LifecycleReason } from 'types/aiFactory';
import type { AiLifecycle, AiLifecycleReason } from 'types/aiFactory';

import { messages } from './messages';
import type { TestCaseAiLoadState } from './useTestCaseAi';

import styles from './lifecycleHistory.scss';

const cx = createClassnames(styles);

const REASON_MESSAGES: Record<AiLifecycleReason, MessageDescriptor> = {
  [LifecycleReason.CREATED]: messages.created,
  [LifecycleReason.UPLOADED]: messages.uploaded,
  [LifecycleReason.MIGRATED]: messages.migrated,
  [LifecycleReason.APPROVED]: messages.approved,
  [LifecycleReason.MARKED_AS_READY]: messages.markedAsReady,
  [LifecycleReason.APPROVED_WITH_CHANGES]: messages.approvedWithChanges,
  [LifecycleReason.MARKED_AS_READY_WITH_CHANGES]: messages.markedAsReadyWithChanges,
  [LifecycleReason.AUTO_READY]: messages.autoReady,
  [LifecycleReason.SCENARIO_CHANGED]: messages.scenarioChanged,
  [LifecycleReason.AGENT_FIX]: messages.agentFix,
};

const LIFECYCLES = new Set<string>(Object.values(Lifecycle));
const MAX_DATE_TIMESTAMP = 8.64e15;

interface NormalizedHistoryEntry {
  from?: AiLifecycle;
  to: AiLifecycle;
  reason?: AiLifecycleReason;
  details?: string;
  actorName?: string;
  at?: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const normalizeLifecycle = (value: unknown): AiLifecycle | undefined =>
  typeof value === 'string' && LIFECYCLES.has(value) ? (value as AiLifecycle) : undefined;

const normalizeReason = (value: unknown): AiLifecycleReason | undefined =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(REASON_MESSAGES, value)
    ? (value as AiLifecycleReason)
    : undefined;

const normalizeTimestamp = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= MAX_DATE_TIMESTAMP
    ? value
    : undefined;

const normalizeHistoryEntry = (value: unknown): NormalizedHistoryEntry | null => {
  const entry = asRecord(value);
  const to = normalizeLifecycle(entry?.to);
  if (!entry || !to) {
    return null;
  }

  const actor = asRecord(entry.actor);
  return {
    from: normalizeLifecycle(entry.from),
    to,
    reason: normalizeReason(entry.reason),
    details: typeof entry.details === 'string' ? entry.details : undefined,
    actorName: typeof actor?.name === 'string' && actor.name ? actor.name : undefined,
    at: normalizeTimestamp(entry.at),
  };
};

const normalizeHistory = (value: unknown): NormalizedHistoryEntry[] =>
  Array.isArray(value)
    ? value
        .map(normalizeHistoryEntry)
        .filter((entry): entry is NormalizedHistoryEntry => entry !== null)
    : [];

interface LifecycleHistoryProps {
  aiDetailsState: TestCaseAiLoadState;
}

interface HistoryEntryProps {
  entry: NormalizedHistoryEntry;
}

const HistoryEntry = ({ entry }: HistoryEntryProps) => {
  const { formatMessage } = useIntl();

  return (
    <li className={cx('history__item')}>
      <div className={cx('history__transition')}>
        {entry.from && <LifecycleBadge lifecycle={entry.from} />}
        {entry.from && <span aria-hidden="true">→</span>}
        <LifecycleBadge lifecycle={entry.to} />
      </div>
      <div className={cx('history__reason')}>
        {formatMessage(entry.reason ? REASON_MESSAGES[entry.reason] : messages.changed)}
        {entry.details && <span className={cx('history__details')}> · {entry.details}</span>}
      </div>
      <div className={cx('history__meta')}>
        <span>
          {formatMessage(messages.byActor, {
            actor: entry.actorName ?? formatMessage(messages.unknownActor),
          })}
        </span>
        {entry.at !== undefined && (
          <AbsRelTime startTime={entry.at} customClass={cx('history__time')} />
        )}
      </div>
    </li>
  );
};

export const LifecycleHistory = ({ aiDetailsState }: LifecycleHistoryProps) => {
  const { formatMessage } = useIntl();
  const { data, isLoading, isError, reload } = aiDetailsState;
  const history = normalizeHistory(data?.lifecycleHistory).reverse();

  let content = history.length ? (
    <ul className={cx('history')}>
      {history.map((entry) => (
        <HistoryEntry
          key={`${entry.at ?? 'unknown'}-${entry.reason ?? 'unknown'}-${entry.from ?? 'none'}-${entry.to}-${entry.actorName ?? 'unknown'}-${entry.details ?? ''}`}
          entry={entry}
        />
      ))}
    </ul>
  ) : null;

  if (isLoading) {
    content = (
      <output className={cx('history__state')} aria-label={formatMessage(messages.loading)}>
        <BubblesLoader />
      </output>
    );
  } else if (isError) {
    content = (
      <div className={cx('history__state')} role="alert">
        <span>{formatMessage(messages.loadError)}</span>
        <Button
          variant="text"
          adjustWidthOn="content"
          onClick={reload}
          data-automation-id="retry-lifecycle-history"
        >
          {formatMessage(messages.retry)}
        </Button>
      </div>
    );
  }

  return (
    <CollapsibleSection
      title={formatMessage(messages.history)}
      defaultMessage={formatMessage(messages.empty)}
      isInitiallyExpanded={Boolean(history.length) || isLoading || isError}
    >
      {content}
    </CollapsibleSection>
  );
};
