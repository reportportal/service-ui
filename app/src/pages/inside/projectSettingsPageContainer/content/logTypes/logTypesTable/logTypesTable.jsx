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

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { ActionsCell } from './cells/actionsCell';
import { ColorCell } from './cells/colorCell';
import { ColorPaletteCell } from './cells/colorPaletteCell';
import { ShowInFilterCell } from './cells/showInFilterCell';
import { messages } from '../messages';
import styles from './logTypesTable.scss';

const cx = classNames.bind(styles);

const getGridTemplateColumns = (columns) => {
  return columns.map((column) => column.width).join(' ');
};

export const LogTypesTable = ({ logTypes, isEditable }) => {
  const { formatMessage } = useIntl();

  const columns = useMemo(
    () => [
      {
        id: 'color',
        title: formatMessage(messages.color),
        component: ColorCell,
        width: '30px',
      },
      {
        id: 'name',
        title: formatMessage(messages.typeName),
        component: ({ logType }) => logType.name,
        width: 'minmax(120px, 1fr)',
      },
      {
        id: 'level',
        title: formatMessage(messages.logLevel),
        component: ({ logType }) => logType.level,
        width: 'minmax(80px, 10%)',
      },
      {
        id: 'palette',
        title: formatMessage(messages.colorPalette),
        component: ColorPaletteCell,
        width: 'minmax(128px, 200px)',
      },
      {
        id: 'filterable',
        title: formatMessage(messages.showInFilter),
        component: ShowInFilterCell,
        width: 'minmax(100px, 10%)',
      },
      ...(isEditable
        ? [
            {
              id: 'actions',
              title: null,
              component: ActionsCell,
              width: 'minmax(3%, 64px)',
            },
          ]
        : []),
    ],
    [formatMessage, isEditable],
  );

  const gridTemplateColumns = useMemo(() => getGridTemplateColumns(columns), [columns]);

  return (
    <div className={cx('log-types-table')}>
      <div className={cx('row', 'header')} style={{ gridTemplateColumns }}>
        {columns.map((column) => (
          <div key={column.id} className={cx('cell', `cell-${column.id}`)}>
            {column.title || ''}
          </div>
        ))}
      </div>
      {logTypes.map((logType) => (
        <div key={logType.id} className={cx('row', 'data')} style={{ gridTemplateColumns }}>
          {columns.map((column) => {
            const CellComponent = column.component;
            return (
              <div key={column.id} className={cx('cell', `cell-${column.id}`)}>
                <CellComponent logType={logType} isEditable={isEditable} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

LogTypesTable.propTypes = {
  logTypes: PropTypes.array.isRequired,
  isEditable: PropTypes.bool.isRequired,
};
