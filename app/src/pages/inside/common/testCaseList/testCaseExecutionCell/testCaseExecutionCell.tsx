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
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { MeatballMenuIcon, CoveredManuallyIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { PopoverControl } from 'pages/common/popoverControl';
import { handleEnterOrSpaceKey } from 'common/utils/helperUtils/event.utils';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

import { useTooltipItems } from '../testCaseExecutionCell/useTooltipItems';
import { formatRelativeTime } from '../utils';

import styles from './testCaseExecutionCell.scss';

const cx = createClassnames(styles);

interface TestCaseExecutionCellProps {
  testCase: ExtendedTestCase;
  instanceKey: INSTANCE_KEYS;
  onRowClick: () => void;
}

export const TestCaseExecutionCell = ({
  testCase,
  onRowClick,
  instanceKey,
}: TestCaseExecutionCellProps) => {
  const { formatMessage, locale } = useIntl();
  const tooltipItems = useTooltipItems({ instanceKey, testCase });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isTestPlan = instanceKey === INSTANCE_KEYS.TEST_PLAN;
  // TODO: align this condition to check execution status after BE integration.
  const isCoveredManually = isTestPlan && testCase.manualScenario.executionEstimationTime > 5;

  return (
    <button type="button" className={cx('execution-content')} onClick={onRowClick}>
      <div>
        {isCoveredManually && (
          <div className={cx('covered-manually')}>
            <CoveredManuallyIcon /> {formatMessage(commonMessages.coveredManually)}
          </div>
        )}
        <div
          className={cx('execution-time', {
            'execution-time--full-width': isCoveredManually,
          })}
        >
          {formatRelativeTime(testCase.updatedAt, locale)}
        </div>
      </div>
      {!isEmpty(tooltipItems) && (
        <div
          role="menuitem"
          tabIndex={0}
          className={cx('menu-section')}
          onClick={(event) => event.stopPropagation()}
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
