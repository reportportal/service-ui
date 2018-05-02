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
import AssignedProjectsBlock from './assignedProjectsBlock';
import README from './README.md';

const projectsMockUp = [
  { name: 'project_bmzc9virhi', role: 'project_manager' },
  { name: 'project_aue1166vqq', role: 'project_manager' },
  { name: 'default_project', role: 'member' },
  { name: 'artem', role: 'project_manager' },
  { name: 'autotest_projectxqdrmvsq9c', role: 'project_manager' },
  { name: 'project_vhi2nmfmlc', role: 'project_manager' },
  { name: 'neb', role: 'project_manager' },
  { name: 'epm-rpp', role: 'project_manager' },
  { name: 'artem-test', role: 'project_manager' },
  { name: 'veronikaproject', role: 'project_manager' },
  { name: 'project_b7c2w99ppk', role: 'project_manager' },
  { name: 'project_yhkv4d7ohk', role: 'project_manager' },
  { name: 'demo-project', role: 'project_manager' },
  { name: 'sviatlana_kashtsialian_personal', role: 'operator' },
];

storiesOf('Pages/inside/profilePage/assignedProjectsBlock', module)
  .addDecorator(host({
    title: 'Assigned projects table on profile page',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#f5f5f5',
    height: 'auto',
    width: '70%',
  }))
  .addDecorator(withReadme(README))
  .add('default state (no provided info)', () => (
    <AssignedProjectsBlock />
  ))
  .add('with projects', () => (
    <AssignedProjectsBlock projects={projectsMockUp} />
  ))
;
