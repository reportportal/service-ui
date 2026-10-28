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
import { normalizeLiveReview } from 'pages/inside/aiFactory/review/liveReviewComments';
import type { LiveReviewData } from 'pages/inside/aiFactory/review/liveReviewComments';
import { LiveFixRoundError, loadLiveFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';
import type { FixStartError, NativeFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';

export const LIVE_FIX_POLL_INTERVAL = 3000;
export const LIVE_FIX_OBSERVATION_TIMEOUT = 30 * 60 * 1000;
export type FixMonitoringError = 'READ' | 'TIMEOUT' | 'MISSING';

export interface ReviewSnapshot {
  data?: LiveReviewData;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  isMutationError: boolean;
  fixRoundState?: NativeFixRound;
  fixMonitoringError?: FixMonitoringError;
  fixStartError?: FixStartError;
  fixCompleted: boolean;
}

export interface ReviewScope {
  projectKey: string;
  testCaseId: number;
  versionId?: number;
  active: boolean;
  isEnabled: boolean;
  canReview: boolean;
  canApprove: boolean;
  allowPush: boolean;
  approvalGeneration: number;
  commandGeneration: number;
  isApproved: boolean;
  userId?: number;
  generation: number;
  isLoading: boolean;
  review?: LiveReviewData;
  mutation?: AbortController;
  read?: AbortController;
  timer?: ReturnType<typeof setTimeout>;
  deadlineTimer?: ReturnType<typeof setTimeout>;
  fixStartedAt?: number;
  pendingRoundId?: number;
  isFixLocked: boolean;
  observedFixing: boolean;
  completionPending: boolean;
  snapshot: ReviewSnapshot;
  isCurrent: () => boolean;
  publish: () => void;
  onCompleted: () => void;
  onObservationStarted: () => void;
  completedCallback?: () => void;
}

export const createReviewSnapshot = (): ReviewSnapshot => ({
  isLoading: false,
  isError: false,
  isMutating: false,
  isMutationError: false,
  fixCompleted: false,
});

export const isFixInProgress = (scope: ReviewScope): boolean =>
  scope.isFixLocked || Boolean(scope.snapshot.data?.fixInProgress);

export const canMutateLiveReview = (scope: ReviewScope): boolean =>
  scope.active && scope.canReview && Boolean(scope.review) &&
  !isFixInProgress(scope) && !scope.isLoading && !scope.mutation;

export const stopReviewObservation = (scope: ReviewScope, stopDeadline = false): void => {
  if (stopDeadline) clearTimeout(scope.deadlineTimer);
  clearTimeout(scope.timer);
  scope.timer = undefined;
  scope.read?.abort();
  scope.read = undefined;
  scope.generation += 1;
};

const armObservationDeadline = (scope: ReviewScope): void => {
  clearTimeout(scope.deadlineTimer);
  if (scope.fixStartedAt === undefined || scope.snapshot.fixMonitoringError) return;
  const remaining = LIVE_FIX_OBSERVATION_TIMEOUT - (Date.now() - scope.fixStartedAt);
  scope.deadlineTimer = setTimeout(() => {
    if (!scope.isCurrent() || !isFixInProgress(scope)) return;
    stopReviewObservation(scope);
    scope.isLoading = false;
    scope.snapshot.isLoading = false;
    scope.snapshot.fixMonitoringError = 'TIMEOUT';
    scope.publish();
  }, Math.max(0, remaining));
};

const beginExternalObservation = (scope: ReviewScope): void => {
  scope.pendingRoundId = undefined;
  scope.completionPending = false;
  scope.fixStartedAt = Date.now();
  scope.snapshot.fixCompleted = false;
  scope.snapshot.fixRoundState = undefined;
  scope.snapshot.fixStartError = undefined;
  scope.snapshot.fixMonitoringError = undefined;
  scope.onObservationStarted();
};

const markFixObserved = (scope: ReviewScope, data: LiveReviewData): void => {
  if (!data.fixInProgress) return;
  const previousRound = scope.snapshot.fixRoundState;
  const isNewCorrelatedRound = previousRound !== undefined && previousRound.status !== 'PENDING' &&
    data.fixRoundId !== undefined && previousRound?.id !== data.fixRoundId;
  if (isNewCorrelatedRound || scope.snapshot.fixCompleted ||
    (!scope.isFixLocked && !scope.observedFixing)) {
    beginExternalObservation(scope);
  }
  scope.fixStartedAt ??= Date.now();
  scope.isFixLocked = true;
  scope.observedFixing = true;
  scope.pendingRoundId ??= data.fixRoundId;
  armObservationDeadline(scope);
};

const completeObservation = (scope: ReviewScope): void => {
  clearTimeout(scope.deadlineTimer);
  scope.isFixLocked = false;
  scope.observedFixing = false;
  scope.pendingRoundId = undefined;
  scope.fixStartedAt = undefined;
  scope.completionPending = false;
  scope.snapshot.fixCompleted = true;
  scope.snapshot.fixStartError = undefined;
  scope.snapshot.fixMonitoringError = undefined;
  scope.onCompleted();
};

const reconcileReview = (scope: ReviewScope, data: LiveReviewData): void => {
  scope.review = data;
  scope.snapshot.data = data;
  const hasUnfinishedRound = scope.pendingRoundId !== undefined ||
    scope.snapshot.fixRoundState?.status === 'PENDING';
  const hasFinished = scope.completionPending ||
    (!hasUnfinishedRound && scope.observedFixing && scope.snapshot.fixMonitoringError !== 'MISSING');
  if (!data.fixInProgress && hasFinished) completeObservation(scope);
  markFixObserved(scope, data);
};

const hasObservationTime = (scope: ReviewScope): boolean => {
  if (scope.fixStartedAt === undefined) return true;
  if (Date.now() - scope.fixStartedAt < LIVE_FIX_OBSERVATION_TIMEOUT) return true;
  scope.snapshot.fixMonitoringError = 'TIMEOUT';
  scope.publish();
  return false;
};

const scheduleObservation = (scope: ReviewScope): void => {
  clearTimeout(scope.timer);
  if (!scope.isCurrent() || !isFixInProgress(scope) || scope.snapshot.fixMonitoringError) return;
  if (!hasObservationTime(scope)) return;
  scope.timer = setTimeout(() => {
    if (!scope.isCurrent() || !hasObservationTime(scope)) return;
    if (scope.pendingRoundId !== undefined) void observeRound(scope);
    else void refreshLiveReview(scope);
  }, LIVE_FIX_POLL_INTERVAL);
};

const handleReviewError = (scope: ReviewScope): void => {
  scope.review = undefined;
  scope.snapshot.isError = true;
  if (isFixInProgress(scope)) {
    clearTimeout(scope.deadlineTimer);
    scope.snapshot.fixMonitoringError ??= 'READ';
  }
};

export const refreshLiveReview = async (scope: ReviewScope): Promise<void> => {
  if (!scope.isCurrent()) return;
  stopReviewObservation(scope);
  armObservationDeadline(scope);
  const controller = new AbortController();
  scope.read = controller;
  const generation = scope.generation;
  scope.isLoading = true;
  scope.snapshot.isLoading = true;
  scope.snapshot.isError = false;
  scope.publish();
  try {
    const response = await fetch<unknown>(URLS.liveTestCaseReview(scope.projectKey, scope.testCaseId), {
      signal: controller.signal,
    });
    if (!scope.isCurrent() || controller.signal.aborted || generation !== scope.generation) return;
    reconcileReview(scope, normalizeLiveReview(response, scope.userId));
  } catch {
    if (!scope.isCurrent() || controller.signal.aborted || generation !== scope.generation) return;
    handleReviewError(scope);
  } finally {
    if (scope.isCurrent() && !controller.signal.aborted && generation === scope.generation) {
      scope.read = undefined;
      scope.isLoading = false;
      scope.snapshot.isLoading = false;
      scope.publish();
      scheduleObservation(scope);
    }
  }
};

const acceptObservedRound = async (scope: ReviewScope, round: NativeFixRound): Promise<void> => {
  scope.snapshot.fixRoundState = round;
  if (round.status === 'PENDING') {
    scope.publish();
    scheduleObservation(scope);
    return;
  }
  scope.completionPending = true;
  scope.pendingRoundId = undefined;
  await refreshLiveReview(scope);
};

const reconcileMissingRound = async (scope: ReviewScope): Promise<void> => {
  clearTimeout(scope.deadlineTimer);
  scope.snapshot.fixMonitoringError = 'MISSING';
  await refreshLiveReview(scope);
  scope.snapshot.fixMonitoringError = 'MISSING';
  scope.publish();
};

const observeRound = async (scope: ReviewScope): Promise<void> => {
  const id = scope.pendingRoundId;
  if (id === undefined || !scope.isCurrent()) return;
  const controller = new AbortController();
  scope.read = controller;
  const generation = scope.generation;
  const isCurrent = () => scope.isCurrent() && !controller.signal.aborted && generation === scope.generation;
  try {
    const round = await loadLiveFixRound(scope.projectKey, scope.testCaseId, id, controller.signal);
    if (!isCurrent()) return;
    scope.read = undefined;
    await acceptObservedRound(scope, round);
  } catch (error: unknown) {
    if (!isCurrent()) return;
    scope.read = undefined;
    if (error instanceof LiveFixRoundError && error.reason === 'MISSING') {
      await reconcileMissingRound(scope);
      return;
    }
    clearTimeout(scope.deadlineTimer);
    scope.snapshot.fixMonitoringError = 'READ';
    scope.publish();
  }
};

export const acceptStartedRound = (scope: ReviewScope, round: NativeFixRound): void => {
  stopReviewObservation(scope);
  scope.fixStartedAt = Date.now();
  scope.isFixLocked = true;
  scope.observedFixing = true;
  scope.snapshot.fixCompleted = false;
  scope.snapshot.fixMonitoringError = undefined;
  scope.snapshot.fixStartError = undefined;
  scope.snapshot.fixRoundState = round;
  scope.pendingRoundId = round.status === 'PENDING' ? round.id : undefined;
  scope.completionPending = round.status !== 'PENDING';
  scope.publish();
  void refreshLiveReview(scope);
};

export const reconcileUnconfirmedStart = (scope: ReviewScope): void => {
  scope.isFixLocked = true;
  scope.fixStartedAt = Date.now();
  scope.snapshot.fixCompleted = false;
  scope.snapshot.fixRoundState = undefined;
  scope.snapshot.fixStartError = 'UNCONFIRMED';
  void refreshLiveReview(scope);
};

export const retryLiveFixObservation = (scope: ReviewScope): void => {
  if (!scope.isCurrent() || scope.mutation || !scope.snapshot.fixMonitoringError) return;
  scope.fixStartedAt = Date.now();
  scope.snapshot.fixMonitoringError = undefined;
  armObservationDeadline(scope);
  scope.publish();
  if (scope.pendingRoundId !== undefined) void observeRound(scope);
  else void refreshLiveReview(scope);
};
