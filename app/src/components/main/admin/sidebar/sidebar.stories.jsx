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
import { Sidebar } from './sidebar';
import README from './README.md';

storiesOf('Components/Main/Admin/Sidebar', module)
  .addDecorator(host({
    title: 'AdminSidebar component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#ffffff',
    height: 1000,
    width: '100%',
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <Sidebar />
  ))
  .add('open menu (max-width:768)', () => (
    <Sidebar isMenuOpen />
  ))
  .add('with all action', () => (
    <Sidebar
      onClickProjects={action('Projects clicked ')}
      onClickUsers={action('Users clicked ')}
      onClickServerSettings={action('Settings clicked ')}
      onClickBackToProject={action('Back to project clicked ')}
      onClickLogout={action('Logout clicked ')}
      onClickProfile={action('Profile clicked ')}
      onClickMenu={action('Menu clicked ')}
      isMenuOpen
    />
  ));
