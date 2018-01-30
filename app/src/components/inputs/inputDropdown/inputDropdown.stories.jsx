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
import { Dropdown } from './inputDropdown';
import README from './README.md';

const getOptions = multiple => [
  {
    id: 'AI',
    text: 'Auto Bug',
    disabled: false,
    active: true,
  }, {
    id: 'PB',
    text: 'Product Bug',
    disabled: true,
    active: multiple,
  }, {
    id: 'SI',
    text: 'System Issue',
    disabled: true,
    active: false,
  }, {
    id: 'ND',
    text: 'No Defect',
    disabled: false,
    active: multiple,
  }, {
    id: 'TI',
    text: 'To invest',
    disabled: false,
    active: false,
  },
];

storiesOf('Components/Inputs/InputDropdown', module)
  .addDecorator(host({
    title: 'InputDropdown component',
    align: 'center top',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#ffffff',
    height: 32,
    width: 300,
  }))
  .addDecorator(withReadme(README))
  // Single dropdown
  .add('Single, default state', () => (
    <Dropdown options={getOptions()} />
  ))
  .add('Single, disabled', () => (
    <Dropdown options={getOptions()} disabled />
  ))
  .add('Single, with actions', () => (
    <Dropdown options={getOptions()} onFocus={action('focused')} />
  ))
  .add('Single, focused', () => (
    <Dropdown options={getOptions()} active />
  ))
  .add('Single, focused, with actions', () => (
    <Dropdown options={getOptions()} onBlur={action('blured')} active />
  ))

  // Multiple dropdown
  .add('Multiple, default state', () => (
    <Dropdown options={getOptions(true)} multiple />
  ))
  .add('Multiple, disabled', () => (
    <Dropdown options={getOptions(true)} multiple disabled />
  ))
  .add('Multiple, with actions', () => (
    <Dropdown options={getOptions(true)} onFocus={action('focused')} multiple />
  ))
  .add('Multiple, focused', () => (
    <Dropdown options={getOptions(true)} multiple active />
  ))
  .add('Multiple, select all, focused', () => (
    <Dropdown options={getOptions(true)} multiple selectAll active />
  ))
  .add('Multiple, focused, with actions', () => (
    <Dropdown options={getOptions(true)} onBlur={action('blured')} multiple active />
  ))
  .add('Multiple, focused, select all, with actions', () => (
    <Dropdown options={getOptions(true)} onBlur={action('blured')} multiple selectAll active />
  ));
