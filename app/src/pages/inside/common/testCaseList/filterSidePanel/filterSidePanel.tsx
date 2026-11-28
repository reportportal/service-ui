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
import {
  Button,
  SidePanel,
  Dropdown,
  Checkbox,
  FieldText,
  CloseIcon,
  PlusIcon,
} from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as priorityMessages } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/basicInformation/messages';

import { STATUS_TYPES } from '../constants';
import { messages } from './messages';
import { ensureArray, normalizeRequirements, normalizeSelection } from './utils';
import { useTagOptions } from './useTagOptions';
import type { FilterApplyPayload } from './types';

import styles from './filterSidePanel.scss';

const cx = createClassnames(styles);

const EMPTY_REQUIREMENTS: string[] = [];

/** The Requirements block always shows at least one field. */
const toRequirementFields = (values: string[]) => (values.length ? values : ['']);

interface FilterSidePanelProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPriorities: string[];
  selectedTags: string[];
  selectedRequirements?: string[];
  selectedToRunOnly?: boolean;
  showToRunOnly?: boolean;
  showRequirements?: boolean;
  onPrioritiesChange: (priorities: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onApply: (payload: FilterApplyPayload) => void;
}

const FilterSidePanelComponent = ({
  isVisible,
  onClose,
  selectedPriorities,
  selectedTags,
  selectedRequirements = EMPTY_REQUIREMENTS,
  selectedToRunOnly = false,
  showToRunOnly = false,
  showRequirements = false,
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
  const [localRequirements, setLocalRequirements] = useState<string[]>(() =>
    toRequirementFields(selectedRequirements),
  );
  const requirementInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const focusRequirementIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      setLocalSelectedPriorities(selectedPriorities);
      setLocalSelectedTags(selectedTags);
      setLocalToRunOnly(Boolean(selectedToRunOnly));
      setLocalRequirements(toRequirementFields(selectedRequirements));
       
      fetchTagOptions();
    }

    wasVisibleRef.current = isVisible;
  }, [
    isVisible,
    selectedPriorities,
    selectedTags,
    selectedRequirements,
    selectedToRunOnly,
    fetchTagOptions,
  ]);

  useEffect(() => {
    if (focusRequirementIndexRef.current !== null) {
      requirementInputRefs.current[focusRequirementIndexRef.current]?.focus();
      focusRequirementIndexRef.current = null;
    }
  }, [localRequirements]);

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

  const pendingRequirements = useMemo(
    () => (showRequirements ? normalizeRequirements(localRequirements) : EMPTY_REQUIREMENTS),
    [showRequirements, localRequirements],
  );

  const handleClearAllFilters = () => {
    setLocalSelectedPriorities([]);
    setLocalSelectedTags([]);
    setLocalRequirements(['']);
    setLocalToRunOnly(false);
  };

  const handleApplyFilters = () => {
    const payload: FilterApplyPayload = {
      priorities: localSelectedPriorities,
      tags: localSelectedTags,
      requirements: pendingRequirements,
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

  const handleRequirementChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setLocalRequirements((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleRemoveRequirement = (index: number) => {
    setLocalRequirements((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']));
  };

  const handleAddRequirement = () => {
    focusRequirementIndexRef.current = localRequirements.length;
    setLocalRequirements((prev) => [...prev, '']);
  };

  const handleToRunOnlyChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setLocalToRunOnly(event.target.checked);
  }, []);

  const appliedToRunOnly = showToRunOnly ? Boolean(selectedToRunOnly) : false;
  const hasActiveFilters =
    !isEmpty(localSelectedPriorities) ||
    !isEmpty(localSelectedTags) ||
    localRequirements.some((value) => value.trim()) ||
    (showToRunOnly && localToRunOnly);

  const hasChanges = useMemo(() => {
    const applied = {
      priorities: normalizeSelection(selectedPriorities),
      tags: normalizeSelection(selectedTags),
      requirements: showRequirements ? normalizeRequirements(selectedRequirements) : [],
      toRunOnly: appliedToRunOnly,
    };
    const pending = {
      priorities: normalizeSelection(localSelectedPriorities),
      tags: normalizeSelection(localSelectedTags),
      requirements: pendingRequirements,
      toRunOnly: showToRunOnly ? localToRunOnly : false,
    };

    return !isEqual(applied, pending);
  }, [
    localSelectedPriorities,
    localSelectedTags,
    localToRunOnly,
    selectedPriorities,
    selectedTags,
    selectedRequirements,
    pendingRequirements,
    showRequirements,
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
      {showRequirements && (
        <div className={cx('filter-section')}>
          <div className={cx('requirements-header')}>
            <div className={cx('filter-label')}>{formatMessage(messages.requirements)}</div>
            <div className={cx('requirements-help-text')}>
              {formatMessage(messages.requirementsHelpText)}
            </div>
          </div>
          <div className={cx('requirements-fields')}>
            {localRequirements.map((value, index) => (
              // eslint-disable-next-line react/no-array-index-key -- the fields have no stable id
              <div key={index} className={cx('requirement-row')}>
                <FieldText
                  ref={(element: HTMLInputElement | null) => {
                    requirementInputRefs.current[index] = element;
                  }}
                  className={cx('requirement-field')}
                  value={value}
                  onChange={handleRequirementChange(index)}
                  placeholder={formatMessage(messages.requirementPlaceholder)}
                  title={value}
                  defaultWidth={false}
                />
                <Button
                  variant="ghost"
                  adjustWidthOn="content"
                  className={cx('requirement-remove')}
                  onClick={() => handleRemoveRequirement(index)}
                  aria-label={formatMessage(messages.removeRequirement)}
                >
                  <CloseIcon />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="text"
            adjustWidthOn="content"
            icon={<PlusIcon />}
            onClick={handleAddRequirement}
            className={cx('add-requirement')}
          >
            {formatMessage(messages.addRequirement)}
          </Button>
        </div>
      )}
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
