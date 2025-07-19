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
import { TestPlan } from './types';
import { messages } from './messages';

import styles from './testPlansTable.scss';

const cx = classNames.bind(styles);

interface TestPlansTableProps {
  testPlans: TestPlan[];
}

export const TestPlansTable = ({ testPlans }: TestPlansTableProps) => {
  const { formatMessage } = useIntl();

  const currentTestPlans = testPlans.map(({ name, coverage, total, covered }) => ({
    id: name,
    testPlanName: name,
    coveredTotal: `${covered} / ${total}`,
    coverage: {
      component: <div className={cx('test-plans__table-cell-coverage')}>{coverage}%</div>,
    },
    progressBar: {
      component: <ProgressBar progress={coverage} />,
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
  }));

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
      align: 'center' as const,
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
