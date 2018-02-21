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
import { InputUserSearch } from './inputUserSearch';
import README from './README.md';

storiesOf('Components/Inputs/InputUserSearch', module)
  .addDecorator(host({
    title: 'Input user search',
    align: 'center middle',
    background: 'white',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    height: 400,
    width: 400,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => <InputUserSearch />)
  .add('Admin with projectId="superadmin_personal" ', () =>
    (<InputUserSearch
      isAdmin
      projectId="superadmin_personal"
      onChange={action('Select user')}
    />))
  .add('Default user with projectId="superadmin_personal"', () =>
    (<InputUserSearch
      projectId="superadmin_personal"
      onChange={action('Select user')}
    />));

