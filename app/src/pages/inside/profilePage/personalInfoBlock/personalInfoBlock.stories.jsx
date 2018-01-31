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
import { withReadme } from 'storybook-readme';
import PersonalInfoBlock from './personalInfoBlock';
import README from './README.md';
import bigAvatar from './storiesImg/big.jpg';
import smallAvatar from './storiesImg/small.jpg';

storiesOf('Pages/inside/profilePage/personalInfoBlock', module)
  .addDecorator(host({
    title: 'Personal info form on profile page',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#f5f5f5',
    height: 'auto',
    width: '70%',
  }))
  .addDecorator(withReadme(README))
  .add('default state (no provided info)', () => (
    <PersonalInfoBlock />
  ))
  .add('with info', () => (
    <PersonalInfoBlock login="superadmin" name="RP Admin" email="superadmin@email.com" photoSrc={bigAvatar} />
  ))
  .add('with extreme info', () => (
    <PersonalInfoBlock
      login="superadminsuperadminsuperadminsuperadmin"
      name="RP Admin RP Admin RP Admin RP Admin RP Admin RP Admin RP Admin RP Admin"
      email="superadminsuperadminsuperadminsuperadminsuperadminsuperadminsuperadminsuperadmin@email.com"
      photoSrc={smallAvatar}
    />
  ))
;
