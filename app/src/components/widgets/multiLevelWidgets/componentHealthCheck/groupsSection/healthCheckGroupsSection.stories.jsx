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
import { host } from 'storybook-host';

import { GroupsSection } from './groupsSection';
import README from './README.md';

const groups = [
  {
    attributeValue: 'Build 3.0.0',
    passingRate: 60,
    total: 200,
  },
  {
    attributeValue: 'Build 3.0.1',
    passingRate: 60,
    total: 300,
  },
  {
    attributeValue: 'Build 3.0.2',
    passingRate: 60,
    total: 400,
  },
  {
    attributeValue: 'Build 3.0.3',
    passingRate: 60,
    total: 500,
  },
  {
    attributeValue: 'Build 3.0.4',
    passingRate: 60,
    total: 600,
  },
];

storiesOf('Components/Widgets/Charts/ComponentHealthCheck/GroupsSection', module)
  .addDecorator(
    host({
      title: 'Health check widget groups section',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 300,
      width: 500,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <GroupsSection />)
  .add('with groups', () => (
    <GroupsSection
      sectionTitle="Passed"
      itemsCount={200}
      groups={groups}
      colorCalculator={() => 'green'}
    />
  ));
