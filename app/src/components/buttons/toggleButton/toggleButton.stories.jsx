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
import { ToggleButton } from './toggleButton';
import README from './README.md';

storiesOf('Components/Buttons/toggleButton', module)
  .addDecorator(host({
    title: 'Toggle button component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 30,
    width: 220,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <ToggleButton />
  ))
  .add('with 2 items', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
      ]}
    />
  ))
  .add('with 3 items', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
    />
  ))
  .add('with 4 items', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
        { value: 'fourth', label: 'fourth' },
      ]}
    />
  ))
  .add('with active item', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
      value={'second'}
    />
  ))
  .add('with actions', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
      value={'second'}
      onClickItem={action('itemClicked')}
    />
  ))
;
