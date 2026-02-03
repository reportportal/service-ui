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
import { useIntl } from 'react-intl';
import isEqual from 'fast-deep-equal';
import { Button, SidePanel, Dropdown } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as priorityMessages } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/basicInformation/messages';

import { STATUS_TYPES } from '../constants';
import { messages } from './messages';
import { MOCK_TAG_OPTIONS } from './mocks';
import { ensureArray, normalizeSelection } from './utils';

import styles from './filterSidePanel.scss';

const cx = createClassnames(styles);

interface FilterSidePanelProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPriorities: string[];
  selectedTags: string[];
  onPrioritiesChange: (priorities: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onApply: () => void;
}

export const FilterSidePanel = memo(
  ({
    isVisible,
    onClose,
    selectedPriorities,
    selectedTags,
    onPrioritiesChange,
    onTagsChange,
    onApply,
  }: FilterSidePanelProps) => {
    const { formatMessage } = useIntl();
    const wasVisibleRef = useRef(false);

    const [localSelectedPriorities, setLocalSelectedPriorities] =
      useState<string[]>(selectedPriorities);
    const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags);

    useEffect(() => {
      if (isVisible && !wasVisibleRef.current) {
        setLocalSelectedPriorities(selectedPriorities);
        setLocalSelectedTags(selectedTags);
      }

      wasVisibleRef.current = isVisible;
    }, [isVisible, selectedPriorities, selectedTags]);

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

    const handleClearAllFilters = () => {
      setLocalSelectedPriorities([]);
      setLocalSelectedTags([]);
    };

    const handleApplyFilters = () => {
      onPrioritiesChange(localSelectedPriorities);
      onTagsChange(localSelectedTags);
      onApply();
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

    const hasActiveFilters = !isEmpty(localSelectedPriorities) || !isEmpty(localSelectedTags);

    const hasChanges = useMemo(() => {
      const applied = {
        priorities: normalizeSelection(selectedPriorities),
        tags: normalizeSelection(selectedTags),
      };
      const pending = {
        priorities: normalizeSelection(localSelectedPriorities),
        tags: normalizeSelection(localSelectedTags),
      };

      return !isEqual(applied, pending);
    }, [localSelectedPriorities, localSelectedTags, selectedPriorities, selectedTags]);

    const titleComponent = (
      <div className={cx('filter-title')}>{formatMessage(messages.filterTitle)}</div>
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
            options={MOCK_TAG_OPTIONS}
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
            {formatMessage(messages.clearAllFilters)}
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
          showOverlay={true}
          allowCloseOutside={!hasChanges}
        />
      </div>
    );
  },
);
