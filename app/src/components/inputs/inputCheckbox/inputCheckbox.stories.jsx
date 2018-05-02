/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
import { InputCheckbox } from './inputCheckbox';
import README from './README.md';

storiesOf('Components/Inputs/InputCheckbox', module)
  .addDecorator(host({
    title: 'InputCheckbox component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#ffffff',
    height: 30,
    width: 300,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <InputCheckbox />
  ))
  .add('with long text', () => (
    <InputCheckbox>Some long text. Some long text. Some long text. Some long text.</InputCheckbox>
  ))
  .add('checked', () => (
    <InputCheckbox value>Some text.</InputCheckbox>
  ))
  .add('disabled', () => (
    <InputCheckbox disabled>Some text.</InputCheckbox>
  ))
  .add('checked & disabled', () => (
    <InputCheckbox value disabled>Some text.</InputCheckbox>
  ))
  .add('with actions', () => (
    <InputCheckbox onChange={action('change')} onFocus={action('focused')} onBlur={action('blur')}>Some text.</InputCheckbox>
  ));

