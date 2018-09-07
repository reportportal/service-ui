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
import TestIcon from './img/test-icon-inline.svg';
import { InputOutside } from './inputOutside';
import README from './README.md';

storiesOf('Components/Inputs/InputOutside', module)
  .addDecorator(
    host({
      title: 'InputOutside component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 45,
      width: 300,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <InputOutside />)
  .add('with placeholder', () => <InputOutside placeholder="Placeholder test" />)
  .add('with predefined value', () => <InputOutside value="Predefined text" />)
  .add('with predefined value & readonly', () => <InputOutside readonly value="Predefined text" />)
  .add('with icon', () => <InputOutside icon={TestIcon} />)
  .add('type number', () => <InputOutside type="number" value="value" />)
  .add('with value & type password', () => <InputOutside type="password" value="value" />)
  .add('max length (10)', () => <InputOutside maxLength="10" />)
  .add('with error & touched', () => <InputOutside touched error="Something went wrong" />)
  .add('disabled', () => <InputOutside disabled />)
  .add('disabled with value', () => <InputOutside disabled value="value" />)
  .add('with actions', () => (
    <InputOutside
      onFocus={action('focus')}
      onChange={action('change')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
    />
  ));
