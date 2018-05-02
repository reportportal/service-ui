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
import { Input } from './input';
import README from './README.md';

storiesOf('Components/Inputs/Input', module)
  .addDecorator(host({
    title: 'Input component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    height: 30,
    width: 300,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <Input />
  ))
  .add('with placeholder', () => (
    <Input placeholder="Placeholder test" />
  ))
  .add('with predefined value', () => (
    <Input value="Predefined text" />
  ))
  .add('type number', () => (
    <Input type="number" />
  ))
  .add('type password', () => (
    <Input type="password" />
  ))
  .add('max length (10)', () => (
    <Input maxLength="10" />
  ))
  .add('disabled', () => (
    <Input disabled />
  ))
  .add('with actions', () => (
    <Input onFocus={action('focused')} onChange={action('change')} onBlur={action('blur')} />
  ));

