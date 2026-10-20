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
  title: { id: 'LiveReviewCases.title', defaultMessage: 'Library cases' },
  loading: { id: 'LiveReviewCases.loading', defaultMessage: 'Loading Library cases…' },
  noReferences: {
    id: 'LiveReviewCases.noReferences',
    defaultMessage: 'This iteration does not provide linked Library cases.',
  },
  tooManyReferences: {
    id: 'LiveReviewCases.tooManyReferences',
    defaultMessage: 'Too many linked cases to load here. Open the Test Case Library.',
  },
  unresolved: {
    id: 'LiveReviewCases.unresolved',
    defaultMessage: 'This case could not be matched uniquely in the Library.',
  },
  caseColumn: { id: 'LiveReviewCases.caseColumn', defaultMessage: 'Test case' },
  nameColumn: { id: 'LiveReviewCases.nameColumn', defaultMessage: 'Name' },
  statusColumn: { id: 'LiveReviewCases.statusColumn', defaultMessage: 'Library status' },
  scoreColumn: { id: 'LiveReviewCases.scoreColumn', defaultMessage: 'Current score' },
  draft: { id: 'LiveReviewCases.draft', defaultMessage: 'Draft' },
  ready: { id: 'LiveReviewCases.ready', defaultMessage: 'Ready' },
  unavailable: { id: 'LiveReviewCases.unavailable', defaultMessage: '—' },
  refresh: { id: 'LiveReviewCases.refresh', defaultMessage: 'Refresh' },
});
