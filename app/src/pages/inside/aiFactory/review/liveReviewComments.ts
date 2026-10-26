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

import { CommentState, CommentTargetType } from 'types/aiFactory';
import type { ReviewCommentPayload, ReviewCommentRS, ReviewCommentTarget } from 'types/aiFactory';

export interface LiveReviewData {
  comments: ReviewCommentRS[];
  unsentCount: number;
  fixInProgress: boolean;
  fixRound?: number;
}

export interface LiveReviewCommentPayload {
  targetType: 'PRECONDITION' | 'STEP' | 'SCENARIO_TEXT';
  stepNumber?: number;
  text: string;
}

const STATES = {
  NOT_SENT: CommentState.PENDING,
  SENT: CommentState.SENT,
  ADDRESSED: CommentState.ADDRESSED,
  NOT_ADDRESSED: CommentState.NOT_ADDRESSED,
};
const TARGETS = {
  PRECONDITION: CommentTargetType.PRECONDITION,
  STEP: CommentTargetType.STEP,
  SCENARIO_TEXT: CommentTargetType.TEXT_SCENARIO,
};

const REQUEST_TARGETS = {
  PRECONDITION: 'PRECONDITION',
  STEP: 'STEP',
  TEXT_SCENARIO: 'SCENARIO_TEXT',
} as const;

const invalidReview = (): never => {
  throw new Error('Invalid test case review response');
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : invalidReview();

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const optionalRound = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  return isPositiveInteger(value) ? value : invalidReview();
};

const readTarget = (comment: Record<string, unknown>): ReviewCommentTarget => {
  if (
    typeof comment.targetType !== 'string' ||
    !Object.prototype.hasOwnProperty.call(TARGETS, comment.targetType)
  ) {
    return invalidReview();
  }
  const type = TARGETS[comment.targetType as keyof typeof TARGETS];
  if (type !== CommentTargetType.STEP) return { type };
  if (!isPositiveInteger(comment.stepNumber)) return invalidReview();
  return { type, stepNumber: comment.stepNumber };
};

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

const readTimestamp = (value: unknown): number => {
  if (typeof value !== 'string' || !ISO_TIMESTAMP.test(value)) return invalidReview();
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return invalidReview();
  const date = value.slice(0, 10);
  if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) return invalidReview();
  return timestamp;
};

const readComment = (value: unknown, currentUserId?: number): ReviewCommentRS => {
  const comment = asRecord(value);
  if (!isPositiveInteger(comment.id) || !isPositiveInteger(comment.authorId))
    return invalidReview();
  if (typeof comment.text !== 'string' || typeof comment.state !== 'string') return invalidReview();
  if (!Object.prototype.hasOwnProperty.call(STATES, comment.state)) return invalidReview();
  if (comment.agentReason != null && typeof comment.agentReason !== 'string')
    return invalidReview();
  const state = STATES[comment.state as keyof typeof STATES];
  return {
    id: comment.id,
    target: readTarget(comment),
    text: comment.text,
    author: { id: comment.authorId },
    createdAt: readTimestamp(comment.createdAt),
    state,
    fixRound: optionalRound(comment.roundNumber),
    reason: typeof comment.agentReason === 'string' ? comment.agentReason : undefined,
    canDelete: state === CommentState.PENDING && comment.authorId === currentUserId,
  };
};

export const normalizeLiveReview = (value: unknown, currentUserId?: number): LiveReviewData => {
  const review = asRecord(value);
  if (!Array.isArray(review.comments) || typeof review.fixInProgress !== 'boolean')
    return invalidReview();
  if (typeof review.unsentCount !== 'number' || !Number.isSafeInteger(review.unsentCount))
    return invalidReview();
  if (review.unsentCount < 0) return invalidReview();
  return {
    comments: review.comments.map((value) => {
      const comment = readComment(value, currentUserId);
      return { ...comment, canDelete: comment.canDelete && !review.fixInProgress };
    }),
    unsentCount: review.unsentCount,
    fixInProgress: review.fixInProgress,
    fixRound: optionalRound(review.fixRound),
  };
};

export const toLiveReviewCommentPayload = ({
  target,
  text,
}: ReviewCommentPayload): LiveReviewCommentPayload => {
  const targetType = REQUEST_TARGETS[target.type];
  const trimmedText = text.trim();
  if (!targetType || !trimmedText || trimmedText.length > 1000) return invalidReview();
  if (targetType === 'STEP') {
    if (!isPositiveInteger(target.stepNumber)) return invalidReview();
    return { targetType, stepNumber: target.stepNumber, text: trimmedText };
  }
  return { targetType, text: trimmedText };
};
