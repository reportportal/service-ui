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

import { useMemo, useState } from 'react';
import { noop } from 'es-toolkit';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { Table } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { getDashboardItemPageLinkSelector } from 'controllers/dashboard';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NavLink } from 'components/main/navLink';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import { LockedIcon } from 'pages/inside/common/lockedIcon';

import { DashboardActionHandlers, DashboardItem } from '../../types';
import { EmptyDashboards } from '../EmptyDashboards';
import { DashboardActions } from '../dashboardActions';
import { messages } from './messages';

import styles from './dashboardTable.scss';

const cx = createClassnames(styles);

const OWNER_COLUMN_WIDTH_PX = 208;

interface DashboardTableProps {
  dashboardItems?: DashboardItem[];
  loading?: boolean;
  filter?: string;
  onAddItem?: () => void;
  onEditItem?: DashboardActionHandlers['onEdit'];
  onDeleteItem?: DashboardActionHandlers['onDelete'];
  onDuplicate?: DashboardActionHandlers['onDuplicate'];
}

export const DashboardTable = ({
  dashboardItems = [],
  loading = false,
  filter = '',
  onAddItem = noop,
  onEditItem = noop,
  onDeleteItem = noop,
  onDuplicate = noop,
}: DashboardTableProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const getLink = useSelector(getDashboardItemPageLinkSelector);
  const [expandedRowIds, setExpandedRowIds] = useState<(string | number)[]>([]);

  const toggleRowExpansion = (id: string | number) =>
    setExpandedRowIds((ids) =>
      ids.includes(id) ? ids.filter((rowId) => rowId !== id) : [...ids, id],
    );

  const data = useMemo(
    () =>
      dashboardItems.map((item) => {
        const { id, name, description, owner, locked } = item;
        const isExpanded = expandedRowIds.includes(id);

        return {
          id,
          metaData: item,
          name: {
            content: name,
            component: (
              <div className={cx('name-column')}>
                <div className={cx('name-cell')}>
                  {locked && (
                    <LockedDashboardTooltip locked={locked}>
                      {/* TODO: replace with the locked indicator icon from Figma */}
                      <LockedIcon />
                    </LockedDashboardTooltip>
                  )}
                  <NavLink
                    className={cx('name')}
                    to={getLink(id)}
                    title={name}
                    onClick={() => trackEvent(DASHBOARD_EVENTS.clickOnDashboardName(id))}
                  >
                    {name}
                  </NavLink>
                </div>
                {isExpanded && <p className={cx('description')}>{description}</p>}
              </div>
            ),
          },
          owner,
        };
      }),
    [dashboardItems, expandedRowIds, getLink, trackEvent],
  );

  const primaryColumn = {
    key: 'name',
    header: formatMessage(messages.dashboardName),
    width: 1,
    align: 'left' as const,
  };

  const fixedColumns = [
    {
      key: 'owner',
      header: formatMessage(messages.owner),
      width: OWNER_COLUMN_WIDTH_PX,
      align: 'left' as const,
    },
  ];

  if (loading) {
    return <SpinningPreloader />;
  }

  if (!dashboardItems.length) {
    return <EmptyDashboards filter={filter} action={onAddItem} />;
  }

  return (
    <Table
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      sortableColumns={[]}
      className={cx('dashboard-table')}
      rowClassName={cx('dashboard-table__row')}
      headerClassName={cx('dashboard-table__header')}
      isRowsExpandable
      isExpandAllVisible={false}
      expandedRowIds={expandedRowIds}
      canExpandRow={({ metaData }) => Boolean(metaData?.description)}
      onToggleRowExpansion={toggleRowExpansion}
      renderRowActions={(metaData) =>
        metaData ? (
          <DashboardActions
            item={metaData as DashboardItem}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onDuplicate={onDuplicate}
          />
        ) : null
      }
    />
  );
};
