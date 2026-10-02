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
  history: {
    id: 'LifecycleHistory.history',
    defaultMessage: 'History',
  },
  loading: {
    id: 'LifecycleHistory.loading',
    defaultMessage: 'Loading lifecycle history',
  },
  empty: {
    id: 'LifecycleHistory.empty',
    defaultMessage: 'No lifecycle changes yet',
  },
  loadError: {
    id: 'LifecycleHistory.loadError',
    defaultMessage: 'Lifecycle history could not be loaded',
  },
  retry: {
    id: 'LifecycleHistory.retry',
    defaultMessage: 'Retry',
  },
  byActor: {
    id: 'LifecycleHistory.byActor',
    defaultMessage: 'by {actor}',
  },
  unknownActor: {
    id: 'LifecycleHistory.unknownActor',
    defaultMessage: 'Unknown actor',
  },
  changed: {
    id: 'LifecycleHistory.changed',
    defaultMessage: 'Lifecycle changed',
  },
  created: {
    id: 'LifecycleHistory.created',
    defaultMessage: 'Created',
  },
  uploaded: {
    id: 'LifecycleHistory.uploaded',
    defaultMessage: 'Uploaded',
  },
  migrated: {
    id: 'LifecycleHistory.migrated',
    defaultMessage: 'Migrated',
  },
  approved: {
    id: 'LifecycleHistory.approved',
    defaultMessage: 'Approved',
  },
  markedAsReady: {
    id: 'LifecycleHistory.markedAsReady',
    defaultMessage: 'Marked as ready',
  },
  approvedWithChanges: {
    id: 'LifecycleHistory.approvedWithChanges',
    defaultMessage: 'Approved with changes',
  },
  markedAsReadyWithChanges: {
    id: 'LifecycleHistory.markedAsReadyWithChanges',
    defaultMessage: 'Marked as ready with changes',
  },
  autoReady: {
    id: 'LifecycleHistory.autoReady',
    defaultMessage: 'Promoted by Auto-Ready',
  },
  scenarioChanged: {
    id: 'LifecycleHistory.scenarioChanged',
    defaultMessage: 'Scenario changed',
  },
  agentFix: {
    id: 'LifecycleHistory.agentFix',
    defaultMessage: 'Updated by agent',
  },
});
