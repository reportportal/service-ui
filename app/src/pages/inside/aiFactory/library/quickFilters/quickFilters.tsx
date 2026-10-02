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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { CloseIcon, SegmentedControl } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import type { AiLifecycle } from 'types/aiFactory';
import type { TestCaseAiPresenceFilter } from 'types/store';

import { messages } from './messages';

import styles from './quickFilters.scss';

const cx = createClassnames(styles);
type SegmentedControlValue = string | number;

export type AiFilter = TestCaseAiPresenceFilter;

export interface QuickFiltersValue {
  lifecycle?: AiLifecycle;
  ai?: AiFilter;
  iteration?: string;
}

export interface QuickFiltersProps extends QuickFiltersValue {
  iterationNumber?: number;
  reviewQueueCount?: number;
  onChange: (value: QuickFiltersValue) => void;
}

interface FilterControlProps<T> {
  value?: T;
  onChange: (value: T | undefined) => void;
}

interface ReviewQueueButtonProps {
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

interface IterationChipProps {
  number?: number;
  onRemove: () => void;
}

const LifecycleFilter = ({ value, onChange }: FilterControlProps<AiLifecycle>) => {
  const { formatMessage } = useIntl();
  const options = useMemo(
    () => [
      { label: formatMessage(messages.all), value: 'ALL', selected: !value },
      {
        label: formatMessage(messages.draft),
        value: 'DRAFT',
        selected: value === 'DRAFT',
      },
      {
        label: formatMessage(messages.ready),
        value: 'READY',
        selected: value === 'READY',
      },
    ],
    [formatMessage, value],
  );

  return (
    <div className={cx('filter-group')}>
      <span className={cx('filter-label')}>{formatMessage(messages.status)}</span>
      <SegmentedControl
        className={cx('segmented-control')}
        ariaLabel={formatMessage(messages.status)}
        options={options}
        onChange={(nextValue) =>
          onChange(nextValue === 'ALL' ? undefined : (nextValue as AiLifecycle))
        }
      />
    </div>
  );
};

const AiPresenceFilter = ({ value, onChange }: FilterControlProps<AiFilter>) => {
  const { formatMessage } = useIntl();
  const options = useMemo(
    () => [
      { label: formatMessage(messages.all), value: 'ALL', selected: !value },
      { label: formatMessage(messages.ai), value: 'AI', selected: value === 'AI' },
      { label: formatMessage(messages.noAi), value: 'NO_AI', selected: value === 'NO_AI' },
    ],
    [formatMessage, value],
  );

  return (
    <div className={cx('filter-group')}>
      <span className={cx('filter-label')}>{formatMessage(messages.ai)}</span>
      <SegmentedControl
        className={cx('segmented-control')}
        ariaLabel={formatMessage(messages.ai)}
        options={options}
        onChange={(nextValue: SegmentedControlValue) =>
          onChange(nextValue === 'ALL' ? undefined : (nextValue as AiFilter))
        }
      />
    </div>
  );
};

const ReviewQueueButton = ({ count, isActive, onClick }: ReviewQueueButtonProps) => {
  const { formatMessage } = useIntl();

  return (
    <button
      type="button"
      className={cx('review-queue', { 'review-queue--active': isActive })}
      data-automation-id="reviewQueueFilter"
      aria-pressed={isActive}
      onClick={onClick}
    >
      {formatMessage(count === undefined ? messages.reviewQueue : messages.reviewQueueWithCount, {
        count,
      })}
    </button>
  );
};

const IterationChip = ({ number, onRemove }: IterationChipProps) => {
  const { formatMessage } = useIntl();
  const label = number
    ? formatMessage(messages.iterationNumber, { number })
    : formatMessage(messages.iteration);

  return (
    <span className={cx('iteration-chip')}>
      {label}
      <button
        type="button"
        className={cx('remove-iteration')}
        data-automation-id="removeIterationFilter"
        aria-label={formatMessage(messages.removeIteration)}
        onClick={onRemove}
      >
        <CloseIcon />
      </button>
    </span>
  );
};

export const QuickFilters = ({
  lifecycle,
  ai,
  iteration,
  iterationNumber,
  reviewQueueCount,
  onChange,
}: QuickFiltersProps) => {
  const { formatMessage } = useIntl();
  const isReviewQueueActive = lifecycle === 'DRAFT' && ai === 'AI';
  const hasActiveFilters = Boolean(lifecycle || ai || iteration);

  return (
    <div className={cx('quick-filters')} data-automation-id="aiFactoryQuickFilters">
      <LifecycleFilter value={lifecycle} onChange={(value) => onChange({ lifecycle: value })} />
      <AiPresenceFilter value={ai} onChange={(value) => onChange({ ai: value })} />
      <ReviewQueueButton
        count={reviewQueueCount}
        isActive={isReviewQueueActive}
        onClick={() => onChange({ lifecycle: 'DRAFT', ai: 'AI' })}
      />
      {iteration && (
        <IterationChip
          number={iterationNumber}
          onRemove={() => onChange({ iteration: undefined })}
        />
      )}
      {hasActiveFilters && (
        <button
          type="button"
          className={cx('clear')}
          data-automation-id="clearAiFactoryFilters"
          onClick={() => onChange({ lifecycle: undefined, ai: undefined, iteration: undefined })}
        >
          {formatMessage(messages.clear)}
        </button>
      )}
    </div>
  );
};
