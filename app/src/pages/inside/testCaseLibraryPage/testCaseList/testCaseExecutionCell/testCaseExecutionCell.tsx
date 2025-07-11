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

import { KeyboardEvent, useState } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { PopoverControl } from 'pages/common/popoverControl';
import { MeatballMenuIcon } from '@reportportal/ui-kit';
import { formatRelativeTime } from '../utils';
import { createTestCaseMenuItems } from '../constants';
import { TestCaseMenuAction } from '../types';
import styles from './testCaseExecutionCell.scss';

const cx = classNames.bind(styles);

interface TestCaseExecutionCellProps {
  lastExecution: number;
  onRowClick: () => void;
}

export const TestCaseExecutionCell = ({
  lastExecution,
  onRowClick,
}: TestCaseExecutionCellProps) => {
  const { formatMessage } = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuItems = createTestCaseMenuItems(formatMessage, [TestCaseMenuAction.HISTORY]);

  const handleMenuOpen = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <button type="button" className={cx('execution-content')} onClick={onRowClick}>
      <div className={cx('execution-time')}>{formatRelativeTime(lastExecution)}</div>
      <div
        role="menuitem"
        tabIndex={0}
        className={cx('menu-section')}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleMenuOpen}
      >
        <PopoverControl
          items={menuItems}
          placement="bottom-end"
          isOpened={isMenuOpen}
          setIsOpened={setIsMenuOpen}
        >
          <button type="button" className={cx('dots-menu-trigger')}>
            <MeatballMenuIcon />
          </button>
        </PopoverControl>
      </div>
    </button>
  );
};
