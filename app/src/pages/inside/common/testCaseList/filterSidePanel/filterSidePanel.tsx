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

import { memo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Button, SidePanel, Dropdown } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { useOnClickOutside } from 'common/hooks';
import { commonMessages } from 'pages/inside/common/common-messages';

import { messages } from './messages';
import { MOCK_PRIORITY_OPTIONS, MOCK_TAG_OPTIONS } from './mocks';

import styles from './filterSidePanel.scss';
import { isEmpty } from 'es-toolkit/compat';

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
    const sidePanelRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(sidePanelRef, onClose);

    const handleClearAllFilters = () => {
      onPrioritiesChange([]);
      onTagsChange([]);
    };

    const handleApplyFilters = () => {
      onApply();
      onClose();
    };

    const handleCancel = () => {
      onClose();
    };

    const handlePriorityChange = (value: string | string[]) => {
      onPrioritiesChange(Array.isArray(value) ? value : [value]);
    };

    const handleTagsChange = (value: string | string[]) => {
      onTagsChange(Array.isArray(value) ? value : [value]);
    };

    const hasActiveFilters = !isEmpty(selectedPriorities) || !isEmpty(selectedTags);

    const titleComponent = (
      <div className={cx('filter-title')}>{formatMessage(messages.filterTitle)}</div>
    );

    const contentComponent = (
      <div className={cx('filter-content')}>
        <div className={cx('filter-section')}>
          <div className={cx('filter-label')}>{formatMessage(commonMessages.priority)}</div>
          <Dropdown
            options={MOCK_PRIORITY_OPTIONS}
            value={selectedPriorities}
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
            value={selectedTags}
            onChange={handleTagsChange}
            placeholder={formatMessage(messages.selectTags)}
            multiSelect
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
          <Button variant="primary" onClick={handleApplyFilters} className={cx('apply-button')}>
            {formatMessage(commonMessages.apply)}
          </Button>
        </div>
      </div>
    );

    return (
      <div ref={sidePanelRef}>
        <SidePanel
          className={cx('filter-side-panel')}
          title={titleComponent}
          contentComponent={contentComponent}
          footerComponent={footerComponent}
          isOpen={isVisible}
          onClose={onClose}
          closeButtonAriaLabel={formatMessage(commonMessages.closePanel)}
          side="right"
        />
      </div>
    );
  },
);
