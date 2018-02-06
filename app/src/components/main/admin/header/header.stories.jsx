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
import { AdminHeader } from './header';
import README from './README.md';

storiesOf('Components/Main/Admin/Header', module)
  .addDecorator(host({
    title: 'AdminHeader component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#ffffff',
    height: 100,
    width: '100%',
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <AdminHeader />
  ))
  .add('with crumb (mobile view)', () => (
    <AdminHeader adminHeaderCrumb=" / Test crumb" />
  ))
  .add('with actions', () => (
    <AdminHeader onClickBackToProject={action('Back to project clicked ')} onClickLogout={action('Logout clicked ')} />
  ))
  .add('with mobile action', () => (
    <AdminHeader onClickMenu={action('Menu clicked ')} />
  ))
  .add('menu open', () => (
    <AdminHeader isMenuOpen />
  ));
