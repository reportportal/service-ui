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

storiesOf('Layouts/App/Header/ProjectSelector', module)
  .addDecorator(
    host({
      title: 'Project selector component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: 'black',
      height: '60px',
      width: '70%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <ProjectSelector />)
  .add('with data', () => (
    <ProjectSelector projects={mockProjectsList} activeProject="Default_active" />
  ))
  .add('with many projects', () => (
    <ProjectSelector projects={mockProjectsListLong} activeProject="Project-10" />
  ));
