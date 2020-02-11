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

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { DefectTypeSelector } from './defectTypeSelector';
import README from './README.md';
import { state } from './data';

const value = 'AB001';

storiesOf('Pages/Inside/Common/DefectTypeSelector', module)
  .addDecorator(
    host({
      title: 'Defect type selector component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 400,
      width: 580,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector />
      </WithState>
    </div>
  ))
  .add('with placeholder', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector placeholder="Choose defect type" />
      </WithState>
    </div>
  ))
  .add('with value', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector value={value} />
      </WithState>
    </div>
  ))
  .add('with actions', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector
          onChange={action('onchange')}
          placeholder="Choose defect type"
          value={value}
        />
      </WithState>
    </div>
  ));
