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
import { MeatballMenuIcon, CoveredManuallyIcon } from '@reportportal/ui-kit';

import { PopoverControl } from 'pages/common/popoverControl';
import { handleEnterOrSpaceKey } from 'common/utils/helperUtils/event.utils';
import { useTooltipItems } from 'pages/inside/common/testCaseList/testCaseExecutionCell/useTooltipItems';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';

import { formatRelativeTime } from '../utils';
import { messages } from '../messages';

import styles from './testCaseExecutionCell.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface TestCaseExecutionCellProps {
  testCaseId: number;
  lastExecution: number;
  instanceKey: INSTANCE_KEYS;
  onRowClick: () => void;
  onEdit?: (testCaseId: number) => void;
}

export const TestCaseExecutionCell = ({
  testCaseId,
  lastExecution,
  onRowClick,
  instanceKey,
  onEdit,
}: TestCaseExecutionCellProps) => {
  const { formatMessage, locale } = useIntl();
  const tooltipItems = useTooltipItems({ instanceKey, testCaseId, onEdit });
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <button type="button" className={cx('execution-content')} onClick={onRowClick}>
      <div>
        {instanceKey === INSTANCE_KEYS.TEST_PLAN && (
          <div className={cx('covered-manually')}>
            <CoveredManuallyIcon /> {formatMessage(messages.coveredManually)}
          </div>
        )}
        <div
          className={cx('execution-time', {
            'execution-time--full-width': instanceKey === INSTANCE_KEYS.TEST_PLAN,
          })}
        >
          {formatRelativeTime(lastExecution, locale)}
        </div>
      </div>
      {!isEmpty(tooltipItems) && (
        <div
          role="menuitem"
          tabIndex={0}
          className={cx('menu-section')}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleEnterOrSpaceKey}
        >
          <PopoverControl
            items={tooltipItems}
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
