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
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { NavigationTabs } from './navigationTabs';
import README from './README.md';

const state = {
  location: {
    pathname: '/general',
    type: 'GENERAL_PAGE',
    routesMap: {
      GENERAL_PAGE: {
        path: '/general',
      },
    },
  },
};

const activeTab = 'general';

const config = {
  general: {
    name: 'General',
    link: '/general',
    component: <div>General</div>,
  },
  notifications: {
    name: 'Notification',
    link: '/notification',
    component: <div>Notification</div>,
  },
  bts: {
    name: 'Bts',
    link: '/bts',
    component: <div>Bts</div>,
  },
  defect: {
    name: 'Defects',
    link: '/defect',
    component: <div>Defects</div>,
  },
  autoAnalysis: {
    name: 'Auto Analysis',
    link: '/autoAnalysis',
    component: <div>Auto analysis</div>,
  },
  demoData: {
    name: 'Demo data',
    link: '/demoData',
    component: <div>Demo data</div>,
  },
};

storiesOf('Components/Main/NavigationTabs', module)
  .addDecorator(
    host({
      title: 'Navigation tabs component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 'auto',
      width: 500,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <NavigationTabs />)
  .add('with config', () => <NavigationTabs config={config} />)
  .add('with config & activeTab="general"', () => (
    <WithState state={state}>
      <NavigationTabs activeTab={activeTab} config={config} />
    </WithState>
  ))
  .add('with config & actions', () => (
    <WithState state={state}>
      <NavigationTabs onChangeTab={action('onChangeTab')} activeTab={activeTab} config={config} />
    </WithState>
  ));
