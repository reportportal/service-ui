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
import { host } from 'storybook-host';
import { action } from '@storybook/addon-actions';
import { withReadme } from 'storybook-readme';
import { OptionsRender } from './optionsRender';
import README from './README.md';

storiesOf('Components/Inputs/InputUserSearch/OptionsRender', module)
  .addDecorator(host({
    title: 'User Item',
    align: 'center middle',
    background: 'white',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    height: 400,
    width: 400,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <OptionsRender />
  ))
  .add('with options', () => {
    const options = [{ userName: 'test', userLogin: '.elogin.new', email: 'elogin@gmaile.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=.elogin.new&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'autotest', userLogin: 'autotest', email: 'autotest@example.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=autotest&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'TEST USER', userLogin: 'customer-krns', email: 'customer-krns@yandex.by', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=customer-krns&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'tester', userLogin: 'default', email: 'string000@gmale.com', disabled: true, isAssigned: true, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=default&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'DME', userLogin: 'demo-3', email: 'frmp.test@gmaile.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=demo-3&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'MaCi', userLogin: 'mac', email: 'test.gmail.com@gmail.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=mac&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'MEMBER', userLogin: 'member-01', email: 'member.test@gmail.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=member-01&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'Member-user1', userLogin: 'member-user1', email: 'test.stop@gmail.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=member-user1&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'User0', userLogin: 'new-user10', email: 'testuser0@gmail.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=new-user10&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' },
      { userName: 'NEW-USER3', userLogin: 'new-user3', email: 'test.new.user@gmail.com', disabled: false, isAssigned: false, userAvatar: '../api/v1/data/userphoto?v=1519648697773&id=new-user3&access_token=daf12ae5-d04a-4310-a59e-657e09f1ab4c' }];
    return <OptionsRender options={options} selectValue={action('select value')} />;
  });

