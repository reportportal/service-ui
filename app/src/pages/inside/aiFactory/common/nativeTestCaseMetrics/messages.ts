/*
 * Copyright 2026 EPAM Systems
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

export const messages = defineMessages({
  title: { id: 'NativeTestCaseMetrics.title', defaultMessage: 'AI quality and generation' },
  evaluatedAt: { id: 'NativeTestCaseMetrics.evaluatedAt', defaultMessage: 'Evaluated: {date}' },
  tokensIn: { id: 'NativeTestCaseMetrics.tokensIn', defaultMessage: 'Input tokens: {count}' },
  tokensOut: { id: 'NativeTestCaseMetrics.tokensOut', defaultMessage: 'Output tokens: {count}' },
  skill: { id: 'NativeTestCaseMetrics.skill', defaultMessage: 'Skill: {skill}' },
  criterion: { id: 'NativeTestCaseMetrics.criterion', defaultMessage: '{name}: {score}' },
  criterionWithMaximum: {
    id: 'NativeTestCaseMetrics.criterionWithMaximum',
    defaultMessage: '{name}: {score} / {maximum}',
  },
  iteration: { id: 'NativeTestCaseMetrics.iteration', defaultMessage: 'Iteration #{number} ↗' },
  openIteration: {
    id: 'NativeTestCaseMetrics.openIteration',
    defaultMessage: 'Open generation iteration ↗',
  },
  loading: { id: 'NativeTestCaseMetrics.loading', defaultMessage: 'Loading iteration…' },
  error: {
    id: 'NativeTestCaseMetrics.error',
    defaultMessage: 'Iteration could not be loaded. Try again.',
  },
  unavailable: {
    id: 'NativeTestCaseMetrics.unavailable',
    defaultMessage: 'Iteration is unavailable.',
  },
});
