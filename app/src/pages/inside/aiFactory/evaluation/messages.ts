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
  title: {
    id: 'AiEvaluationPanel.title',
    defaultMessage: 'AI evaluation',
  },
  totalScore: {
    id: 'AiEvaluationPanel.totalScore',
    defaultMessage: 'Total score',
  },
  loading: {
    id: 'AiEvaluationPanel.loading',
    defaultMessage: 'Loading AI evaluation',
  },
  loadError: {
    id: 'AiEvaluationPanel.loadError',
    defaultMessage: 'AI evaluation could not be loaded',
  },
  retry: {
    id: 'AiEvaluationPanel.retry',
    defaultMessage: 'Retry',
  },
  empty: {
    id: 'AiEvaluationPanel.empty',
    defaultMessage: 'No AI evaluation yet',
  },
  rubricHelp: {
    id: 'AiEvaluationPanel.rubricHelp',
    defaultMessage: 'About the evaluation rubric',
  },
  reasons: {
    id: 'AiEvaluationPanel.reasons',
    defaultMessage: '{count} {count, plural, one {reason} other {reasons}}',
  },
  evaluated: {
    id: 'AiEvaluationPanel.evaluated',
    defaultMessage: 'Evaluated',
  },
  obsoleteBadge: {
    id: 'AiEvaluationPanel.obsoleteBadge',
    defaultMessage: 'Obsolete',
  },
  iteration: {
    id: 'AiEvaluationPanel.iteration',
    defaultMessage: 'Iteration #{number}',
  },
  fixRound: {
    id: 'AiEvaluationPanel.fixRound',
    defaultMessage: 'Fix round {number}',
  },
  obsolete: {
    id: 'AiEvaluationPanel.obsolete',
    defaultMessage: 'Obsolete — scenario changed after evaluation',
  },
  rubricTitle: {
    id: 'AiEvaluationRubricModal.title',
    defaultMessage: 'AI evaluation rubric',
  },
  rubricIntro: {
    id: 'AiEvaluationRubricModal.intro',
    defaultMessage:
      'The score measures test-case quality across six criteria. Lost points include an explanation; the rubric does not produce pass or fail verdicts.',
  },
  rubricSnapshotNote: {
    id: 'AiEvaluationRubricModal.snapshotNote',
    defaultMessage:
      'Criterion names and maximum scores come from the snapshot stored with this evaluation. A project’s current quality standard may change later.',
  },
  rubricDescriptionsUnavailable: {
    id: 'AiEvaluationRubricModal.descriptionsUnavailable',
    defaultMessage: 'Criterion descriptions are not available for this historical evaluation.',
  },
  criterionAtomicity: {
    id: 'AiEvaluationPanel.criterionAtomicity',
    defaultMessage: 'Atomicity',
  },
  criterionClearSteps: {
    id: 'AiEvaluationPanel.criterionClearSteps',
    defaultMessage: 'Clear steps',
  },
  criterionExpectedResults: {
    id: 'AiEvaluationPanel.criterionExpectedResults',
    defaultMessage: 'Clear expected results',
  },
  criterionNoInventedLogic: {
    id: 'AiEvaluationPanel.criterionNoInventedLogic',
    defaultMessage: 'No invented logic',
  },
  criterionNoInventedUi: {
    id: 'AiEvaluationPanel.criterionNoInventedUi',
    defaultMessage: 'No invented UI',
  },
  criterionCoherence: {
    id: 'AiEvaluationPanel.criterionCoherence',
    defaultMessage: 'Coherence',
  },
});
