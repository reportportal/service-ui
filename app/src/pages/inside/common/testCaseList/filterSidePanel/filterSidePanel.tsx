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

import {
  memo,
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';
import isEqual from 'fast-deep-equal';
import { Button, SidePanel, Dropdown, Checkbox } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as priorityMessages } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/basicInformation/messages';

import { STATUS_TYPES } from '../constants';
import { messages } from './messages';
import { ensureArray, normalizeSelection } from './utils';
import { useTagOptions } from './useTagOptions';
import type { FilterApplyPayload } from './types';

import styles from './filterSidePanel.scss';

const cx = createClassnames(styles);

interface FilterSidePanelProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPriorities: string[];
  selectedTags: string[];
  selectedToRunOnly?: boolean;
  showToRunOnly?: boolean;
  onPrioritiesChange: (priorities: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onApply: (payload: FilterApplyPayload) => void;
}

const FilterSidePanelComponent = ({
  isVisible,
  onClose,
  selectedPriorities,
  selectedTags,
  selectedToRunOnly = false,
  showToRunOnly = false,
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
  const [localToRunOnly, setLocalToRunOnly] = useState(Boolean(selectedToRunOnly));

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      setLocalSelectedPriorities(selectedPriorities);
      setLocalSelectedTags(selectedTags);
      setLocalToRunOnly(Boolean(selectedToRunOnly));
      // eslint-disable-next-line @typescript-eslint/no-floating-promises -- fire-and-forget when panel opens
      fetchTagOptions();
    }

    wasVisibleRef.current = isVisible;
  }, [isVisible, selectedPriorities, selectedTags, selectedToRunOnly, fetchTagOptions]);

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
    setLocalToRunOnly(false);
  };

  const handleApplyFilters = () => {
    const payload: FilterApplyPayload = {
      priorities: localSelectedPriorities,
      tags: localSelectedTags,
      toRunOnly: showToRunOnly ? localToRunOnly : false,
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

  const handleToRunOnlyChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setLocalToRunOnly(event.target.checked);
  }, []);

  const appliedToRunOnly = showToRunOnly ? Boolean(selectedToRunOnly) : false;
  const hasActiveFilters =
    !isEmpty(localSelectedPriorities) ||
    !isEmpty(localSelectedTags) ||
    (showToRunOnly && localToRunOnly);

  const hasChanges = useMemo(() => {
    const applied = {
      priorities: normalizeSelection(selectedPriorities),
      tags: normalizeSelection(selectedTags),
      toRunOnly: appliedToRunOnly,
    };
    const pending = {
      priorities: normalizeSelection(localSelectedPriorities),
      tags: normalizeSelection(localSelectedTags),
      toRunOnly: showToRunOnly ? localToRunOnly : false,
    };

    return !isEqual(applied, pending);
  }, [
    localSelectedPriorities,
    localSelectedTags,
    localToRunOnly,
    selectedPriorities,
    selectedTags,
    appliedToRunOnly,
    showToRunOnly,
  ]);

  const titleComponent = (
    <div className={cx('filter-title')}>{formatMessage(commonMessages.filterTitle)}</div>
  );

  const contentComponent = (
    <div className={cx('filter-content')}>
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
      {showToRunOnly && (
        <div className={cx('filter-section', 'filter-section--checkbox')}>
          <Checkbox value={localToRunOnly} onChange={handleToRunOnlyChange}>
            {formatMessage(messages.showToRunOnly)}
          </Checkbox>
        </div>
      )}
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
