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
  pipelines: { id: 'StageTracePage.pipelines', defaultMessage: 'Pipelines' },
  graderScores: { id: 'StageTracePage.graderScores', defaultMessage: 'Grader scores' },
  graderCase: { id: 'StageTracePage.graderCase', defaultMessage: 'Test case' },
  graderTotal: { id: 'StageTracePage.graderTotal', defaultMessage: 'Total score' },
  graderChange: { id: 'StageTracePage.graderChange', defaultMessage: 'Score before → after' },
  graderBefore: { id: 'StageTracePage.graderBefore', defaultMessage: 'Score before' },
  graderAfter: { id: 'StageTracePage.graderAfter', defaultMessage: 'Score after' },
  graderCriterion: { id: 'StageTracePage.graderCriterion', defaultMessage: 'Criterion' },
  graderScore: { id: 'StageTracePage.graderScore', defaultMessage: 'Score / maximum' },
  pipeline: { id: 'StageTracePage.pipeline', defaultMessage: 'Pipeline {id}' },
  iterationId: { id: 'StageTracePage.iterationId', defaultMessage: 'Iteration ID {id}' },
  reported: { id: 'StageTracePage.reported', defaultMessage: 'Trace reported' },
  title: { id: 'StageTracePage.title', defaultMessage: 'Open trace' },
  iteration: { id: 'StageTracePage.iteration', defaultMessage: 'Iteration #{number}' },
  fixRound: { id: 'StageTracePage.fixRound', defaultMessage: 'fix round {number}' },
  back: { id: 'StageTracePage.back', defaultMessage: 'Back to iteration' },
  refresh: { id: 'StageTracePage.refresh', defaultMessage: 'Refresh' },
  loading: { id: 'StageTracePage.loading', defaultMessage: 'Loading trace…' },
  notReported: { id: 'StageTracePage.notReported', defaultMessage: 'Trace not reported' },
  empty: { id: 'StageTracePage.empty', defaultMessage: 'The reported trace contains no events' },
  forbidden: {
    id: 'StageTracePage.forbidden',
    defaultMessage: 'You do not have access to this trace',
  },
  projectUnavailable: {
    id: 'StageTracePage.projectUnavailable',
    defaultMessage: 'The project for this trace is unavailable. Refresh to try again.',
  },
  notFound: {
    id: 'StageTracePage.notFound',
    defaultMessage: 'This iteration, stage or attempt was not found',
  },
  invalid: {
    id: 'StageTracePage.invalid',
    defaultMessage: 'The trace address or server response is invalid',
  },
  failed: {
    id: 'StageTracePage.failed',
    defaultMessage: 'Trace could not be loaded. Refresh to try again.',
  },
  attempt: { id: 'StageTracePage.attempt', defaultMessage: 'Attempt {number}' },
  attempts: { id: 'StageTracePage.attempts', defaultMessage: 'Attempt' },
  current: { id: 'StageTracePage.current', defaultMessage: 'current' },
  snapshot: { id: 'StageTracePage.snapshot', defaultMessage: 'Stage snapshot' },
  snapshotUnavailable: {
    id: 'StageTracePage.snapshotUnavailable',
    defaultMessage: 'Snapshot for this attempt is unavailable',
  },
  metadataError: {
    id: 'StageTracePage.metadataError',
    defaultMessage: 'Iteration context could not be loaded',
  },
  iterationContext: { id: 'StageTracePage.iterationContext', defaultMessage: 'Iteration context' },
  trigger: { id: 'StageTracePage.trigger', defaultMessage: 'Trigger' },
  duration: { id: 'StageTracePage.duration', defaultMessage: 'Duration' },
  status: { id: 'StageTracePage.status', defaultMessage: 'Stage status' },
  ciRun: { id: 'StageTracePage.ciRun', defaultMessage: 'CI run' },
  eventCount: {
    id: 'StageTracePage.eventCount',
    defaultMessage: '{count, plural, one {# event} other {# events}}',
  },
  timeline: { id: 'StageTracePage.timeline', defaultMessage: 'Trace events' },
  unitFilter: { id: 'StageTracePage.unitFilter', defaultMessage: 'Unit' },
  allUnits: { id: 'StageTracePage.allUnits', defaultMessage: 'All events' },
  stageEvents: { id: 'StageTracePage.stageEvents', defaultMessage: 'Stage' },
  noUnitEvents: {
    id: 'StageTracePage.noUnitEvents',
    defaultMessage: 'No events match this unit filter',
  },
  eventText: { id: 'StageTracePage.eventText', defaultMessage: 'Full event text' },
  eventData: { id: 'StageTracePage.eventData', defaultMessage: 'Event data' },
  eventTarget: { id: 'StageTracePage.eventTarget', defaultMessage: 'Target' },
  reportedAt: { id: 'StageTracePage.reportedAt', defaultMessage: 'Reported at' },
});
