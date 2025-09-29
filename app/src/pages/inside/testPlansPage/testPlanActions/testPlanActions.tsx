/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
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
import { compact, noop } from 'es-toolkit';
import { MeatballMenuIcon, Button } from '@reportportal/ui-kit';

import { useUserPermissions } from 'hooks/useUserPermissions';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl';

import { commonMessages } from '../commonMessages';

import styles from './testPlanActions.scss';

const cx = classNames.bind(styles) as typeof classNames;

type ActionFn = (testPlanId: string | number) => void;

export interface TestPlanActionsProps {
  testPlanId: string | number;
  variant?: 'table' | 'header';
  onEdit?: ActionFn;
  onDuplicate?: ActionFn;
  onDelete?: ActionFn;
}

export const TestPlanActions = ({
  testPlanId,
  variant = 'table',
  onEdit = noop,
  onDuplicate = noop,
  onDelete = noop,
}: TestPlanActionsProps) => {
  const { formatMessage } = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { canEditTestPlan, canDuplicateTestPlan, canDeleteTestPlan } = useUserPermissions();

  const isHeader = variant === 'header';
  const menuItems: PopoverItem[] = compact([
    canEditTestPlan && {
      label: formatMessage(commonMessages.editTestPlan),
      onClick: () => onEdit(testPlanId),
    },
    canDuplicateTestPlan && {
      label: formatMessage(commonMessages.duplicateTestPlan),
      onClick: () => onDuplicate(testPlanId),
    },
    canDeleteTestPlan && {
      label: formatMessage(commonMessages.deleteTestPlan),
      variant: 'danger',
      onClick: () => onDelete(testPlanId),
    },
  ]);

  if (isEmpty(menuItems)) {
    return null;
  }

  return (
    <div className={cx('test-plan-actions__wrapper')}>
      <PopoverControl
        items={menuItems}
        placement="bottom-end"
        isOpened={isMenuOpen}
        setIsOpened={setIsMenuOpen}
      >
        {isHeader ? (
          <Button
            variant="ghost"
            className={cx('test-plan-actions__header-trigger')}
            data-automation-id="testPlanOptionsButton"
          >
            <MeatballMenuIcon />
          </Button>
        ) : (
          <button type="button" className={cx('test-plan-actions__table-trigger')}>
            <MeatballMenuIcon />
          </button>
        )}
      </PopoverControl>
    </div>
  );
};
