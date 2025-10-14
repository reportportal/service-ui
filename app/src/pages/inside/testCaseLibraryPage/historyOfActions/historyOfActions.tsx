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
import { Table } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SettingsLayout } from 'layouts/settingsLayout';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { AbsRelTime } from 'components/main/absRelTime';

import { HistoryOfActionsHeader } from './historyOfActionsHeader';
import { historyOfActions } from './mockData';
import { messages } from './messages';

import styles from './historyOfActions.scss';

const cx = createClassnames(styles);

export const HistoryOfActions = () => {
  const { formatMessage } = useIntl();
  const [expandedRows, setExpandedRows] = useState<Set<number | string>>(new Set([]));
  // Temporary name. Need to get it in response.
  const testCaseName = '24.2 PV';

  const currentHistory = historyOfActions.map(
    ({ time, user: { name, id }, action, oldValue, newValue }) => ({
      id: time,
      time: {
        component: time ? (
          <AbsRelTime startTime={time} customClass={cx('history-of-actions__table-cell-time')} />
        ) : (
          <span>n/a</span>
        ),
      },
      user: {
        component: (
          <div className={cx('history-of-actions__table-cell-user')}>
            {id ? (
              <UserAvatar
                className={cx('history-of-actions__table-cell-user-avatar')}
                userId={id}
                thumbnail
              />
            ) : (
              <div className={cx('history-of-actions__table-cell-user-avatar--template')}>
                {name[0]}
              </div>
            )}
            <span>{name}</span>
          </div>
        ),
      },
      action,
      oldValue: {
        content: oldValue || '-',
      },
      newValue: {
        content: newValue || '-',
      },
    }),
  );

  const primaryColumn = {
    key: 'time',
    header: formatMessage(messages.time),
    width: 100,
    align: 'left' as const,
  };

  const fixedColumns = [
    {
      key: 'user',
      header: formatMessage(messages.user),
      width: 225,
      align: 'left' as const,
    },
    {
      key: 'action',
      header: formatMessage(messages.action),
      width: 160,
      align: 'left' as const,
    },
    {
      key: 'oldValue',
      header: formatMessage(messages.oldValue),
      width: 330,
      align: 'left' as const,
    },
    {
      key: 'newValue',
      header: formatMessage(messages.newValue),
      width: 330,
      align: 'left' as const,
    },
  ];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired={false}>
        <div className={cx('history-of-actions')}>
          <HistoryOfActionsHeader
            testCaseName={testCaseName}
            className={cx('history-of-actions__header')}
          />
          <div className={cx('history-of-actions__main-content')}>
            <Table
              data={currentHistory}
              fixedColumns={fixedColumns}
              primaryColumn={primaryColumn}
              sortableColumns={[]}
              className={cx('history-of-actions__table')}
              rowClassName={cx('history-of-actions__table-row')}
              isRowsExpandable
              setExpandedRowIds={setExpandedRows}
              expandedRowIds={[...expandedRows]}
              onToggleRowExpansion={(id) => {
                const newExpandedRows = new Set(expandedRows);
                if (newExpandedRows.has(id)) {
                  newExpandedRows.delete(id);
                } else {
                  newExpandedRows.add(id);
                }
                setExpandedRows(newExpandedRows);
              }}
            />
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
