/*
 * Copyright 2021 EPAM Systems
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

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { KeyValueAttributesInput } from './keyValueAttributesInput';
import README from './README.md';

const value = {
  attributeKey: {
    condition: 'has',
    filteringField: 'attributeKey',
    value: '',
  },
  attributeValue: {
    condition: 'has',
    filteringField: 'attributeValue',
    value: '',
  },
};

const state = {
  user: {
    activeProject: 'superadmin_personal',
  },
  filters: {
    filters: [],
    pagination: {},
    loading: false,
    pageLoading: false,
    launchesFilters: [
      {
        owner: 'superadmin',
        share: true,
        id: 1,
        name: 'DEMO_FILTER',
        conditions: [
          {
            filteringField: 'attributeValue',
            condition: 'has',
            value: '',
          },
        ],
        orders: [
          {
            sortingColumn: 'startTime',
            isAsc: false,
          },
        ],
        type: 'launch',
      },
    ],
    launchesFiltersReady: true,
  },
};

storiesOf('Components/Inputs/KeyValueAttributesInput', module)
  .addDecorator(
    host({
      title: 'Key/value attributes input component',
      align: 'center middle',
      backdrop: 'rgba(189, 178, 201, 0.2)',
      background: '#ffffff',
      height: 32,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <WithState state={state}>
      <KeyValueAttributesInput projectId="" keyURLCreator={() => {}} valueURLCreator={() => {}} />
    </WithState>
  ))
  .add('with conditions', () => (
    <WithState state={state}>
      <KeyValueAttributesInput
        projectId=""
        keyURLCreator={() => {}}
        valueURLCreator={() => {}}
        value={value}
      />
    </WithState>
  ));
