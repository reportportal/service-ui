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

import { action } from '@storybook/addon-actions';
import { InputSlider } from './inputSlider';
import README from './README.md';

const options = ['Fatal', 'Error', 'Warn', 'Info', 'Debug', 'Trace'];

storiesOf('Components/Inputs/InputSlider', module)
  .addDecorator(
    host({
      title: 'Slider component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 32,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('Default state', () => <InputSlider />)
  .add('With options', () => <InputSlider options={options} />)
  .add('With options, value="Info"', () => <InputSlider options={options} value={'Info'} />)
  .add('With options, value="Info" and action', () => (
    <InputSlider options={options} value={'Info'} onChange={action('changed')} />
  ));
