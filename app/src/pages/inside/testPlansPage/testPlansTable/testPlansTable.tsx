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

import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Table, ChevronRightBreadcrumbsIcon } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ProgressBar } from './progressBar';
import { Options } from './options';
import { TestPlanDto } from 'controllers/testPlan';
import { messages } from './messages';

import styles from './testPlansTable.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface TestPlansTableProps {
  testPlans: TestPlanDto[];
}

export const TestPlansTable = ({ testPlans }: TestPlansTableProps) => {
  const { formatMessage, formatNumber } = useIntl();

  const currentTestPlans = testPlans.map(
    ({ id, name, totalTestCases = 0, coveredTestCases = 0 }) => {
      const coverage = totalTestCases === 0 ? 0 : coveredTestCases / totalTestCases;

      return {
        id,
        testPlanName: name,
        coveredTotal: `${coveredTestCases} / ${totalTestCases}`,
        coverage: {
          component: (
            <div className={cx('test-plans__table-cell-coverage')}>
              {formatNumber(coverage, {
                style: 'percent',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </div>
          ),
        },
        progressBar: {
          component: <ProgressBar progress={coverage * 100} />,
        },
        options: {
          component: <Options />,
        },
        icon: {
          component: (
            <div className={cx('test-plans__table-cell-icon')}>
              <ChevronRightBreadcrumbsIcon />
            </div>
          ),
        },
      };
    },
  );

  const primaryColumn = {
    key: 'testPlanName',
    header: formatMessage(COMMON_LOCALE_KEYS.NAME),
    width: 520,
    align: 'left' as const,
  };

  const fixedColumns = [
    {
      key: 'coveredTotal',
      header: formatMessage(messages.coveredTotal),
      width: 120,
      align: 'center' as const,
    },
    {
      key: 'progressBar',
      header: '',
      width: 120,
      align: 'center' as const,
    },
    {
      key: 'coverage',
      header: formatMessage(messages.coverage),
      width: 70,
      align: 'left' as const,
    },
    {
      key: 'options',
      header: '',
      width: 60,
      align: 'center' as const,
    },
    {
      key: 'icon',
      header: '',
      width: 50,
      align: 'center' as const,
    },
  ];

  return (
    <div className={cx('test-plans__table-container')}>
      <Table
        data={currentTestPlans}
        fixedColumns={fixedColumns}
        primaryColumn={primaryColumn}
        sortableColumns={[]}
        className={cx('test-plans__table')}
        rowClassName={cx('test-plans__table-row')}
      />
    </div>
  );
};
