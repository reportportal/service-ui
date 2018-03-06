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
import { FilterTableItem } from './filterTableItem';
import README from './README.md';

storiesOf('Pages/inside/filtersPage/filterTableItem', module)
  .addDecorator(host({
    title: 'Filter table item component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 'auto',
    width: '80%',
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <FilterTableItem />
  ))
  .add('with data', () => (
    <FilterTableItem
      name="Filter Name 1"
      description="Description to this filter"
      options="(Launch name contains Demo) sorted by:  Start time"
      owner="Superadmin"
      showOnLaunches
      shared
      editable
    />
  ))
  .add('with extreme data', () => (
    <FilterTableItem
      name="VeryLongFilterName_VeryLongFilterName_VeryLongFilterName"
      description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos explicabo id illo incidunt ipsam obcaecati quaerat quia reprehenderit sint veritatis! Ab consectetur dicta earum expedita laudantium omnis quis repellendus, velit."
      options="(Launch name contains Demo) sorted by:  Start time, (Launch name contains Demo) sorted by:  Start time, (Launch name contains Demo) sorted by:  Start time"
      owner="UserWithVeryLongName_UserWithVeryLongName_UserWithVeryLongName"
      showOnLaunches
      shared
      editable
    />
  ))
  .add('with actions', () => (
    <FilterTableItem
      name="Filter Name 1"
      description="Description to this filter"
      options="(Launch name contains Demo) sorted by:  Start time"
      owner="Superadmin"
      showOnLaunches
      shared
      editable
      onClickName={action('Clicked filter name')}
      onEdit={action('Edit filter clicked')}
      onChangeDisplay={action('Changed displaying on launches')}
      onDelete={action('Clicked delete filter')}
    />
  ))
;
