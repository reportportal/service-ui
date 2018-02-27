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
import { PaginationToolbar } from './paginationToolbar';

storiesOf('Components/Main/PaginationToolbar', module)
  .addDecorator(host({
    title: 'Pagination toolbar component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 60,
    width: '100%',
  }))
  .add('default state', () => (
    <PaginationToolbar />
  ))
  .add('with pages', () => (
    <PaginationToolbar
      itemCount={470}
      activePage={1}
      pageCount={10}
      pageSize={50}
    />
  ))
  .add('with many pages at start', () => (
    <PaginationToolbar
      itemCount={470}
      activePage={1}
      pageCount={20}
      pageSize={50}
    />
  ))
  .add('with many pages at the middle', () => (
    <PaginationToolbar
      itemCount={470}
      activePage={7}
      pageCount={20}
      pageSize={50}
    />
  ))
  .add('with many pages at the end', () => (
    <PaginationToolbar
      itemCount={470}
      activePage={20}
      pageCount={20}
      pageSize={50}
    />
  ))
  .add('with actions', () => (
    <PaginationToolbar
      itemCount={470}
      activePage={1}
      pageCount={10}
      pageSize={50}
      onChangePage={action('onChangePage')}
      onChangePageSize={action('onChangePageSize')}
    />
  ));
