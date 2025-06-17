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
import { PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { messages as testCaseCardMessages } from '../messages';
import styles from './testCaseExecutionCell.scss';

const cx = classNames.bind(styles);

interface TestCaseExecutionCellProps {
  lastExecution: string;
}

export const TestCaseExecutionCell = ({ lastExecution }: TestCaseExecutionCellProps) => {
  const { formatMessage } = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuItems: PopoverItem[] = [
    {
      label: formatMessage(testCaseCardMessages.duplicate),
    },
    {
      label: formatMessage(testCaseCardMessages.editTestCase),
    },
    {
      label: formatMessage(testCaseCardMessages.moveTestCaseTo),
    },
    {
      label: formatMessage(testCaseCardMessages.deleteTestCase),
      variant: 'danger',
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
