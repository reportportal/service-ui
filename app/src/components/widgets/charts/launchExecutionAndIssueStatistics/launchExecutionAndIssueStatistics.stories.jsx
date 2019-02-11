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
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import React from 'react';
import { LaunchExecutionAndIssueStatistics } from './launchExecutionAndIssueStatistics';
import README from './README.md';
import { widgetData, state } from './data';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Components/Widgets/Charts/LaunchExecutionAndIssueStatistics', module)
  .addDecorator(
    host({
      title: 'Launch Execution And Issue Statistics Component',
      align: 'center middle',
      height: 400,
      width: 800,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <WithState state={state}>
      <LaunchExecutionAndIssueStatistics
        widget={widgetData}
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))

  .add('preview', () => (
    <WithState state={state}>
      <LaunchExecutionAndIssueStatistics
        widget={widgetData}
        container={mockNode}
        observer={mockObserver}
        isPreview
      />
    </WithState>
  ));
