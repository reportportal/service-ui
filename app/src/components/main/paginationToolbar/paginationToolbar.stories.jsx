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

import { PaginationToolbar } from './paginationToolbar';
import README from './README.md';

storiesOf('Components/Main/PaginationToolbar', module)
  .addDecorator(
    host({
      title: 'Pagination toolbar component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 80,
      width: '100%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('with pages', () => (
    <PaginationToolbar itemCount={50} activePage={1} pageCount={5} pageSize={10} />
  ))
  .add('with many pages at start', () => (
    <PaginationToolbar itemCount={470} activePage={1} pageCount={20} pageSize={50} />
  ))
  .add('with many pages at the middle', () => (
    <PaginationToolbar itemCount={470} activePage={7} pageCount={20} pageSize={50} />
  ))
  .add('with many pages at the end', () => (
    <PaginationToolbar itemCount={470} activePage={20} pageCount={20} pageSize={50} />
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
  ))
  .add('with no items', () => (
    <PaginationToolbar itemCount={0} activePage={1} pageCount={0} pageSize={50} />
  ));
