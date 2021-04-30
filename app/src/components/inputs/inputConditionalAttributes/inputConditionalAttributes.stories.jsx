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

import React from 'react';
import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import {
  CONDITION_HAS,
  CONDITION_NOT_HAS,
  CONDITION_ANY,
  CONDITION_NOT_ANY,
} from 'components/filterEntities/constants';
import { InputConditionalAttributes } from './inputConditionalAttributes';
import README from './README.md';

const conditions = [CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_ANY, CONDITION_NOT_ANY];

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
            filteringField: 'attribute',
            condition: 'has',
            attributes: [],
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

storiesOf('Components/Inputs/InputConditionalAttributes', module)
  .addDecorator(
    host({
      title: 'Input Conditional Attributes component',
      align: 'center middle',
      backdrop: 'rgba(189, 178, 201, 0.2)',
      background: '#ffffff',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <WithState state={state}>
      <InputConditionalAttributes
        projectId=""
        keyURLCreator={() => {}}
        valueURLCreator={() => {}}
      />
    </WithState>
  ))
  .add('with conditions and actions', () =>
    React.createElement(() => {
      const [value, setValue] = React.useState({
        attributes: [],
        condition: 'has',
        value: '',
      });
      const onChange = (newValue) => {
        setValue({ ...value, ...newValue });
      };
      return (
        <WithState state={state}>
          <InputConditionalAttributes
            projectId=""
            keyURLCreator={() => {}}
            valueURLCreator={() => {}}
            value={value}
            conditions={conditions}
            onChange={onChange}
          />
        </WithState>
      );
    }),
  );
