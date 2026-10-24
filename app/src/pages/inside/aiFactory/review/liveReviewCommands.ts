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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { CommentState } from 'types/aiFactory';
import type { ReviewCommentPayload } from 'types/aiFactory';
import { approveNativeTestCase } from 'pages/inside/aiFactory/approval/nativeApproval';
import { toLiveReviewCommentPayload } from 'pages/inside/aiFactory/review/liveReviewComments';
import { LiveFixRoundError, startLiveFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';
import {
  acceptStartedRound,
  canMutateLiveReview,
  reconcileUnconfirmedStart,
  refreshLiveReview,
} from 'pages/inside/aiFactory/review/liveFixRoundMonitor';
import type { ReviewScope } from 'pages/inside/aiFactory/review/liveFixRoundMonitor';

interface CommandOptions<T> {
  execute: (signal: AbortSignal) => Promise<T>;
  onSuccess: (value: T) => void;
  onError?: (error: unknown) => void;
  rethrowError?: boolean;
}

const isCurrentCommand = (scope: ReviewScope, epoch: number, controller: AbortController): boolean =>
  scope.isCurrent() && scope.commandGeneration === epoch && !controller.signal.aborted;

const markCommentError = (scope: ReviewScope): void => {
  scope.snapshot.isMutationError = true;
  void refreshLiveReview(scope);
};

const runReviewCommand = async <T>(
  scope: ReviewScope,
  epoch: number,
  { execute, onSuccess, onError, rethrowError = true }: CommandOptions<T>,
): Promise<boolean> => {
  if (!scope.isCurrent() || scope.commandGeneration !== epoch || !canMutateLiveReview(scope))
    return false;
  const controller = new AbortController();
  scope.mutation = controller;
  scope.snapshot.isMutating = true;
  scope.snapshot.isMutationError = false;
  scope.publish();
  try {
    const result = await execute(controller.signal);
    if (!isCurrentCommand(scope, epoch, controller)) return false;
    onSuccess(result);
    return true;
  } catch (error: unknown) {
    if (!isCurrentCommand(scope, epoch, controller)) return false;
    if (onError) onError(error);
    else markCommentError(scope);
    if (rethrowError) throw error;
    return false;
  } finally {
    if (scope.isCurrent() && scope.mutation === controller) {
      scope.mutation = undefined;
      scope.snapshot.isMutating = false;
      if (scope.commandGeneration !== epoch && scope.isFixLocked) reconcileUnconfirmedStart(scope);
      scope.publish();
    }
  }
};

const mutateReviewComment = (
  scope: ReviewScope,
  epoch: number,
  url: string,
  method: 'POST' | 'DELETE',
  data?: unknown,
): Promise<boolean> => runReviewCommand(scope, epoch, {
  execute: (signal) => fetch(url, { method, data, signal }),
  onSuccess: () => { void refreshLiveReview(scope); },
});

export const addLiveReviewComment = (
  scope: ReviewScope,
  epoch: number,
  payload: ReviewCommentPayload,
): Promise<boolean> => mutateReviewComment(
  scope, epoch, URLS.liveTestCaseReviewComments(scope.projectKey, scope.testCaseId), 'POST',
  toLiveReviewCommentPayload(payload),
);

export const deleteLiveReviewComment = (
  scope: ReviewScope,
  epoch: number,
  commentId: number,
): Promise<boolean> => {
  const comment = scope.review?.comments.find(({ id }) => id === commentId);
  if (comment?.author.id !== scope.userId || comment?.state !== CommentState.PENDING)
    return Promise.resolve(false);
  return mutateReviewComment(scope, epoch,
    URLS.liveTestCaseReviewCommentById(scope.projectKey, scope.testCaseId, commentId), 'DELETE');
};

export const discardLiveReviewComments = (scope: ReviewScope, epoch: number): Promise<boolean> => {
  if (!scope.review?.unsentCount) return Promise.resolve(false);
  return mutateReviewComment(scope, epoch,
    URLS.liveTestCaseReviewComments(scope.projectKey, scope.testCaseId), 'DELETE');
};

export const approveLiveReview = (
  scope: ReviewScope,
  epoch: number,
  approvalEpoch: number,
): Promise<boolean> => {
  if (!scope.canApprove || scope.isApproved || scope.review?.unsentCount !== 0)
    return Promise.resolve(false);
  if (approvalEpoch !== scope.approvalGeneration) return Promise.resolve(false);
  return runReviewCommand(scope, epoch, {
    execute: (signal) => approveNativeTestCase(scope.projectKey, scope.testCaseId, signal),
    onSuccess: () => {
      scope.isApproved = true;
      void refreshLiveReview(scope);
    },
    onError: () => { void refreshLiveReview(scope); },
  });
};

export const canPushLiveReview = (scope: ReviewScope): boolean =>
  canMutateLiveReview(scope) && scope.allowPush && !scope.isApproved &&
  Boolean(scope.review?.unsentCount) && !scope.snapshot.fixMonitoringError;

const handleStartError = (scope: ReviewScope, error: unknown): void => {
  const reason = error instanceof LiveFixRoundError ? error.reason : 'UNCONFIRMED';
  if (reason === 'UNCONFIRMED') {
    reconcileUnconfirmedStart(scope);
    return;
  }
  scope.isFixLocked = false;
  scope.fixStartedAt = undefined;
  scope.snapshot.fixStartError = reason === 'CONFLICT' ? 'CONFLICT' : 'FAILED';
  void refreshLiveReview(scope);
};

export const pushLiveReviewToAgent = (scope: ReviewScope, epoch: number): Promise<boolean> => {
  if (!canPushLiveReview(scope)) return Promise.resolve(false);
  return runReviewCommand(scope, epoch, {
    execute: (signal) => {
      scope.isFixLocked = true;
      scope.fixStartedAt = Date.now();
      scope.snapshot.fixCompleted = false;
      scope.snapshot.fixStartError = undefined;
      scope.publish();
      return startLiveFixRound(scope.projectKey, scope.testCaseId, signal);
    },
    onSuccess: (round) => acceptStartedRound(scope, round),
    onError: (error) => handleStartError(scope, error),
    rethrowError: false,
  });
};
