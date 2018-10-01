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
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { InputDropdownSorting } from './inputDropdownSorting';
import README from './README.md';

const options = [
  {
    value: 'AI',
    label: 'Auto Bug',
    disabled: false,
  },
  {
    value: 'PB',
    label: 'Product Bug',
    disabled: true,
  },
  {
    value: 'SI',
    label: 'System Issue',
    disabled: true,
  },
  {
    value: 'ND',
    label: 'No Defect',
    disabled: false,
  },
  {
    value: 'TI',
    label: 'To invest',
    disabled: false,
  },
];

storiesOf('Components/Inputs/InputDropdownSorting', module)
  .addDecorator(
    host({
      title: 'InputDropdownSorting component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 32,
      width: 300,
    }),
  )
  .addDecorator(withReadme(README))
  // Single dropdown
  .add('Single, default state', () => <InputDropdownSorting options={options} />)
  .add('Single, disabled', () => <InputDropdownSorting options={options} disabled />)
  .add('Single, with actions', () => (
    <InputDropdownSorting
      options={options}
      onChange={action('changed')}
      onBlur={action('blured')}
      onFocus={action('focused')}
    />
  ))
  .add('Single, with sorting mode', () => <InputDropdownSorting options={options} sortingMode />)
  .add('Single, with actions, value', () => (
    <InputDropdownSorting
      options={options}
      onChange={action('changed')}
      onBlur={action('blured')}
      onFocus={action('focused')}
      value="ND"
    />
  ));
