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
import { action } from '@storybook/addon-actions';
import { ProjectSelector } from './projectSelector';
import README from './README.md';

const mockProjectsList = [
  'Project-1',
  'Project-2',
  'Project-3',
  'Project-4',
  'Project-5',
  'Default_active',
  'ProjectWithVeryLongName_ProjectWithVeryLongName_ProjectWithVeryLongName',
  '1',
];

const mockProjectsListLong = [
  'Project-1',
  'Project-2',
  'Project-3',
  'Project-4',
  'Project-5',
  'Project-6',
  'Project-7',
  'Project-8',
  'Project-9',
  'Project-10',
  'Project-11',
  'Project-12',
  'Project-13',
  'Project-14',
  'Project-15',
];

storiesOf('Components/Main/projectSelector', module)
  .addDecorator(host({
    title: 'Project selector component',
    align: 'center top',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: 'black',
    height: '60px',
    width: '70%',
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <ProjectSelector />
  ))
  .add('with data', () => (
    <ProjectSelector projects={mockProjectsList} activeProject="Default_active" />
  ))
  .add('with many projects', () => (
    <ProjectSelector projects={mockProjectsListLong} activeProject="Project-10" />
  ))
  .add('with actions', () => (
    <ProjectSelector projects={mockProjectsList} activeProject="Default_active" onChange={action('project changed')} />
  ))
;
