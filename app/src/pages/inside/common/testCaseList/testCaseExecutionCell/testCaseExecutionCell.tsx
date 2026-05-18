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

import type { KeyboardEvent, MouseEvent } from 'react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { MeatballMenuIcon, CoveredManuallyIcon } from '@reportportal/ui-kit';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { PopoverControl } from 'pages/common/popoverControl';
import { handleEnterOrSpaceKey, isEnterOrSpaceKey } from 'common/utils/helperUtils/eventUtils';
import { ExtendedTestCase } from 'types/testCase';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { AbsRelTime } from 'components/main/absRelTime';

import { useTooltipItems } from '../testCaseExecutionCell/useTooltipItems';
import { getIsManualCovered } from '../utils';

import styles from './testCaseExecutionCell.scss';

const cx = createClassnames(styles);

interface TestCaseExecutionCellProps {
  testCase: ExtendedTestCase;
  instanceKey: TMS_INSTANCE_KEY;
  onRowClick: () => void;
}

export const TestCaseExecutionCell = ({
  testCase,
  onRowClick,
  instanceKey,
}: TestCaseExecutionCellProps) => {
  const { formatMessage } = useIntl();
  const tooltipItems = useTooltipItems({ instanceKey, testCase });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isTestPlan = instanceKey === TMS_INSTANCE_KEY.TEST_PLAN;
  const isCoveredManually = isTestPlan && getIsManualCovered(testCase.lastExecution?.status);

  const handleExecutionKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isEnterOrSpaceKey(event)) {
      event.preventDefault();
      onRowClick();
    }
  };

  const handleTimeClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cx('execution-content')}
      onClick={onRowClick}
      onKeyDown={handleExecutionKeyDown}
    >
      <div>
        {isCoveredManually && (
          <>
            <div className={cx('covered-manually')}>
              <CoveredManuallyIcon /> {formatMessage(commonMessages.coveredManually)}
            </div>
            <AbsRelTime
              startTime={testCase.updatedAt}
              customClass={cx('execution-time', 'execution-time--full-width')}
              onClick={handleTimeClick}
            />
          </>
        )}
        {!isTestPlan && (
          <AbsRelTime
            startTime={testCase.updatedAt}
            customClass={cx('execution-time')}
            onClick={handleTimeClick}
          />
        )}
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
    </div>
  );
};
