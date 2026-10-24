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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { idSelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { CommentState } from 'types/aiFactory';
import type { ReviewCommentPayload, ReviewCommentRS } from 'types/aiFactory';
import {
  normalizeLiveReview,
  toLiveReviewCommentPayload,
} from 'pages/inside/aiFactory/review/liveReviewComments';
import type { LiveReviewData } from 'pages/inside/aiFactory/review/liveReviewComments';

export interface LiveReviewCommentsLoadState {
  resourceKey: object;
  comments: ReviewCommentRS[];
  unsentCount: number;
  fixInProgress: boolean;
  fixRound?: number;
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

interface ReviewScope {
  projectKey: string;
  testCaseId: number;
  isEnabled: boolean;
  active: boolean;
  canReview: boolean;
  userId?: number;
  generation: number;
  isLoading: boolean;
  review?: LiveReviewData;
  mutation?: AbortController;
}

interface ReviewState {
  scope?: ReviewScope;
  data?: LiveReviewData;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  isMutationError: boolean;
}

const INITIAL_STATE: ReviewState = {
  isLoading: false,
  isError: false,
  isMutating: false,
  isMutationError: false,
};
const EMPTY_COMMENTS: ReviewCommentRS[] = [];

const canMutate = (scope: ReviewScope): boolean =>
  scope.active &&
  scope.canReview &&
  Boolean(scope.review) &&
  !scope.review?.fixInProgress &&
  !scope.isLoading &&
  !scope.mutation;

export const useLiveReviewComments = (
  projectKey: string,
  testCaseId: number,
  isEnabled: boolean,
): LiveReviewCommentsLoadState => {
  const { canReviewAiTestCases } = useUserPermissions();
  const currentUserId = useSelector(idSelector) as number | undefined;
  const isResourceEnabled =
    isEnabled && Boolean(projectKey) && Number.isSafeInteger(testCaseId) && testCaseId > 0;
  const scope = useMemo<ReviewScope>(
    () => ({
      projectKey,
      testCaseId,
      isEnabled: isResourceEnabled,
      active: false,
      canReview: false,
      generation: 0,
      isLoading: true,
    }),
    [projectKey, testCaseId, isResourceEnabled],
  );
  const currentScope = useRef(scope);
  currentScope.current = scope;
  scope.canReview = canReviewAiTestCases;
  scope.userId = currentUserId;
  const [state, setState] = useState<ReviewState>(INITIAL_STATE);
  const [requestIndex, setRequestIndex] = useState(0);
  const reload = useCallback(() => {
    if (currentScope.current === scope && scope.active) {
      scope.isLoading = true;
      scope.generation += 1;
      setRequestIndex((index) => index + 1);
    }
  }, [scope]);
  const isCurrent = useCallback(() => currentScope.current === scope && scope.active, [scope]);

  useEffect(() => {
    if (!isResourceEnabled) return undefined;
    scope.active = true;
    return () => {
      scope.active = false;
      scope.mutation?.abort();
    };
  }, [isResourceEnabled, scope]);

  useEffect(() => {
    if (!isResourceEnabled) return undefined;
    const controller = new AbortController();
    scope.generation += 1;
    const generation = scope.generation;
    scope.isLoading = true;
    setState((previous) => ({
      ...(previous.scope === scope ? previous : INITIAL_STATE),
      scope,
      isLoading: true,
      isError: false,
    }));
    void fetch<unknown>(URLS.liveTestCaseReview(projectKey, testCaseId), {
      signal: controller.signal,
    })
      .then((response) => {
        if (!isCurrent() || controller.signal.aborted || generation !== scope.generation) return;
        const data = normalizeLiveReview(response, scope.userId);
        scope.review = data;
        scope.isLoading = false;
        setState((previous) => ({ ...previous, scope, data, isLoading: false, isError: false }));
      })
      .catch(() => {
        if (!isCurrent() || controller.signal.aborted || generation !== scope.generation) return;
        scope.review = undefined;
        scope.isLoading = false;
        setState((previous) => ({
          ...previous,
          scope,
          isLoading: false,
          isError: true,
        }));
      });
    return () => controller.abort();
  }, [isResourceEnabled, isCurrent, projectKey, requestIndex, scope, testCaseId]);

  const mutate = useCallback(
    async (url: string, method: 'POST' | 'DELETE', data?: unknown) => {
      if (!isCurrent() || !canMutate(scope)) return false;
      const controller = new AbortController();
      scope.mutation = controller;
      setState((previous) => ({ ...previous, isMutating: true, isMutationError: false }));
      try {
        await fetch(url, { method, data, signal: controller.signal });
        if (!isCurrent() || controller.signal.aborted) return false;
        reload();
        return true;
      } catch (error: unknown) {
        if (!isCurrent() || controller.signal.aborted) return false;
        setState((previous) => ({ ...previous, isMutationError: true }));
        reload();
        throw error;
      } finally {
        if (isCurrent() && scope.mutation === controller) {
          scope.mutation = undefined;
          setState((previous) => ({ ...previous, isMutating: false }));
        }
      }
    },
    [isCurrent, reload, scope],
  );

  const addComment = useCallback(
    async (payload: ReviewCommentPayload) => {
      if (!isCurrent() || !canMutate(scope)) return false;
      return mutate(
        URLS.liveTestCaseReviewComments(projectKey, testCaseId),
        'POST',
        toLiveReviewCommentPayload(payload),
      );
    },
    [isCurrent, mutate, projectKey, scope, testCaseId],
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      const comment = scope.review?.comments.find(({ id }) => id === commentId);
      if (comment?.author.id !== scope.userId || comment?.state !== CommentState.PENDING)
        return false;
      return mutate(
        URLS.liveTestCaseReviewCommentById(projectKey, testCaseId, commentId),
        'DELETE',
      );
    },
    [mutate, projectKey, scope, testCaseId],
  );

  const discardPending = useCallback(async () => {
    if (!scope.review?.unsentCount) return false;
    return mutate(URLS.liveTestCaseReviewComments(projectKey, testCaseId), 'DELETE');
  }, [mutate, projectKey, scope, testCaseId]);
  const isCurrentState = isResourceEnabled && state.scope === scope;
  const data = isCurrentState ? state.data : undefined;
  return {
    resourceKey: scope,
    comments: data?.comments ?? EMPTY_COMMENTS,
    unsentCount: data?.unsentCount ?? 0,
    fixInProgress: data?.fixInProgress ?? false,
    fixRound: data?.fixRound,
    isLoaded: Boolean(data) && !state.isError && isCurrentState,
    isLoading: isResourceEnabled && (!isCurrentState || state.isLoading),
    isError: isCurrentState && state.isError,
    isMutating: isCurrentState && state.isMutating,
    isMutationError: isCurrentState && state.isMutationError,
    reload,
    addComment,
    deleteComment,
    discardPending,
  };
};
