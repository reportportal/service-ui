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

import { useState } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { PopoverControl } from 'pages/common/popoverControl';
import { TestCase } from '../types';
import { messages as testCaseCardMessages } from '../messages';
import styles from '../testCaseCell.scss';

const cx = classNames.bind(styles);

interface MenuItem {
  label: string;
  onClick: () => void;
  className?: string;
}

interface TestCaseExecutionCellProps {
  testCase: TestCase;
  onEdit?: (testCase: TestCase) => void;
  onDelete?: (testCase: TestCase) => void;
  onDuplicate?: (testCase: TestCase) => void;
  onMove?: (testCase: TestCase) => void;
}

export const TestCaseExecutionCell = ({
  testCase: testCaseData,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
}: TestCaseExecutionCellProps) => {
  const { formatMessage } = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuItems: MenuItem[] = [
    {
      label: formatMessage(testCaseCardMessages.duplicate),
      onClick: () => onDuplicate?.(testCaseData),
    },
    {
      label: formatMessage(testCaseCardMessages.editTestCase),
      onClick: () => onEdit?.(testCaseData),
    },
    {
      label: formatMessage(testCaseCardMessages.moveTestCaseTo),
      onClick: () => onMove?.(testCaseData),
    },
    {
      label: formatMessage(testCaseCardMessages.deleteTestCase),
      onClick: () => onDelete?.(testCaseData),
      className: 'delete-menu-item',
    },
  ];

  return (
    <div className={cx('execution-content')}>
      <div className={cx('execution-time')}>{testCaseData.lastExecution}</div>
      <div className={cx('menu-section')}>
        <PopoverControl
          items={menuItems}
          placement="bottom-end"
          isOpened={isMenuOpen}
          setIsOpened={setIsMenuOpen}
        >
          <button type="button" className={cx('dots-menu-trigger')}>
            ⋯
          </button>
        </PopoverControl>
      </div>
    </div>
  );
};
