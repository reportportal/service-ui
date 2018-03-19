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
import { Grid } from './grid';
import { ALIGN_CENTER } from './constants';

const COLUMNS = [{
  title: { full: 'name' },
  formatter: ({ name }) => name,
}, {
  title: { full: 'total' },
  align: ALIGN_CENTER,
  formatter: ({ total }) => total,
  sortable: true,
  name: 'total',
  withFilter: true,
}, {
  title: { full: 'passed' },
  align: ALIGN_CENTER,
  formatter: ({ passed }) => passed,
  sortable: true,
  name: 'passed',
  withFilter: true,
}, {
  title: { full: 'failed' },
  align: ALIGN_CENTER,
  formatter: ({ failed }) => failed,
}, {
  title: { full: 'skipped' },
  align: ALIGN_CENTER,
  formatter: ({ skipped }) => skipped,
}];

const DATA = [{
  name: 'foo 1',
  description: 'some description',
  total: 100,
  passed: 70,
  failed: 25,
  skipped: 5,
}, {
  name: 'foo 2',
  description: 'another description',
  total: 10,
  passed: 7,
  failed: 2,
  skipped: 1,
}];

storiesOf('Components/Main/Grid', module)
  .addDecorator(host({
    title: 'Grid component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 600,
    width: '100%',
  }))
  .add('default state', () => (
    <Grid />
  ))
  .add('with data', () => (
    <Grid
      columns={COLUMNS}
      data={DATA}
    />
  ))
  .add('with actions', () => (
    <Grid
      columns={COLUMNS}
      data={DATA}
      sortingColumn="total"
      sortingDirection="asc"
      onChangeSorting={action('changeSorting')}
      onFilterClick={action('filterClick')}
    />
  ));
