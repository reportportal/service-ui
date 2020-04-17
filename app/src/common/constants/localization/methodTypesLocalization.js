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

import { defineMessages } from 'react-intl';
import * as methodTypes from '../methodTypes';

export const methodTypesLocalization = defineMessages({
  [methodTypes.TEST]: {
    id: 'MethodTypes.test',
    defaultMessage: 'Test class',
  },
  [methodTypes.STEP]: {
    id: 'MethodTypes.step',
    defaultMessage: 'Test',
  },
  [methodTypes.AFTER_CLASS]: {
    id: 'MethodTypes.afterClass',
    defaultMessage: 'After class',
  },
  [methodTypes.AFTER_GROUPS]: {
    id: 'MethodTypes.afterGroups',
    defaultMessage: 'After groups',
  },
  [methodTypes.AFTER_METHOD]: {
    id: 'MethodTypes.afterMethod',
    defaultMessage: 'After method',
  },
  [methodTypes.AFTER_SUITE]: {
    id: 'MethodTypes.afterSuite',
    defaultMessage: 'After suite',
  },
  [methodTypes.AFTER_TEST]: {
    id: 'MethodTypes.afterTest',
    defaultMessage: 'After test',
  },
  [methodTypes.BEFORE_CLASS]: {
    id: 'MethodTypes.beforeClass',
    defaultMessage: 'Before class',
  },
  [methodTypes.BEFORE_GROUPS]: {
    id: 'MethodTypes.beforeGroups',
    defaultMessage: 'Before groups',
  },
  [methodTypes.BEFORE_METHOD]: {
    id: 'MethodTypes.beforeMethod',
    defaultMessage: 'Before Method',
  },
  [methodTypes.BEFORE_SUITE]: {
    id: 'MethodTypes.beforeSuite',
    defaultMessage: 'Before suite',
  },
  [methodTypes.BEFORE_TEST]: {
    id: 'MethodTypes.beforeTest',
    defaultMessage: 'Before test',
  },
});
