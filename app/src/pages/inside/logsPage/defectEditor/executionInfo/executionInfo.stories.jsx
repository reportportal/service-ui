/*
 * Copyright 2021 EPAM Systems
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

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { ExecutionInfo } from './executionInfo';
import README from './README.md';
import { item, state } from './data';

storiesOf('Pages/Inside/LogsPage/ExecutionInfo', module)
  .addDecorator(
    host({
      title: 'Defect editor ExecutionInfo component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#000000',
      height: 400,
      width: 650,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <div>
      <WithState state={state}>
        <ExecutionInfo item={item} />
      </WithState>
    </div>
  ))
  .add('with selected state true', () => (
    <div>
      <WithState state={state}>
        <ExecutionInfo item={item} selectedItem={item.id} />
      </WithState>
    </div>
  ))
  .add('with action', () => (
    <div>
      <WithState state={state}>
        <ExecutionInfo item={item} selectItem={action('onClick')} />
      </WithState>
    </div>
  ));
