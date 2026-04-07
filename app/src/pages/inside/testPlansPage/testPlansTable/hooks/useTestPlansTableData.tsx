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

import { RowData } from '@reportportal/ui-kit/components/table/types';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { TestPlanDto } from 'controllers/testPlan';

import { ProgressBar } from '../progressBar';
import { TestPlanActions } from '../../testPlanActions';
import { ClickableCell } from '../clickableCell';

import styles from '../testPlansTable.scss';

const cx = createClassnames(styles);

interface UseTestPlansTableDataProps {
  testPlans: TestPlanDto[];
  onEdit: (testPlanId: number) => void;
  onDuplicate: (testPlanId: number) => void;
  onDelete: (testPlanId: number) => void;
}

interface UseTestPlansTableDataReturn {
  data: RowData[];
}

export const useTestPlansTableData = ({
  testPlans,
  onEdit,
  onDuplicate,
  onDelete,
}: UseTestPlansTableDataProps): UseTestPlansTableDataReturn => {
  const { formatNumber } = useIntl();

  const data = useMemo(
    () =>
      testPlans?.map(({ id, name, executionStatistic }) => {
        const total = executionStatistic?.total ?? 0;
        const covered = executionStatistic?.covered ?? 0;
        const coverage = total === 0 ? 0 : covered / total;

        const cellProps = {
          isSelected: false,
        };

        const ratioContent = `${covered} / ${total}`;

        return {
          id,
          testPlanName: {
            content: name,
            component: <ClickableCell {...cellProps}>{name}</ClickableCell>,
          },
          coveredTotal: {
            content: ratioContent,
            component: (
              <ClickableCell {...cellProps}>
                <span className={cx('test-plans__coverage-ratio')}>{ratioContent}</span>
              </ClickableCell>
            ),
          },
          coverage: {
            content: coverage,
            component: (
              <ClickableCell
                {...cellProps}
                contentClassName={cx('test-plans__coverage-cell-wrapper')}
              >
                <div className={cx('test-plans__table-cell-coverage')}>
                  {formatNumber(coverage, {
                    style: 'percent',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </ClickableCell>
            ),
          },
          progressBar: {
            content: coverage,
            component: (
              <ClickableCell {...cellProps} contentClassName={cx('test-plans__cell-content_progress')}>
                <ProgressBar progress={coverage * 100} />
              </ClickableCell>
            ),
          },
          options: {
            component: (
              <TestPlanActions
                testPlanId={id}
                variant="table"
                onEdit={() => onEdit(id)}
                onDuplicate={() => onDuplicate(id)}
                onDelete={() => onDelete(id)}
              />
            ),
          },
        };
      }) ?? [],
    [testPlans, onEdit, onDuplicate, onDelete, formatNumber],
  );

  return {
    data,
  };
};
