/*
 * Copyright 2019 EPAM Systems
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

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';

import { Grid } from './grid';
import { SIMPLE_COLUMNS, SIMPLE_DATA } from './data';
import README from './README.md';

// const getLogRowClasses = (value) => ({
//   log: true,
//   'error-row': value.level === 'error' || value.level === 'fatal',
//   'row-console': false,
// });

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
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
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
  )); /*
  .add('with log data', () => (
    <Grid
      columns={getTestColumns()}
      data={STEP_DATA}
      rowClassMapper={getLogRowClasses}
      nestedStepHeader={NestedStepHeader}
      nestedView
    />
  )) */
