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

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { idSelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import type { ReviewCommentPayload, ReviewCommentRS } from 'types/aiFactory';
import type { FixStartError, NativeFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';
import {
  createReviewSnapshot,
  isFixInProgress,
  refreshLiveReview,
  retryLiveFixObservation,
  stopReviewObservation,
} from 'pages/inside/aiFactory/review/liveFixRoundMonitor';
import type {
  FixMonitoringError,
  ReviewScope,
  ReviewSnapshot,
} from 'pages/inside/aiFactory/review/liveFixRoundMonitor';
import {
  addLiveReviewComment,
  approveLiveReview,
  canPushLiveReview,
  deleteLiveReviewComment,
  discardLiveReviewComments,
  pushLiveReviewToAgent,
} from 'pages/inside/aiFactory/review/liveReviewCommands';

export interface LiveReviewCommentsLoadState {
  resourceKey: object;
  approveReady?: () => Promise<boolean>;
  isApproved?: boolean;
  comments: ReviewCommentRS[];
  unsentCount: number;
  fixInProgress: boolean;
  fixRound?: number;
  fixRoundState?: NativeFixRound;
  fixMonitoringError?: FixMonitoringError;
  fixStartError?: FixStartError;
  fixCompleted?: boolean;
  canPush?: boolean;
  pushToAgent?: () => Promise<boolean>;
  retryFixMonitoring?: () => void;
  isLoaded: boolean;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  isMutationError: boolean;
  reload: () => void;
  addComment: (payload: ReviewCommentPayload) => Promise<boolean>;
  deleteComment: (commentId: number) => Promise<boolean>;
  discardPending: () => Promise<boolean>;
}

interface LiveReviewCommentsOptions {
  canApprove?: boolean;
  versionId?: number;
  allowPush?: boolean;
  onFixCompleted?: () => void;
}

interface CompletionIdentity {
  projectKey: string;
  testCaseId: number;
  isResourceEnabled: boolean;
  completedRoundIds: Set<number>;
}

const recordRoundCompletion = (identity: CompletionIdentity, roundId?: number): boolean => {
  if (roundId === undefined) return true;
  if (identity.completedRoundIds.has(roundId)) return false;
  identity.completedRoundIds.add(roundId);
  return true;
};

interface ScopedSnapshot extends ReviewSnapshot {
  scope?: ReviewScope;
}
const EMPTY_COMMENTS: ReviewCommentRS[] = [];

const updateScopePermissions = (
  scope: ReviewScope,
  canReview: boolean,
  canApprove: boolean,
  userId: number | undefined,
  allowPush: boolean,
  isDraft: boolean,
): void => {
  if (scope.canReview !== canReview || scope.userId !== userId || scope.canApprove !== canApprove)
    scope.commandGeneration += 1;
  if (scope.canApprove !== canApprove) scope.approvalGeneration += 1;
  scope.canReview = canReview;
  scope.canApprove = canApprove;
  scope.userId = userId;
  scope.allowPush = allowPush;
  if (!isDraft) scope.isApproved = false;
};

const updateCompletionCallback = (scope: ReviewScope, callback?: () => void): void => {
  scope.completedCallback = callback;
};

const activateReviewScope = (scope: ReviewScope): (() => void) => {
  scope.active = true;
  void refreshLiveReview(scope);
  return () => {
    scope.active = false;
    scope.mutation?.abort();
    stopReviewObservation(scope, true);
  };
};

export const useLiveReviewComments = (
  projectKey: string,
  testCaseId: number,
  isEnabled: boolean,
  { canApprove = false, versionId, allowPush = true, onFixCompleted }: LiveReviewCommentsOptions = {},
): LiveReviewCommentsLoadState => {
  const { canReviewAiTestCases } = useUserPermissions();
  const currentUserId = useSelector(idSelector) as number | undefined;
  const [state, setState] = useState<ScopedSnapshot>(createReviewSnapshot);
  const isResourceEnabled = isEnabled && Boolean(projectKey) &&
    Number.isSafeInteger(testCaseId) && testCaseId > 0;
  const feedbackKey = useMemo<CompletionIdentity>(() => ({
    projectKey, testCaseId, isResourceEnabled, completedRoundIds: new Set<number>(),
  }),
    [projectKey, testCaseId, isResourceEnabled]);
  const [completion, setCompletion] = useState<{ key: object; round?: NativeFixRound }>();
  const scope = useMemo<ReviewScope>(() => {
    const next: ReviewScope = {
      projectKey, testCaseId, versionId, isEnabled: isResourceEnabled,
      active: false, canReview: false, canApprove: false, allowPush: false,
      approvalGeneration: 0, commandGeneration: 0, generation: 0,
      isApproved: false, isLoading: true, isFixLocked: false,
      observedFixing: false, completionPending: false,
      snapshot: createReviewSnapshot(),
      isCurrent: () => next.active && next.isEnabled,
      publish: () => {
        if (next.isCurrent()) setState({ ...next.snapshot, scope: next });
      },
      onObservationStarted: () => setCompletion(undefined),
      onCompleted: () => {
        const round = next.snapshot.fixRoundState;
        const shouldNotify = recordRoundCompletion(feedbackKey, round?.id);
        setCompletion({ key: feedbackKey, round });
        if (shouldNotify) next.completedCallback?.();
      },
    };
    return next;
  }, [projectKey, testCaseId, versionId, isResourceEnabled, feedbackKey]);
  useLayoutEffect(() => {
    updateCompletionCallback(scope, onFixCompleted);
  }, [scope, onFixCompleted]);
  updateScopePermissions(scope, canReviewAiTestCases,
    canApprove && canReviewAiTestCases && isResourceEnabled, currentUserId, allowPush, canApprove);
  const epoch = scope.commandGeneration;
  const approvalEpoch = scope.approvalGeneration;

  useLayoutEffect(() => {
    if (!isResourceEnabled) return undefined;
    return activateReviewScope(scope);
  }, [isResourceEnabled, scope]);

  const reload = useCallback(() => { void refreshLiveReview(scope); }, [scope]);
  const addComment = useCallback((payload: ReviewCommentPayload) =>
    addLiveReviewComment(scope, epoch, payload), [epoch, scope]);
  const deleteComment = useCallback((id: number) =>
    deleteLiveReviewComment(scope, epoch, id), [epoch, scope]);
  const discardPending = useCallback(() => discardLiveReviewComments(scope, epoch), [epoch, scope]);
  const approveReady = useCallback(() =>
    approveLiveReview(scope, epoch, approvalEpoch), [approvalEpoch, epoch, scope]);
  const pushToAgent = useCallback(() => {
    if (canPushLiveReview(scope)) setCompletion(undefined);
    return pushLiveReviewToAgent(scope, epoch);
  }, [epoch, scope]);
  const retryFixMonitoring = useCallback(() => retryLiveFixObservation(scope), [scope]);
  const isCurrentState = isResourceEnabled && state.scope === scope;
  const data = isCurrentState ? state.data : undefined;
  const fixing = isCurrentState && isFixInProgress(scope);
  const completed = completion?.key === feedbackKey && !fixing;
  return {
    resourceKey: scope, approveReady, reload, addComment, deleteComment, discardPending,
    pushToAgent, retryFixMonitoring,
    isApproved: isCurrentState && scope.isApproved,
    canPush: isCurrentState && canPushLiveReview(scope),
    comments: data?.comments ?? EMPTY_COMMENTS,
    unsentCount: data?.unsentCount ?? 0,
    fixInProgress: fixing,
    fixRound: data?.fixRound ?? (isCurrentState ? state.fixRoundState?.roundNumber : undefined),
    fixRoundState: (isCurrentState ? state.fixRoundState : undefined) ?? (completed ? completion?.round : undefined),
    fixMonitoringError: isCurrentState ? state.fixMonitoringError : undefined,
    fixStartError: isCurrentState ? state.fixStartError : undefined,
    fixCompleted: completed || (isCurrentState && state.fixCompleted),
    isLoaded: Boolean(data) && !state.isError && isCurrentState,
    isLoading: isResourceEnabled && (!isCurrentState || state.isLoading),
    isError: isCurrentState && state.isError,
    isMutating: isCurrentState && state.isMutating,
    isMutationError: isCurrentState && state.isMutationError,
  };
};
