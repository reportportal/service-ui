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
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { PassingRateChart } from './passingRateChart';
import { passingRateBarData, passingRatePieData } from './demoData';
import README from './README.md';

const mockNode = document.createElement('node');

storiesOf('Components/Widgets/Charts/PassingRateChart', module)
  .addDecorator(
    host({
      title: 'Passing Rate per Launch',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 350,
      width: 500,
    }),
  )
  .addDecorator(withReadme(README))
  .add('launch bar mode', () => (
    <PassingRateChart widget={passingRateBarData} container={mockNode} />
  ))
  .add('launch bar mode preview', () => (
    <PassingRateChart widget={passingRateBarData} isPreview container={mockNode} />
  ))
  .add('launch pie mode', () => (
    <PassingRateChart widget={passingRatePieData} container={mockNode} />
  ))
  .add('launch pie mode preview', () => (
    <PassingRateChart widget={passingRatePieData} isPreview container={mockNode} />
  ));
