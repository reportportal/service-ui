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

import { Button, Selection, Table } from '@reportportal/ui-kit';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useManualLaunchesColumns } from './hooks/useManualLaunchesColumns/useManualLaunchesColumns';
import classNames from 'classnames/bind';
import styles from './manualLaunchesList.scss';
import { ActionMenu } from 'components/actionMenu';
import { useState } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { xor } from 'es-toolkit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ManualTestCase } from '../manualLaunchesPage.types';
import { useIntl } from 'react-intl';
import { useManualLaunchesListRowActions } from './hooks/useManualLaunchesListRowActions';
import { useManualLaunchesTableData } from './hooks/useManualLaunchesTableData';

const cx = classNames.bind(styles) as typeof classNames;

export const ManualLaunchesList = ({ data }: { data: ManualTestCase[] }) => {
  const { formatMessage } = useIntl();
  const { canDoTestCaseBulkActions } = useUserPermissions();
  const rowActions = useManualLaunchesListRowActions();
  const { primaryColumn, fixedColumns } = useManualLaunchesColumns();
  const manualLaunchesTableData = useManualLaunchesTableData(data);

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const isAnyRowSelected = !isEmpty(selectedRowIds);

  const handleRowSelect = (id: number) => {
    setSelectedRowIds((selectedRows) => xor(selectedRows, [id]));
  };

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

  return (
    <div className={cx('manual-launches-list')}>
      <Table
        selectable={canDoTestCaseBulkActions}
        onToggleRowSelection={handleRowSelect}
        selectedRowIds={selectedRowIds}
        data={manualLaunchesTableData}
        fixedColumns={fixedColumns}
        primaryColumn={primaryColumn}
        sortableColumns={[]}
        onToggleAllRowsSelection={handleSelectAll}
        className={cx('manual-launches-list-table')}
        rowClassName={cx('manual-launches-list-table-row')}
        renderRowActions={() => <ActionMenu actions={rowActions} />}
      />
      {isAnyRowSelected && (
        <div className={cx('selection')}>
          <Selection
            selectedCount={selectedRowIds.length}
            onClearSelection={() => setSelectedRowIds([])}
          />
          <div className={cx('selection-controls')}>
            <Button>{formatMessage(COMMON_LOCALE_KEYS.DELETE)}</Button>
          </div>
        </div>
      )}
    </div>
  );
};
