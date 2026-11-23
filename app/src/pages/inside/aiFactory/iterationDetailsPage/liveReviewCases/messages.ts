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
  empty: {
    id: 'LiveReviewCases.empty',
    defaultMessage: 'No Library cases are linked to this iteration.',
  },
  error: {
    id: 'LiveReviewCases.error',
    defaultMessage: 'Could not load Library cases. Select Refresh to try again.',
  },
  caseColumn: { id: 'LiveReviewCases.caseColumn', defaultMessage: 'Test case' },
  nameColumn: { id: 'LiveReviewCases.nameColumn', defaultMessage: 'Name' },
  statusColumn: { id: 'LiveReviewCases.statusColumn', defaultMessage: 'Library status' },
  scoreColumn: { id: 'LiveReviewCases.scoreColumn', defaultMessage: 'Current score' },
  madeReadyByColumn: { id: 'LiveReviewCases.madeReadyByColumn', defaultMessage: 'Made ready by' },
  autoReady: { id: 'LiveReviewCases.autoReady', defaultMessage: 'Auto-Ready' },
  draft: { id: 'LiveReviewCases.draft', defaultMessage: 'Draft' },
  ready: { id: 'LiveReviewCases.ready', defaultMessage: 'Ready' },
  unavailable: { id: 'LiveReviewCases.unavailable', defaultMessage: '—' },
  viewInLibrary: { id: 'LiveReviewCases.viewInLibrary', defaultMessage: 'View in Test Library' },
  refresh: { id: 'LiveReviewCases.refresh', defaultMessage: 'Refresh' },
  previous: { id: 'LiveReviewCases.previous', defaultMessage: 'Previous' },
  next: { id: 'LiveReviewCases.next', defaultMessage: 'Next' },
  page: { id: 'LiveReviewCases.page', defaultMessage: 'Page {current} of {total}' },
});
