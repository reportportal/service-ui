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

import { memo, useRef, useMemo, useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import isEqual from 'fast-deep-equal';
import { Button, SidePanel, Dropdown, Checkbox } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames, compareStringsLocale } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { EditableAttributeList } from 'componentLibrary/attributeList/editableAttributeList';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as filterSidePanelMessages } from 'pages/inside/common/testCaseList/filterSidePanel/messages';
import { messages as launchFormMessages } from 'pages/inside/common/launchFormFields/messages';
import { messages as testPlanModalMessages } from 'pages/inside/testPlansPage/testPlanModals/testPlanModal/messages';

import { LAUNCH_STATUSES, COMPLETION_VALUES, EMPTY_FILTER } from './constants';
import { StartTimeFilter } from './startTimeFilter/startTimeFilter';
import type {
  ManualLaunchesFilterSidePanelProps,
  ManualLaunchesFilterPayload,
  StartTimeValue,
} from './types';
import type { LaunchAttribute } from '../types';
import { messages } from './messages';

import styles from './manualLaunchesFilterSidePanel.scss';

const cx = createClassnames(styles);

const ManualLaunchesFilterSidePanelComponent = ({
  isVisible,
  onClose,
  appliedFilters,
  onApply,
}: ManualLaunchesFilterSidePanelProps) => {
  const { formatMessage } = useIntl();
  const wasVisibleRef = useRef(false);
  const projectKey = useSelector(projectKeySelector);

  const [localStatuses, setLocalStatuses] = useState<string[]>(appliedFilters.statuses);
  const [localCompletion, setLocalCompletion] = useState<string>(appliedFilters.completion);
  const [localStartTime, setLocalStartTime] = useState<StartTimeValue | null>(
    appliedFilters.startTime,
  );
  const [localTestPlan, setLocalTestPlan] = useState<string | null>(appliedFilters.testPlan);
  const [localAttributes, setLocalAttributes] = useState<LaunchAttribute[]>(
    appliedFilters.attributes,
  );

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      setLocalStatuses(appliedFilters.statuses);
      setLocalCompletion(appliedFilters.completion);
      setLocalStartTime(appliedFilters.startTime);
      setLocalTestPlan(appliedFilters.testPlan);
      setLocalAttributes(appliedFilters.attributes);
    }

    wasVisibleRef.current = isVisible;
  }, [isVisible, appliedFilters]);

  const statusOptions = useMemo(
    () => [
      { value: LAUNCH_STATUSES.PASSED, label: formatMessage(commonMessages.passed) },
      { value: LAUNCH_STATUSES.FAILED, label: formatMessage(commonMessages.failed) },
      { value: LAUNCH_STATUSES.SKIPPED, label: formatMessage(commonMessages.skipped) },
      { value: LAUNCH_STATUSES.IN_PROGRESS, label: formatMessage(commonMessages.inProgress) },
    ],
    [formatMessage],
  );

  const completionOptions = useMemo(
    () => [
      { value: COMPLETION_VALUES.ALL, label: formatMessage(messages.completionAll) },
      {
        value: COMPLETION_VALUES.HAS_NOT_EXECUTED_TESTS,
        label: formatMessage(messages.completionHasNotExecutedTests),
      },
      { value: COMPLETION_VALUES.DONE, label: formatMessage(messages.completionDone) },
    ],
    [formatMessage],
  );

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, status: string) => {
      const { checked } = event.target;
      setLocalStatuses((prev) =>
        checked ? [...prev, status] : prev.filter((state) => state !== status),
      );
    },
    [],
  );

  const handleCompletionChange = useCallback((value: string) => {
    setLocalCompletion(value);
  }, []);

  const handleTestPlanChange = useCallback((value: string | string[] | null) => {
    setLocalTestPlan(typeof value === 'string' ? value : null);
  }, []);

  const handleAttributesChange = useCallback((attrs: LaunchAttribute[]) => {
    setLocalAttributes(attrs);
  }, []);

  const getURIKey = useCallback(
    (search = '') => URLS.launchAttributeKeysSearch(projectKey)(search),
    [projectKey],
  );

  const getURIValue = useCallback(
    (key?: string) =>
      (search = '') =>
        URLS.launchAttributeValuesSearch(projectKey, key)(search),
    [projectKey],
  );

  const hasActiveFilters =
    !isEmpty(localStatuses) ||
    localCompletion !== EMPTY_FILTER.completion ||
    localStartTime !== null ||
    localTestPlan !== null ||
    !isEmpty(localAttributes);

  const hasChanges = useMemo(() => {
    const pending: ManualLaunchesFilterPayload = {
      statuses: [...localStatuses].sort(compareStringsLocale),
      completion: localCompletion,
      startTime: localStartTime,
      testPlan: localTestPlan,
      attributes: localAttributes,
    };
    const applied: ManualLaunchesFilterPayload = {
      statuses: [...appliedFilters.statuses].sort(compareStringsLocale),
      completion: appliedFilters.completion,
      startTime: appliedFilters.startTime,
      testPlan: appliedFilters.testPlan,
      attributes: appliedFilters.attributes,
    };

    return !isEqual(applied, pending);
  }, [localStatuses, localCompletion, localStartTime, localTestPlan, localAttributes, appliedFilters]);

  const handleClearAllFilters = useCallback(() => {
    setLocalStatuses(EMPTY_FILTER.statuses);
    setLocalCompletion(EMPTY_FILTER.completion);
    setLocalStartTime(EMPTY_FILTER.startTime);
    setLocalTestPlan(EMPTY_FILTER.testPlan);
    setLocalAttributes(EMPTY_FILTER.attributes);
  }, []);

  const handleApplyFilters = useCallback(() => {
    onApply({
      statuses: localStatuses,
      completion: localCompletion,
      startTime: localStartTime,
      testPlan: localTestPlan,
      attributes: localAttributes,
    });
    onClose();
  }, [localStatuses, localCompletion, localStartTime, localTestPlan, localAttributes, onApply, onClose]);

  const titleComponent = (
    <div className={cx('filter-title')}>{formatMessage(filterSidePanelMessages.filterTitle)}</div>
  );

  const contentComponent = (
    <div className={cx('filter-content')}>
      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>{formatMessage(messages.containsStatuses)}</div>
        <div className={cx('checkbox-group')}>
          {statusOptions.map((option) => (
            <Checkbox
              key={option.value}
              value={localStatuses.includes(option.value)}
              onChange={(event) => handleStatusChange(event, option.value)}
            >
              {option.label}
            </Checkbox>
          ))}
        </div>
      </div>

      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>{formatMessage(messages.launchCompletion)}</div>
        <div className={cx('radio-group')}>
          {completionOptions.map((option) => (
            <label key={option.value} className={cx('radio-option')}>
              <input
                type="radio"
                name="launchCompletion"
                value={option.value}
                checked={localCompletion === option.value}
                onChange={() => handleCompletionChange(option.value)}
                className={cx('radio-input')}
              />
              <span className={cx('radio-label')}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>{formatMessage(messages.startTime)}</div>
        <StartTimeFilter value={localStartTime} onChange={setLocalStartTime} />
      </div>

      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>{formatMessage(launchFormMessages.testPlanLabel)}</div>
        <Dropdown
          options={[]}
          value={localTestPlan}
          onChange={handleTestPlanChange}
          placeholder={formatMessage(launchFormMessages.selectTestPlanPlaceholder)}
          clearable
        />
      </div>

      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>{formatMessage(launchFormMessages.launchAttributes)}</div>
        <EditableAttributeList
          attributes={localAttributes}
          onChange={handleAttributesChange}
          disabled={false}
          showButton
          newAttrMessage={formatMessage(testPlanModalMessages.addAttributes)}
          maxLength={50}
          customClass=""
          editable
          defaultOpen={false}
          getURIKey={getURIKey}
          getURIValue={getURIValue}
          isAttributeKeyRequired
          isAttributeValueRequired
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
          {formatMessage(filterSidePanelMessages.clearAllFilters)}
        </Button>
      </div>
      <div className={cx('footer-right')}>
        <Button variant="ghost" onClick={onClose} className={cx('cancel-button')}>
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

export const ManualLaunchesFilterSidePanel = memo(ManualLaunchesFilterSidePanelComponent);
