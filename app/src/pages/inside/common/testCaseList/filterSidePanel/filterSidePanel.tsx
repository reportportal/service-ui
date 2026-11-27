/*
 * Copyright 2025 EPAM Systems
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

import { memo, useRef, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';
import isEqual from 'fast-deep-equal';
import { Button, SidePanel, Dropdown } from '@reportportal/ui-kit';
import type { DropdownOptionProps } from '@reportportal/ui-kit/dropdown';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { MANUAL_LAUNCH_FILTER_EXECUTION_STATUSES } from 'controllers/manualLaunch';
import { ExecutionStatus } from 'types/testCase';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as priorityMessages } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/basicInformation/messages';

import { STATUS_TYPES } from '../constants';
import { messages } from './messages';
import { ensureArray, normalizeSelection } from './utils';
import { useTagOptions } from './useTagOptions';
import type { FilterApplyPayload } from './types';

import styles from './filterSidePanel.scss';

const cx = createClassnames(styles);

const EMPTY_STATUSES: string[] = [];

const STATUS_OPTION_MESSAGES = {
  [ExecutionStatus.TO_RUN]: commonMessages.toRun,
  [ExecutionStatus.IN_PROGRESS]: commonMessages.inProgress,
  [ExecutionStatus.PASSED]: commonMessages.passed,
  [ExecutionStatus.FAILED]: commonMessages.failed,
  [ExecutionStatus.SKIPPED]: commonMessages.skipped,
};

const STATUSES_WITH_DOT: string[] = [
  ExecutionStatus.PASSED,
  ExecutionStatus.FAILED,
  ExecutionStatus.SKIPPED,
];

const renderStatusOption = ({ option }: DropdownOptionProps) => {
  const status = String(option.value);

  return (
    <span className={cx('status-option')}>
      <span
        className={cx('status-option-dot', {
          [`status-option-dot--${status.toLowerCase()}`]: STATUSES_WITH_DOT.includes(status),
        })}
        aria-hidden
      />
      {option.label}
    </span>
  );
};

interface FilterSidePanelProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPriorities: string[];
  selectedTags: string[];
  selectedStatuses?: string[];
  showStatusFilter?: boolean;
  onPrioritiesChange: (priorities: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onApply: (payload: FilterApplyPayload) => void;
}

const FilterSidePanelComponent = ({
  isVisible,
  onClose,
  selectedPriorities,
  selectedTags,
  selectedStatuses = EMPTY_STATUSES,
  showStatusFilter = false,
  onPrioritiesChange,
  onTagsChange,
  onApply,
}: FilterSidePanelProps) => {
  const { formatMessage } = useIntl();
  const wasVisibleRef = useRef(false);
  const { tagOptions, fetchTagOptions } = useTagOptions();

  const [localSelectedPriorities, setLocalSelectedPriorities] =
    useState<string[]>(selectedPriorities);
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags);
  const [localSelectedStatuses, setLocalSelectedStatuses] = useState<string[]>(selectedStatuses);

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      setLocalSelectedPriorities(selectedPriorities);
      setLocalSelectedTags(selectedTags);
      setLocalSelectedStatuses(selectedStatuses);
      fetchTagOptions();
    }

    wasVisibleRef.current = isVisible;
  }, [isVisible, selectedPriorities, selectedTags, selectedStatuses, fetchTagOptions]);

  const priorityOptions = useMemo(
    () => [
      { value: STATUS_TYPES.BLOCKER, label: formatMessage(priorityMessages.priorityBlocker) },
      { value: STATUS_TYPES.CRITICAL, label: formatMessage(priorityMessages.priorityCritical) },
      { value: STATUS_TYPES.HIGH, label: formatMessage(priorityMessages.priorityHigh) },
      { value: STATUS_TYPES.MEDIUM, label: formatMessage(priorityMessages.priorityMedium) },
      { value: STATUS_TYPES.LOW, label: formatMessage(priorityMessages.priorityLow) },
      {
        value: STATUS_TYPES.UNSPECIFIED,
        label: formatMessage(priorityMessages.priorityUnspecified),
      },
    ],
    [formatMessage],
  );

  const statusOptions = useMemo(
    () =>
      MANUAL_LAUNCH_FILTER_EXECUTION_STATUSES.map((status) => ({
        value: status,
        label: formatMessage(STATUS_OPTION_MESSAGES[status]),
      })),
    [formatMessage],
  );

  const tagDropdownOptions = useMemo(() => {
    const byValue = localSelectedTags.reduce((acc, tag) => {
      if (!acc.has(tag)) {
        acc.set(tag, { value: tag, label: tag });
      }
      return acc;
    }, new Map(tagOptions.map((option) => [option.value, option])));

    return Array.from(byValue.values());
  }, [tagOptions, localSelectedTags]);

  const handleClearAllFilters = () => {
    setLocalSelectedPriorities([]);
    setLocalSelectedTags([]);
    setLocalSelectedStatuses([]);
  };

  const handleApplyFilters = () => {
    const payload: FilterApplyPayload = {
      priorities: localSelectedPriorities,
      tags: localSelectedTags,
      statuses: showStatusFilter ? localSelectedStatuses : [],
    };

    onPrioritiesChange(payload.priorities);
    onTagsChange(payload.tags);
    onApply(payload);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handlePriorityChange = (value: string | string[] | null) => {
    setLocalSelectedPriorities(ensureArray(value));
  };

  const handleTagsChange = (value: string | string[] | null) => {
    setLocalSelectedTags(ensureArray(value));
  };

  const handleStatusesChange = (value: string | string[] | null) => {
    setLocalSelectedStatuses(ensureArray(value));
  };

  const appliedStatuses = showStatusFilter ? selectedStatuses : EMPTY_STATUSES;
  const pendingStatuses = showStatusFilter ? localSelectedStatuses : EMPTY_STATUSES;
  const hasActiveFilters =
    !isEmpty(localSelectedPriorities) || !isEmpty(localSelectedTags) || !isEmpty(pendingStatuses);

  const hasChanges = useMemo(() => {
    const applied = {
      priorities: normalizeSelection(selectedPriorities),
      tags: normalizeSelection(selectedTags),
      statuses: normalizeSelection(appliedStatuses),
    };
    const pending = {
      priorities: normalizeSelection(localSelectedPriorities),
      tags: normalizeSelection(localSelectedTags),
      statuses: normalizeSelection(pendingStatuses),
    };

    return !isEqual(applied, pending);
  }, [
    localSelectedPriorities,
    localSelectedTags,
    selectedPriorities,
    selectedTags,
    appliedStatuses,
    pendingStatuses,
  ]);

  const titleComponent = (
    <div className={cx('filter-title')}>{formatMessage(commonMessages.filterTitle)}</div>
  );

  const contentComponent = (
    <div className={cx('filter-content')}>
      {showStatusFilter && (
        <div className={cx('filter-section')}>
          <div className={cx('filter-label')}>{formatMessage(messages.status)}</div>
          <Dropdown
            options={statusOptions}
            value={localSelectedStatuses}
            onChange={handleStatusesChange}
            placeholder={formatMessage(messages.selectExecutionStatuses)}
            renderOption={renderStatusOption}
            multiSelect
            clearable
          />
        </div>
      )}
      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>{formatMessage(commonMessages.priority)}</div>
        <Dropdown
          options={priorityOptions}
          value={localSelectedPriorities}
          onChange={handlePriorityChange}
          placeholder={formatMessage(messages.selectPriority)}
          multiSelect
          clearable
        />
      </div>
      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>{formatMessage(commonMessages.tags)}</div>
        <Dropdown
          options={tagDropdownOptions}
          value={localSelectedTags}
          onChange={handleTagsChange}
          placeholder={formatMessage(messages.selectTags)}
          multiSelect
          isMultiSelectWithTags
          clearable
        />
      </div>
    </div>
  );

  const footerComponent = (
    <div className={cx('filter-footer')}>
      <div className={cx('footer-left')}>
        <Button
          variant="ghost"
          onClick={handleClearAllFilters}
          className={cx('clear-button')}
          disabled={!hasActiveFilters}
        >
          {formatMessage(commonMessages.clearAllFilters)}
        </Button>
      </div>
      <div className={cx('footer-right')}>
        <Button variant="ghost" onClick={handleCancel} className={cx('cancel-button')}>
          {formatMessage(commonMessages.cancel)}
        </Button>
        <Button
          variant="primary"
          onClick={handleApplyFilters}
          className={cx('apply-button')}
          disabled={!hasChanges}
        >
          {formatMessage(commonMessages.apply)}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isVisible &&
        createPortal(
          <div>
            <SidePanel
              className={cx('filter-side-panel')}
              overlayClassName={cx('filter-overlay')}
              title={titleComponent}
              contentComponent={contentComponent}
              footerComponent={footerComponent}
              isOpen={isVisible}
              onClose={onClose}
              closeButtonAriaLabel={formatMessage(commonMessages.closePanel)}
              side="right"
              showOverlay
              allowCloseOutside={!hasChanges}
            />
          </div>,
          document.body,
        )}
    </>
  );
};

export const FilterSidePanel = memo(FilterSidePanelComponent);
