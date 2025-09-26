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
import { isEmpty } from 'es-toolkit/compat';
import { PopoverControl } from 'pages/common/popoverControl';
import { MeatballMenuIcon } from '@reportportal/ui-kit';
import { handleEnterOrSpaceKey } from 'common/utils/helperUtils/event.utils';

import { useUserPermissions } from 'hooks/useUserPermissions';
import { formatRelativeTime, getExcludedActionsFromPermissionMap } from '../utils';
import { createTestCaseMenuItems } from '../configUtils';
import { TestCaseMenuAction } from '../types';
import styles from './testCaseExecutionCell.scss';

const cx = classNames.bind(styles);

interface TestCaseExecutionCellProps {
  lastExecution: number;
  onRowClick: () => void;
  onEditTestCase: () => void;
}

export const TestCaseExecutionCell = ({
  lastExecution,
  onRowClick,
  onEditTestCase,
}: TestCaseExecutionCellProps) => {
  const { formatMessage, locale } = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { canDeleteTestCase, canDuplicateTestCase, canEditTestCase, canMoveTestCase } =
    useUserPermissions();

  const permissionMap = [
    { isAllowed: canDuplicateTestCase, action: TestCaseMenuAction.DUPLICATE },
    { isAllowed: canEditTestCase, action: TestCaseMenuAction.EDIT },
    { isAllowed: canMoveTestCase, action: TestCaseMenuAction.MOVE },
    { isAllowed: canDeleteTestCase, action: TestCaseMenuAction.DELETE },
  ];

  const menuItems = createTestCaseMenuItems(
    formatMessage,
    {
      [TestCaseMenuAction.EDIT]: onEditTestCase,
    },
    getExcludedActionsFromPermissionMap(permissionMap),
  );

  return (
    <button type="button" className={cx('execution-content')} onClick={onRowClick}>
      <div className={cx('execution-time')}>{formatRelativeTime(lastExecution, locale)}</div>
      {!isEmpty(menuItems) && (
        <div
          role="menuitem"
          tabIndex={0}
          className={cx('menu-section')}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleEnterOrSpaceKey}
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
      )}
    </button>
  );
};
