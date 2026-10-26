/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { CommentState, CommentTargetType } from 'types/aiFactory';

import { normalizeLiveReview, toLiveReviewCommentPayload } from './liveReviewComments';

const nativeComment = {
  id: 21,
  targetType: 'STEP',
  stepNumber: 2,
  text: 'Name the exact toast text',
  authorId: 12,
  createdAt: '2026-09-22T14:00:12Z',
  state: 'NOT_SENT',
};

const review = (comments: unknown[] = [nativeComment]) => ({
  comments,
  unsentCount: 7,
  fixInProgress: false,
});

describe('live review contract adapter', () => {
  test('maps native identity, timestamp and targets while preserving authoritative review state', () => {
    const result = normalizeLiveReview(review(), 12);

    expect(result.unsentCount).toBe(7);
    expect(result.fixInProgress).toBe(false);
    expect(result.comments).toEqual([
      expect.objectContaining({
        id: 21,
        target: { type: CommentTargetType.STEP, stepNumber: 2 },
        text: nativeComment.text,
        author: { id: 12 },
        createdAt: Date.parse(nativeComment.createdAt),
        state: CommentState.PENDING,
        canDelete: true,
      }),
    ]);
    expect(result.comments[0].fixRound).toBeUndefined();
    expect(result.comments[0].reason).toBeUndefined();
    expect(result.fixRound).toBeUndefined();
  });

  test.each([
    { targetType: 'PRECONDITION', type: CommentTargetType.PRECONDITION },
    { targetType: 'SCENARIO_TEXT', type: CommentTargetType.TEXT_SCENARIO },
  ])('maps $targetType independently of step identity', ({ targetType, type }) => {
    const result = normalizeLiveReview(
      review([{ ...nativeComment, targetType, stepNumber: undefined }]),
      12,
    );

    expect(result.comments[0].target).toEqual({ type });
  });

  test.each([
    { state: 'SENT', expected: CommentState.SENT },
    { state: 'ADDRESSED', expected: CommentState.ADDRESSED },
    { state: 'NOT_ADDRESSED', expected: CommentState.NOT_ADDRESSED },
  ])('maps $state and optional agent reply without enabling deletion', ({ state, expected }) => {
    const result = normalizeLiveReview(
      review([
        {
          ...nativeComment,
          state,
          roundNumber: 3,
          agentReason: 'The source requirement uses this label',
        },
      ]),
      12,
    );

    expect(result.comments[0]).toMatchObject({
      state: expected,
      fixRound: 3,
      reason: 'The source requirement uses this label',
      canDelete: false,
    });
  });

  test.each([undefined, 99])('does not infer ownership for user %s', (userId) => {
    expect(normalizeLiveReview(review(), userId).comments[0].canDelete).toBe(false);
  });

  test('locks deletion while the server reports a fix without inventing a round', () => {
    const result = normalizeLiveReview({ ...review(), fixInProgress: true }, 12);

    expect(result.fixInProgress).toBe(true);
    expect(result.comments[0].canDelete).toBe(false);
    expect(result.fixRound).toBeUndefined();
  });

  test.each([
    null,
    [],
    {},
    { ...review(), comments: null },
    { ...review(), unsentCount: -1 },
    { ...review(), unsentCount: 1.5 },
    { ...review(), unsentCount: '2' },
    { ...review(), fixInProgress: 'false' },
    review([{ ...nativeComment, id: '21' }]),
    review([{ ...nativeComment, authorId: '12' }]),
    review([{ ...nativeComment, createdAt: 'not a date' }]),
    review([{ ...nativeComment, createdAt: 100 }]),
    review([{ ...nativeComment, createdAt: '2026-09-22T14:00:12' }]),
    review([{ ...nativeComment, createdAt: '2026-02-30T14:00:12Z' }]),
    review([{ ...nativeComment, state: 'PENDING' }]),
    review([{ ...nativeComment, targetType: 'TEXT_SCENARIO' }]),
    review([{ ...nativeComment, stepNumber: undefined }]),
    review([{ ...nativeComment, stepNumber: 0 }]),
    review([{ ...nativeComment, stepNumber: 1.5 }]),
    review([{ ...nativeComment, text: null }]),
    review([{ ...nativeComment, roundNumber: 0 }]),
    review([{ ...nativeComment, agentReason: 123 }]),
    review([nativeComment, { ...nativeComment, state: 'unknown' }]),
  ])('rejects a malformed response instead of silently showing empty review: %j', (value) => {
    expect(() => normalizeLiveReview(value, 12)).toThrow();
  });

  test.each([
    { target: { type: CommentTargetType.PRECONDITION }, targetType: 'PRECONDITION' },
    { target: { type: CommentTargetType.TEXT_SCENARIO }, targetType: 'SCENARIO_TEXT' },
    { target: { type: CommentTargetType.STEP, stepNumber: 2 }, targetType: 'STEP', stepNumber: 2 },
  ])(
    'creates native $targetType payloads without leaking legacy targets',
    ({ target, targetType, stepNumber }) => {
      expect(toLiveReviewCommentPayload({ target, text: 'Clarify this case' })).toEqual({
        targetType,
        ...(stepNumber ? { stepNumber } : {}),
        text: 'Clarify this case',
      });
    },
  );

  test('rejects a legacy database step ID instead of sending it as a native step number', () => {
    expect(() =>
      toLiveReviewCommentPayload({
        target: { type: CommentTargetType.STEP, stepId: 900 },
        text: 'Clarify this step',
      }),
    ).toThrow();
  });

  test.each(['', '   ', 'x'.repeat(1001)])('rejects empty and over-limit comment text', (text) => {
    expect(() =>
      toLiveReviewCommentPayload({ target: { type: CommentTargetType.PRECONDITION }, text }),
    ).toThrow();
  });

  test('trims a text comment while accepting the maximum supported length', () => {
    const text = 'x'.repeat(1000);
    expect(
      toLiveReviewCommentPayload({
        target: { type: CommentTargetType.TEXT_SCENARIO },
        text: ` ${text} `,
      }),
    ).toEqual({ targetType: 'SCENARIO_TEXT', text });
  });
});
