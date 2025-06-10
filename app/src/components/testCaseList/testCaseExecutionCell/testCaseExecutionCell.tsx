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
import { MeatballMenuIcon } from '@reportportal/ui-kit';
import { messages as testCaseCardMessages } from '../messages';
import styles from '../testCaseCell.scss';

const cx = classNames.bind(styles);

interface MenuItem {
  label: string;
  onClick: () => void;
  className?: string;
}

interface TestCaseExecutionCellProps {
  lastExecution: string;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: () => void;
}

export const TestCaseExecutionCell = ({
  lastExecution,
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
      onClick: onDuplicate,
    },
    {
      label: formatMessage(testCaseCardMessages.editTestCase),
      onClick: onEdit,
    },
    {
      label: formatMessage(testCaseCardMessages.moveTestCaseTo),
      onClick: onMove,
    },
    {
      label: formatMessage(testCaseCardMessages.deleteTestCase),
      onClick: onDelete,
      className: 'delete-menu-item',
    },
  ];

  return (
    <div className={cx('execution-content')}>
      <div className={cx('execution-time')}>{lastExecution}</div>
      <div className={cx('menu-section')}>
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
    </div>
  );
};
