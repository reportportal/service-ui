/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
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
  .addDecorator(withReadme(README))
  .add('Default state', () => <InputSlider />)
  .add('With options', () => <InputSlider options={options} />)
  .add('With options, value="Info"', () => <InputSlider options={options} value={'Info'} />)
  .add('With options, value="Info" and action', () => (
    <InputSlider options={options} value={'Info'} onChange={action('changed')} />
  ));
