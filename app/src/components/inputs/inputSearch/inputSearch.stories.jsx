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
import { InputSearch } from './inputSearch';
import README from './README.md';

const value = 'value';

storiesOf('Components/Inputs/InputSearch', module)
  .addDecorator(
    host({
      title: 'InputSearch component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 40,
      width: 280,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <InputSearch />)
  .add('with value', () => <InputSearch value={value} />)
  .add('with placeholder', () => <InputSearch placeholder="Placeholder test" />)
  .add('max length (10)', () => <InputSearch maxLength="10" />)
  .add('active', () => <InputSearch active />)
  .add('with actions', () => (
    <InputSearch
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
    />
  ))
  .add('disabled', () => <InputSearch disabled />)
  .add('disabled with value', () => <InputSearch disabled value={value} />)
  .add('disabled with actions', () => (
    <InputSearch
      disabled
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
    />
  ));
