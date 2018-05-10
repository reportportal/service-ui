/*
 * Copyright 2018 EPAM Systems
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
import { START_TIME_FORMAT_RELATIVE, START_TIME_FORMAT_ABSOLUTE } from 'controllers/user';
import { AbsRelTime } from './absRelTime';

storiesOf('Components/Main/AbsRelTime', module)
  .addDecorator(
    host({
      title: 'InputBigSwitcher component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 60,
      width: 300,
    }),
  )
  .add('default state', () => <AbsRelTime setStartTimeFormatAction={action('Toggle format')} />)
  .add('relative time', () => (
    <AbsRelTime
      setStartTimeFormatAction={action('Toggle format')}
      startTimeFormat={START_TIME_FORMAT_RELATIVE}
    />
  ))
  .add('absolute time', () => (
    <AbsRelTime
      setStartTimeFormatAction={action('Toggle format')}
      startTimeFormat={START_TIME_FORMAT_ABSOLUTE}
    />
  ));
