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

import { memo, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { Button, EditIcon, MeatballMenuIcon, Tooltip } from '@reportportal/ui-kit';
import { useOnClickOutside } from 'common/hooks';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { PopoverControl } from 'pages/common/popoverControl';
import { CollapsibleSection } from 'components/collapsibleSection';
import { PathBreadcrumb } from 'componentLibrary/breadcrumbs/pathBreadcrumb';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { TagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import isEmpty from 'lodash.isempty';
import { TestCase } from '../../types';
import { formatTimestamp, formatDuration } from '../utils';
import { createTestCaseMenuItems } from '../constants';
import { mockedTestCaseDescription } from '../mockData';
import { mockedStepsData } from './mocks';
import { StepsList } from './stepsList';
import { messages } from './messages';
import styles from './testCaseSidePanel.scss';

const cx = classNames.bind(styles);

const COLLAPSIBLE_SECTIONS_CONFIG = (tags: string[]) =>
  [
    {
      titleKey: 'tagsTitle',
      defaultMessageKey: 'noTagsAdded',
      childComponent: isEmpty(tags) ? null : (
        <TagList tags={tags} isFullWidthMode isShowAllView defaultVisibleLines={2} />
      ),
    },
    {
      titleKey: 'scenarioTitle',
      defaultMessageKey: 'noDetailsForScenario',
      childComponent: null,
    },
    {
      titleKey: 'stepTitle',
      defaultMessageKey: 'noStepsAdded',
      childComponent: isEmpty(mockedStepsData) ? null : <StepsList steps={mockedStepsData} />,
    },
    {
      titleKey: 'descriptionTitle',
      defaultMessageKey: 'descriptionNotSpecified',
      childComponent: (
        <ExpandedTextSection
          text={mockedTestCaseDescription}
          defaultVisibleLines={5}
          fontSize={13}
        />
      ),
    },
  ] as const;

interface TestCaseSidePanelProps {
  testCase: TestCase | null;
  isVisible: boolean;
  onClose: () => void;
}

export const TestCaseSidePanel = memo(
  ({ testCase, isVisible, onClose }: TestCaseSidePanelProps) => {
    const { formatMessage } = useIntl();
    const sidePanelRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useOnClickOutside(sidePanelRef, onClose);

    if (!isVisible || !testCase) {
      return null;
    }

    const menuItems = createTestCaseMenuItems(formatMessage);

    const handleThreeDotsClick = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    const handleOpenDetailsClick = () => {
      // TODO: Implement open details functionality
    };

    const handleAddToLaunchClick = () => {
      // TODO: Implement add to launch functionality
    };

    const handleAddToTestPlanClick = () => {
      // TODO: Implement add to test plan functionality
    };

    return (
      <div ref={sidePanelRef} className={cx('test-case-side-panel')}>
        <div className={cx('header')}>
          <div className={cx('header-top')}>
            <div className={cx('test-case-name')}>
              <PriorityIcon priority={testCase.priority} className={cx('priority-icon')} />
              <span className={cx('test-name')}>{testCase.name}</span>
            </div>
            <button
              type="button"
              className={cx('close-button')}
              onClick={onClose}
              aria-label={formatMessage(messages.closePanel)}
              data-automation-id="close-test-case-panel"
            >
              {Parser(CrossIcon)}
            </button>
          </div>

          <PathBreadcrumb path={testCase.path} />

          <div className={cx('header-meta')}>
            <div className={cx('meta-row')}>
              <div className={cx('meta-item-row')}>
                <span className={cx('meta-label')}>ID:</span>
                <span className={cx('meta-value')}>{testCase.id}</span>
              </div>
              <div className={cx('meta-item-row')}>
                <span className={cx('meta-label')}>Created:</span>
                <span className={cx('meta-value')}>{formatTimestamp(testCase.created)}</span>
              </div>
            </div>
            <div className={cx('meta-row')}>
              {!!testCase.lastExecution && (
                <div className={cx('meta-item-row')}>
                  <EditIcon />
                  <span className={cx('meta-value')}>
                    {formatTimestamp(testCase.lastExecution)}
                  </span>
                </div>
              )}
              {!!testCase.durationTime && (
                <div className={cx('meta-item-row')}>
                  <EditIcon />
                  <span className={cx('meta-value')}>{formatDuration(testCase.durationTime)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cx('content')}>
          {COLLAPSIBLE_SECTIONS_CONFIG(testCase.tags).map(
            ({ titleKey, defaultMessageKey, childComponent }) => (
              <CollapsibleSection
                key={titleKey}
                title={formatMessage(messages[titleKey])}
                defaultMessage={formatMessage(messages[defaultMessageKey])}
                childComponent={childComponent}
              />
            ),
          )}
        </div>

        <div className={cx('footer')}>
          <PopoverControl
            items={menuItems}
            placement="bottom-end"
            isOpened={isMenuOpen}
            setIsOpened={setIsMenuOpen}
          >
            <Tooltip placement="top" content={formatMessage(messages.moreActionsTooltip)}>
              <Button
                variant="ghost"
                icon={<MeatballMenuIcon />}
                className={cx('action-button', 'more-actions-button')}
                onClick={handleThreeDotsClick}
                data-automation-id="test-case-more-actions"
              />
            </Tooltip>
          </PopoverControl>
          <Button
            variant="ghost"
            className={cx('action-button')}
            onClick={handleOpenDetailsClick}
            data-automation-id="test-case-open-details"
          >
            {formatMessage(messages.openDetails)}
          </Button>
          <Button
            variant="ghost"
            className={cx('action-button')}
            onClick={handleAddToLaunchClick}
            data-automation-id="test-case-add-to-launch"
          >
            {formatMessage(messages.addToLaunch)}
          </Button>
          <Button
            variant="primary"
            className={cx('action-button', 'last-button')}
            onClick={handleAddToTestPlanClick}
            data-automation-id="test-case-add-to-test-plan"
          >
            {formatMessage(messages.addToTestPlan)}
          </Button>
        </div>
      </div>
    );
  },
);
