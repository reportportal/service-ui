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
import { host } from 'storybook-host';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState, withTooltipRoot } from 'storybook-decorators';
import { InfoLine } from './infoLine';
import { state, mockData } from './data';
import README from './README.md';

storiesOf('Pages/Inside/Common/InfoLine', module)
  .addDecorator(
    host({
      title: 'Info line component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 'auto',
      width: '100%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .addDecorator(withTooltipRoot)
  .add('with data', () => (
    <WithState state={state}>
      <InfoLine data={mockData} />
    </WithState>
  ));
