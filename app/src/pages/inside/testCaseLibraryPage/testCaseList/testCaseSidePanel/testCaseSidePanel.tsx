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
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { Button, MeatballMenuIcon } from '@reportportal/ui-kit';
import { useOnClickOutside } from 'common/hooks';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { TestCase } from '../../types';
import { messages } from './messages';
import styles from './testCaseSidePanel.scss';

const cx = classNames.bind(styles);

interface TestCaseSidePanelProps {
  testCase: TestCase | null;
  isVisible: boolean;
  onClose: () => void;
}

export const TestCaseSidePanel = memo(
  ({ testCase, isVisible, onClose }: TestCaseSidePanelProps) => {
    const { formatMessage } = useIntl();
    const sidePanelRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(sidePanelRef, onClose);

    if (!isVisible || !testCase) {
      return null;
    }

    const handleThreeDotsClick = () => {
      // TODO: Implement three dots menu functionality
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

        <div className={cx('content')}>{/* TODO: Add test case details content here */}</div>

        <div className={cx('footer')}>
          <Button
            variant="ghost"
            icon={<MeatballMenuIcon />}
            className={cx('action-button', 'more-actions-button')}
            onClick={handleThreeDotsClick}
            data-automation-id="test-case-more-actions"
          />
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
