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
  reviewComments: {
    id: 'AiReview.reviewComments',
    defaultMessage: 'Review comments',
  },
  notSentCount: {
    id: 'AiReview.notSentCount',
    defaultMessage: '{count} not sent',
  },
  discard: {
    id: 'AiReview.discard',
    defaultMessage: 'Discard comments',
  },
  discardConfirmation: {
    id: 'AiReview.discardConfirmation',
    defaultMessage: 'Discard all unsent review comments?',
  },
  push: {
    id: 'AiReview.push',
    defaultMessage: 'Push to agent · {count}',
  },
  addAtLeastOne: {
    id: 'AiReview.addAtLeastOne',
    defaultMessage: 'Add at least one review comment',
  },
  fixingHint: {
    id: 'AiReview.fixingHint',
    defaultMessage: 'Comments are read-only while the agent is fixing this Test Case',
  },
  permissionHint: {
    id: 'AiReview.permissionHint',
    defaultMessage: "You don't have permission to update AI review comments",
  },
  commentCount: {
    id: 'AiReview.commentCount',
    defaultMessage: '{count, plural, one {# comment} other {# comments}}',
  },
  addCommentLabel: {
    id: 'AiReview.addCommentLabel',
    defaultMessage: 'Add review comment',
  },
  placeholder: {
    id: 'AiReview.placeholder',
    defaultMessage: 'Describe what the agent should change',
  },
  add: {
    id: 'AiReview.add',
    defaultMessage: 'Add',
  },
  delete: {
    id: 'AiReview.delete',
    defaultMessage: 'Delete comment',
  },
  pending: {
    id: 'AiReview.pending',
    defaultMessage: 'Not sent',
  },
  sent: {
    id: 'AiReview.sent',
    defaultMessage: 'Sent · agent fixing',
  },
  addressed: {
    id: 'AiReview.addressed',
    defaultMessage: 'Addressed · Fix round {round}',
  },
  notAddressed: {
    id: 'AiReview.notAddressed',
    defaultMessage: 'Not addressed · Fix round {round}',
  },
  loading: {
    id: 'AiReview.loading',
    defaultMessage: 'Loading review comments',
  },
  loadError: {
    id: 'AiReview.loadError',
    defaultMessage: 'Review comments could not be loaded.',
  },
  retry: {
    id: 'AiReview.retry',
    defaultMessage: 'Retry',
  },
  mutationError: {
    id: 'AiReview.mutationError',
    defaultMessage: 'The review comment could not be updated. Please try again.',
  },
  fixing: {
    id: 'AiReview.fixing',
    defaultMessage: 'Agent is fixing… · Fix round {round}',
  },
  fixStartFailed: {
    id: 'AiReview.fixStartFailed',
    defaultMessage: 'The fix round could not be started. Your comments were not sent.',
  },
  fixPassed: {
    id: 'AiReview.fixPassed',
    defaultMessage: 'Fix round {round} finished. The Test Case returned to Draft.',
  },
  fixPassedAutoReady: {
    id: 'AiReview.fixPassedAutoReady',
    defaultMessage: 'Fix round {round} finished and Auto-Ready promoted the Test Case.',
  },
  fixGradeFailed: {
    id: 'AiReview.fixGradeFailed',
    defaultMessage: 'Fix round {round} updated the scenario, but grading failed.',
  },
  fixFailed: {
    id: 'AiReview.fixFailed',
    defaultMessage: 'Fix round {round} failed. The Test Case was not changed.',
  },
  failedActions: {
    id: 'AiReview.failedActions',
    defaultMessage: 'The agent could not apply these comments. Push again or discard them.',
  },
  pushAgain: {
    id: 'AiReview.pushAgain',
    defaultMessage: 'Push again',
  },
  whatChanged: {
    id: 'AiReview.whatChanged',
    defaultMessage: 'What the agent changed',
  },
  changesTitle: {
    id: 'AiReview.changesTitle',
    defaultMessage: 'What the agent changed · Fix round {round}',
  },
  scoreChange: {
    id: 'AiReview.scoreChange',
    defaultMessage: 'AI quality score: {before} → {after}',
  },
  before: {
    id: 'AiReview.before',
    defaultMessage: 'Before',
  },
  after: {
    id: 'AiReview.after',
    defaultMessage: 'After',
  },
  precondition: {
    id: 'AiReview.precondition',
    defaultMessage: 'Precondition',
  },
  instructions: {
    id: 'AiReview.instructions',
    defaultMessage: 'Instructions',
  },
  expectedResult: {
    id: 'AiReview.expectedResult',
    defaultMessage: 'Expected result',
  },
  noScenarioContent: {
    id: 'AiReview.noScenarioContent',
    defaultMessage: 'Scenario details are not available for this snapshot.',
  },
  close: {
    id: 'AiReview.close',
    defaultMessage: 'Close',
  },
});
