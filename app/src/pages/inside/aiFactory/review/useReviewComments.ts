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

import { useCallback, useEffect, useState } from 'react';

import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { CommentState, CommentTargetType } from 'types/aiFactory';
import type {
  AiCommentState,
  AiCommentTargetType,
  ReviewCommentPayload,
  ReviewCommentRS,
} from 'types/aiFactory';

interface ReviewCommentsState {
  comments: ReviewCommentRS[];
  requestKey: string;
  isError: boolean;
}

export interface ReviewCommentsLoadState {
  comments: ReviewCommentRS[];
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  reload: () => void;
  addComment: (payload: ReviewCommentPayload) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  discardPending: () => Promise<void>;
}

const INITIAL_STATE: ReviewCommentsState = {
  comments: [],
  requestKey: '',
  isError: false,
};

const COMMENT_STATES = new Set<string>(Object.values(CommentState));
const TARGET_TYPES = new Set<string>(Object.values(CommentTargetType));

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const normalizeComment = (value: unknown): ReviewCommentRS | null => {
  const comment = asRecord(value);
  const target = asRecord(comment?.target);
  const author = asRecord(comment?.author);
  if (
    !comment ||
    !target ||
    !author ||
    typeof comment.id !== 'number' ||
    !Number.isFinite(comment.id) ||
    typeof comment.text !== 'string' ||
    typeof comment.createdAt !== 'number' ||
    !Number.isFinite(comment.createdAt) ||
    typeof comment.state !== 'string' ||
    !COMMENT_STATES.has(comment.state) ||
    typeof comment.canDelete !== 'boolean' ||
    typeof target.type !== 'string' ||
    !TARGET_TYPES.has(target.type) ||
    typeof author.id !== 'number' ||
    typeof author.name !== 'string'
  ) {
    return null;
  }

  if (
    target.type === String(CommentTargetType.STEP) &&
    (typeof target.stepId !== 'number' || !Number.isFinite(target.stepId))
  ) {
    return null;
  }

  return {
    id: comment.id,
    target: {
      type: target.type as AiCommentTargetType,
      stepId: typeof target.stepId === 'number' ? target.stepId : undefined,
    },
    text: comment.text,
    author: { id: author.id, name: author.name },
    createdAt: comment.createdAt,
    state: comment.state as AiCommentState,
    fixRound: typeof comment.fixRound === 'number' ? comment.fixRound : undefined,
    reason: typeof comment.reason === 'string' ? comment.reason : undefined,
    canDelete: comment.canDelete,
  };
};

const normalizeComments = (value: unknown): ReviewCommentRS[] =>
  Array.isArray(value)
    ? value.map(normalizeComment).filter((comment): comment is ReviewCommentRS => comment !== null)
    : [];

export const useReviewComments = (
  projectKey: string,
  testCaseId: number,
  isEnabled: boolean,
): ReviewCommentsLoadState => {
  const { canReviewAiTestCases } = useUserPermissions();
  const [state, setState] = useState<ReviewCommentsState>(INITIAL_STATE);
  const [requestIndex, setRequestIndex] = useState(0);
  const [isMutating, setIsMutating] = useState(false);
  const requestKey = `${projectKey}:${testCaseId}:${requestIndex}`;
  const url = URLS.testCaseReviewComments(projectKey, testCaseId);

  const reload = useCallback(() => setRequestIndex((index) => index + 1), []);

  useEffect(() => {
    if (!isEnabled || !projectKey || !testCaseId) {
      return undefined;
    }

    let cancelRequest = () => {};

    void fetch<ReviewCommentRS[]>(url, {
      abort: (cancel) => {
        cancelRequest = cancel;
      },
    })
      .then((comments) =>
        setState({ comments: normalizeComments(comments), requestKey, isError: false }),
      )
      .catch((error: unknown) => {
        if (error instanceof Error && error.message === ERROR_CANCELED) return;
        setState({ comments: [], requestKey, isError: true });
      });

    return cancelRequest;
  }, [isEnabled, projectKey, requestKey, testCaseId, url]);

  const mutate = useCallback(async (request: () => Promise<unknown>) => {
    setIsMutating(true);
    try {
      await request();
      setRequestIndex((index) => index + 1);
    } finally {
      setIsMutating(false);
    }
  }, []);

  const addComment = useCallback(
    async (payload: ReviewCommentPayload) => {
      if (!canReviewAiTestCases) return;

      await mutate(() => fetch(url, { method: 'POST', data: payload }));
    },
    [canReviewAiTestCases, mutate, url],
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!canReviewAiTestCases) return;

      await mutate(() =>
        fetch(URLS.testCaseReviewCommentById(projectKey, testCaseId, commentId), {
          method: 'DELETE',
        }),
      );
    },
    [canReviewAiTestCases, mutate, projectKey, testCaseId],
  );

  const discardPending = useCallback(
    async () => {
      if (!canReviewAiTestCases) return;

      await mutate(() =>
        fetch(URLS.discardTestCaseReviewComments(projectKey, testCaseId), { method: 'DELETE' }),
      );
    },
    [canReviewAiTestCases, mutate, projectKey, testCaseId],
  );

  const isCurrentRequest = state.requestKey === requestKey;

  return {
    comments: isEnabled && isCurrentRequest ? state.comments : [],
    isLoading: isEnabled && Boolean(projectKey) && Boolean(testCaseId) && !isCurrentRequest,
    isError: isCurrentRequest && state.isError,
    isMutating,
    reload,
    addComment,
    deleteComment,
    discardPending,
  };
};
