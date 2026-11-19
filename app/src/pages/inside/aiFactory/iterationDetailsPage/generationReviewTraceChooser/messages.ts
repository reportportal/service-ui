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
  title: { id: 'GenerationReviewTraceChooser.title', defaultMessage: 'Fix round traces' },
  caseLabel: { id: 'GenerationReviewTraceChooser.caseLabel', defaultMessage: 'Test case' },
  casePlaceholder: {
    id: 'GenerationReviewTraceChooser.casePlaceholder',
    defaultMessage: 'Select a test case',
  },
  caseOption: {
    id: 'GenerationReviewTraceChooser.caseOption',
    defaultMessage: '{displayId} — {name}',
  },
  load: { id: 'GenerationReviewTraceChooser.load', defaultMessage: 'Choose a fix round trace' },
  refresh: {
    id: 'GenerationReviewTraceChooser.refresh',
    defaultMessage: 'Refresh fix round traces',
  },
  loading: {
    id: 'GenerationReviewTraceChooser.loading',
    defaultMessage: 'Loading fix round history…',
  },
  limitation: {
    id: 'GenerationReviewTraceChooser.limitation',
    defaultMessage:
      'Human review has no single agent trace. Choose a fix round requested from this iteration to view its result trace.',
  },
  empty: {
    id: 'GenerationReviewTraceChooser.empty',
    defaultMessage: 'No fix rounds were requested from this source iteration.',
  },
  incomplete: {
    id: 'GenerationReviewTraceChooser.incomplete',
    defaultMessage: 'The test case history or a result iteration could not be resolved. Try again.',
  },
  noCases: {
    id: 'GenerationReviewTraceChooser.noCases',
    defaultMessage: 'No test cases are available on this page.',
  },
  unresolved: {
    id: 'GenerationReviewTraceChooser.unresolved',
    defaultMessage: 'The result trace could not be verified.',
  },
  open: {
    id: 'GenerationReviewTraceChooser.open',
    defaultMessage: '{caseName}: open fix round #{number} trace',
  },
});
