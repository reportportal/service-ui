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
  title: { id: 'LiveFixRoundHistory.title', defaultMessage: 'Fix round history' },
  load: { id: 'LiveFixRoundHistory.load', defaultMessage: 'Show fix round history' },
  refresh: { id: 'LiveFixRoundHistory.refresh', defaultMessage: 'Refresh fix round history' },
  loading: { id: 'LiveFixRoundHistory.loading', defaultMessage: 'Loading fix round history…' },
  empty: { id: 'LiveFixRoundHistory.empty', defaultMessage: 'No fix rounds have been requested.' },
  unavailable: {
    id: 'LiveFixRoundHistory.unavailable',
    defaultMessage: 'Fix round history could not be loaded. Refresh to try again.',
  },
  round: { id: 'LiveFixRoundHistory.round', defaultMessage: 'Fix round #{number}' },
  pending: { id: 'LiveFixRoundHistory.pending', defaultMessage: 'Pending' },
  fixed: { id: 'LiveFixRoundHistory.fixed', defaultMessage: 'Fixed' },
  gradeFailed: { id: 'LiveFixRoundHistory.gradeFailed', defaultMessage: 'Fixed; grading failed' },
  failed: { id: 'LiveFixRoundHistory.failed', defaultMessage: 'Failed' },
  requested: { id: 'LiveFixRoundHistory.requested', defaultMessage: 'Requested: {date}' },
  finished: { id: 'LiveFixRoundHistory.finished', defaultMessage: 'Finished: {date}' },
  noResult: {
    id: 'LiveFixRoundHistory.noResult',
    defaultMessage: 'No result iteration was reported; no trace is available.',
  },
  unresolved: {
    id: 'LiveFixRoundHistory.unresolved',
    defaultMessage: 'The result trace could not be verified.',
  },
  failure: { id: 'LiveFixRoundHistory.failure', defaultMessage: 'Failure: {reason}' },
});
