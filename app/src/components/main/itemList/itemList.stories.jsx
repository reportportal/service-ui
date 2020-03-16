/*
 * Copyright 2020 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { GhostButton } from 'components/buttons/ghostButton';
import { ItemList } from './itemList';

const Foo = () => <GhostButton>Custom cell</GhostButton>;

const columns = [
  {
    name: 'name',
    label: 'Name',
    bold: true,
    formatter: (v) => v.name,
  },
  {
    name: 'number',
    label: 'Number',
    formatter: (v) => v.number,
  },
  {
    name: 'button',
    component: Foo,
  },
];

const data = [
  { id: 0, name: 'first', number: 123 },
  { id: 1, name: 'second', number: 456 },
];

storiesOf('Components/Main/itemList', module)
  .addDecorator(
    host({
      title: 'itemList component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 300,
      width: 600,
    }),
  )
  .add('With data', () => <ItemList columns={columns} values={data} />);
