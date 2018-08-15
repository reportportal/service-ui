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
import { Icon } from './icon';
import README from './README.md';

storiesOf('Components/Main/Icon', module)
  .addDecorator(
    host({
      title: 'Icon component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 40,
      width: 100,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <Icon />)
  .add('type icon-check', () => <Icon type="icon-check" />)
  .add('type icon-pencil', () => <Icon type="icon-pencil" />)
  .add('type icon-delete', () => <Icon type="icon-delete" />)
  .add('type icon-close', () => <Icon type="icon-close" />)
  .add('type icon-tables', () => <Icon type="icon-tables" />)
  .add('type icon-planet', () => <Icon type="icon-planet" />)
  .add('type icon-grid', () => <Icon type="icon-grid" />)
  .add('type icon-table', () => <Icon type="icon-table" />)
  .add('type icon-table with actions', () => (
    <Icon type="icon-table" onClick={action('onclick')} />
  ));
