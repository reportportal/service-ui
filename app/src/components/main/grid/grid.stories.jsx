/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { getTestColumns } from 'pages/inside/logsPage/logsGrid/logsGrid';
import { NestedStepHeader } from 'pages/inside/logsPage/logsGrid/nestedStepHeader';
import { Grid } from './grid';
import { SIMPLE_COLUMNS, SIMPLE_DATA, STEP_DATA } from './data';
import README from './README.md';

const getLogRowClasses = (value) => ({
  log: true,
  'error-row': value.level === 'error' || value.level === 'fatal',
  'row-console': false,
});

storiesOf('Components/Main/Grid', module)
  .addDecorator(
    host({
      title: 'Grid component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 600,
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <Grid />)
  .add('with data', () => <Grid columns={SIMPLE_COLUMNS} data={SIMPLE_DATA} />)
  .add('with selection', () => (
    <Grid columns={SIMPLE_COLUMNS} data={SIMPLE_DATA} selectable selectedItems={[SIMPLE_DATA[0]]} />
  ))
  .add('with actions', () => (
    <Grid
      columns={SIMPLE_COLUMNS}
      data={SIMPLE_DATA}
      selectedItems={[SIMPLE_DATA[0]]}
      sortingColumn="total"
      sortingDirection="asc"
      selectable
      onChangeSorting={action('changeSorting')}
      onFilterClick={action('filterClick')}
      onToggleSelectAll={action('toggleSelectAll')}
      onToggleSelection={action('toggleSelection')}
    />
  ))
  .add('with log data', () => (
    <Grid
      columns={getTestColumns()}
      data={STEP_DATA}
      rowClassMapper={getLogRowClasses}
      nestedStepHeader={NestedStepHeader}
      nestedView
    />
  ));
