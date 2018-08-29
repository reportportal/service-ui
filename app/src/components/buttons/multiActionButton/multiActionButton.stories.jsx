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
import { MultiActionButton } from './multiActionButton';
import README from './README.md';

const items = [
  {
    label: 'Save and post issue',
    value: 'Post',
    onClick: action('clicked'),
  },
  {
    label: 'Save and link issue',
    value: 'Link',
    onClick: action('clicked'),
  },
  {
    label: 'Save and unlink issue',
    value: 'Unlink',
    onClick: action('clicked'),
    disabled: true,
  },
];

storiesOf('Components/Buttons/MultiActionButton', module)
  .addDecorator(
    host({
      title: 'Multi action button component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 130,
      width: 170,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <MultiActionButton />)
  .add('with title', () => <MultiActionButton title="Save" />)
  .add('with title & disabled', () => <MultiActionButton title="Save" disabled />)
  .add('with title & color=organish', () => <MultiActionButton color="organish" title="Save" />)
  .add('with title & color=organish & disabled', () => (
    <MultiActionButton color="organish" title="Save" disabled />
  ))
  .add('with title & items & actions', () => (
    <MultiActionButton onClick={action('clicked')} items={items} title="Save" />
  ));
