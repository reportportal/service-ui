/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { host } from 'storybook-host';

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
    name: 'Integration',
    link: '/integrations',
    component: <div>Integration</div>,
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
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
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
