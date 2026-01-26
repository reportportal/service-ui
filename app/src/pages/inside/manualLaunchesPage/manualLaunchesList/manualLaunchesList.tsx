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

import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { xor } from 'es-toolkit';
import { Button, Selection, Table } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { ActionMenu } from 'components/actionMenu';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { useManualLaunchesColumns } from './hooks/useManualLaunchesColumns/useManualLaunchesColumns';
import { Launch } from '../types';
import { useManualLaunchesListRowActions } from './hooks/useManualLaunchesListRowActions';
import { useManualLaunchesTableData } from './hooks/useManualLaunchesTableData';
import { LaunchSidePanel } from '../launchSidePanel';
import { transformLaunchToManualTestCase } from '../useManualLaunches';

import styles from './manualLaunchesList.scss';

const cx = createClassnames(styles);

interface ManualLaunchesListProps {
  fullLaunches: Launch[];
}

export const ManualLaunchesList = ({ fullLaunches }: ManualLaunchesListProps) => {
  const { formatMessage } = useIntl();
  const { canDoTestCaseBulkActions } = useUserPermissions();
  const rowActions = useManualLaunchesListRowActions();
  const { primaryColumn, fixedColumns } = useManualLaunchesColumns();

  const data = useMemo(() => fullLaunches.map(transformLaunchToManualTestCase), [fullLaunches]);

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);
  const isAnyRowSelected = !isEmpty(selectedRowIds);

  const handleRowSelect = useCallback((id: number) => {
    setSelectedRowIds((selectedRows) => xor(selectedRows, [id]));
  }, []);

  const handleSelectAll = () => {
    setSelectedRowIds((prevSelectedRowIds) => {
      const currentDataIds = new Set(data.map(({ id }) => id));
      const prevSelectedRowIdsSet = new Set(prevSelectedRowIds);

      const isAllSelected = [...currentDataIds].every((rowId) => prevSelectedRowIdsSet.has(rowId));

      return isAllSelected
        ? prevSelectedRowIds.filter((selectedRowId) => !currentDataIds.has(selectedRowId))
        : [...new Set([...prevSelectedRowIds, ...currentDataIds])];
    });
  };

  const handleCloseSidePanel = useCallback(() => {
    setSelectedLaunchId(null);
  }, []);

  const manualLaunchesTableData = useManualLaunchesTableData(
    data,
    selectedLaunchId,
    setSelectedLaunchId,
  );

  return (
    <div className={cx('manual-launches-list')}>
      <Table
        selectable={canDoTestCaseBulkActions}
        selectedRowIds={selectedRowIds}
        data={manualLaunchesTableData}
        fixedColumns={fixedColumns}
        primaryColumn={primaryColumn}
        sortableColumns={[]}
        className={cx('manual-launches-list-table')}
        rowClassName={cx('manual-launches-list-table-row')}
        onToggleRowSelection={handleRowSelect}
        onToggleAllRowsSelection={handleSelectAll}
        renderRowActions={() => <ActionMenu actions={rowActions} />}
      />
      {isAnyRowSelected && (
        <div className={cx('selection')}>
          <div className={cx('selection-container')}>
            <Selection
              selectedCount={selectedRowIds.length}
              onClearSelection={() => setSelectedRowIds([])}
            />
            <div className={cx('selection-controls')}>
              <Button>{formatMessage(COMMON_LOCALE_KEYS.DELETE)}</Button>
            </div>
          </div>
        </div>
      )}
      <LaunchSidePanel
        launchId={selectedLaunchId}
        isVisible={Boolean(selectedLaunchId)}
        onClose={handleCloseSidePanel}
      />
    </div>
  );
};
