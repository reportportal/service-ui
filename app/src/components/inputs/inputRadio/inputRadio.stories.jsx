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
import { InputRadio } from './inputRadio';
import README from './README.md';

const value = 'value';

storiesOf('Components/Inputs/InputRadio', module)
  .addDecorator(
    host({
      title: 'InputRadio component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 45,
      width: 300,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <InputRadio />)
  .add('with value', () => <InputRadio value={value} />)
  .add('checked', () => <InputRadio ownValue={value} value={value} />)
  .add('with text', () => <InputRadio>Some text.</InputRadio>)
  .add('with long text', () => (
    <InputRadio>Some long text. Some long text. Some long text. Some long text.</InputRadio>
  ))
  .add('with circleAtTop & long text', () => (
    <InputRadio circleAtTop>
      Some long text. Some long text. Some long text. Some long text.
    </InputRadio>
  ))
  .add('disabled', () => <InputRadio disabled />)
  .add('disabled with value', () => <InputRadio disabled value={value} />)
  .add('disabled with text', () => <InputRadio disabled>Some text.</InputRadio>)
  .add('with value & actions', () => (
    <InputRadio
      value={value}
      onFocus={action('focus')}
      onChange={action('change')}
      onBlur={action('blur')}
    />
  ));
