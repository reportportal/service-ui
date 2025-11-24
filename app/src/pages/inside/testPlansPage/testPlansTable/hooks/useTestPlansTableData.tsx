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
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { TestPlanDto } from 'controllers/testPlan';
import { isEnterOrSpaceKey } from 'common/utils/helperUtils/eventUtils';

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
  selectedTestPlanId: number | null;
  setSelectedTestPlanId: (id: number | null) => void;
}

export const useTestPlansTableData = ({
  testPlans,
  onEdit,
  onDuplicate,
  onDelete,
}: UseTestPlansTableDataProps): UseTestPlansTableDataReturn => {
  const { formatNumber } = useIntl();
  const [selectedTestPlanId, setSelectedTestPlanId] = useState<number | null>(null);

  const data = useMemo(
    () =>
      testPlans?.map(({ id, name, executionStatistic: { total = 0, covered = 0 } }) => {
        const coverage = total === 0 ? 0 : covered / total;
        const isSelected = id === selectedTestPlanId;

        const handleRowClick = () => setSelectedTestPlanId(id);
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (isEnterOrSpaceKey(e)) {
            e.preventDefault();
            handleRowClick();
          }
        };

        const cellProps = {
          isSelected,
          onClick: handleRowClick,
          onKeyDown: handleKeyDown,
        };

        return {
          id,
          testPlanName: {
            content: name,
            component: <ClickableCell {...cellProps}>{name}</ClickableCell>,
          },
          coveredTotal: {
            content: `${covered} / ${total}`,
            component: <ClickableCell {...cellProps}>{`${covered} / ${total}`}</ClickableCell>,
          },
          coverage: {
            content: coverage,
            component: (
              <ClickableCell {...cellProps}>
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
              <ClickableCell {...cellProps}>
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
    [testPlans, selectedTestPlanId, onEdit, onDuplicate, onDelete, formatNumber],
  );

  return {
    data,
    selectedTestPlanId,
    setSelectedTestPlanId,
  };
};
