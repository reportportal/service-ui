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

import { Icon } from './icon';
import README from './README.md';

storiesOf('Components/Main/Icon', module)
  .addDecorator(
    host({
      title: 'Icon component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 40,
      width: 100,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <Icon />)
  .add('type icon-check', () => <Icon type="icon-check" />)
  .add('type icon-pencil', () => <Icon type="icon-pencil" />)
  .add('type icon-delete', () => <Icon type="icon-delete" />)
  .add('type icon-close', () => <Icon type="icon-close" />)
  .add('type icon-tables', () => <Icon type="icon-tables" />)
  .add('type icon-planet', () => <Icon type="icon-planet" />)
  .add('type icon-grid', () => <Icon type="icon-grid" />)
  .add('type icon-table', () => <Icon type="icon-table" />)
  .add('type icon-table with actions', () => (
    <Icon type="icon-table" onClick={action('onclick')} />
  ));
