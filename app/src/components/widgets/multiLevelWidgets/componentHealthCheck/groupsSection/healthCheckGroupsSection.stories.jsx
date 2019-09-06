/*
 * Copyright 2019 EPAM Systems
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
  .addDecorator(withReadme(README))
  .add('default state', () => <GroupsSection />)
  .add('with groups', () => (
    <GroupsSection
      sectionTitle="Passed"
      itemsCount={200}
      groups={groups}
      colorCalculator={() => 'green'}
    />
  ));
