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

import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { BubblesLoader, Button, DeleteIcon, Tooltip } from '@reportportal/ui-kit';

import CommentIcon from 'common/img/comment-inline.svg';
import { createClassnames } from 'common/utils';
import { fromNowFormat } from 'common/utils/timeDateUtils';
import { LifecycleBadge } from 'pages/inside/aiFactory/common';
import { CommentState, CommentTargetType } from 'types/aiFactory';
import type { AiCommentState, ReviewCommentRS, ReviewCommentTarget } from 'types/aiFactory';

import { messages } from './messages';
import type { ReviewCommentsLoadState } from './useReviewComments';

import styles from './reviewComments.scss';

const cx = createClassnames(styles);

const matchesTarget = (comment: ReviewCommentRS, target: ReviewCommentTarget) =>
  comment.target.type === target.type &&
  (target.type !== CommentTargetType.STEP || comment.target.stepId === target.stepId);

const stateLabel = (
  state: AiCommentState,
  fixRound: number | undefined,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) => {
  if (state === CommentState.SENT) return formatMessage(messages.sent);
  if (state === CommentState.ADDRESSED) {
    return formatMessage(messages.addressed, { round: fixRound ?? '—' });
  }
  if (state === CommentState.NOT_ADDRESSED) {
    return formatMessage(messages.notAddressed, { round: fixRound ?? '—' });
  }
  return formatMessage(messages.pending);
};

interface ReviewTargetProps {
  target: ReviewCommentTarget;
  reviewState: ReviewCommentsLoadState;
  isReadOnly?: boolean;
}

export const ReviewTarget = ({ target, reviewState, isReadOnly = false }: ReviewTargetProps) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [mutationError, setMutationError] = useState(false);
  const comments = useMemo(
    () => reviewState.comments.filter((comment) => matchesTarget(comment, target)),
    [reviewState.comments, target],
  );
  const hasPending = comments.some((comment) => comment.state === CommentState.PENDING);

  const submitComment = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setMutationError(false);
    try {
      await reviewState.addComment({ target, text: trimmedText });
      setText('');
    } catch {
      setMutationError(true);
    }
  };

  const deleteComment = async (commentId: number) => {
    setMutationError(false);
    try {
      await reviewState.deleteComment(commentId);
    } catch {
      setMutationError(true);
    }
  };

  return (
    <div className={cx('review-target')}>
      <button
        type="button"
        className={cx('review-target__trigger', {
          'review-target__trigger--pending': hasPending,
        })}
        aria-expanded={isOpen}
        aria-label={formatMessage(messages.commentCount, { count: comments.length })}
        data-automation-id={`review-comment-toggle-${target.type}-${target.stepId ?? 'case'}`}
        disabled={reviewState.isLoading}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img src={CommentIcon} alt="" aria-hidden="true" />
        <span>{comments.length}</span>
      </button>
      {isOpen && (
        <div className={cx('review-target__thread')}>
          {comments.map((comment) => (
            <article key={comment.id} className={cx('review-target__comment')}>
              <div className={cx('review-target__comment-header')}>
                <strong>{comment.author.name}</strong>
                <span>{fromNowFormat(comment.createdAt)}</span>
                <span>{stateLabel(comment.state, comment.fixRound, formatMessage)}</span>
                {comment.canDelete && comment.state === CommentState.PENDING && !isReadOnly && (
                  <button
                    type="button"
                    className={cx('review-target__delete')}
                    aria-label={formatMessage(messages.delete)}
                    disabled={reviewState.isMutating}
                    onClick={() => void deleteComment(comment.id)}
                  >
                    <DeleteIcon />
                  </button>
                )}
              </div>
              <p>{comment.text}</p>
              {comment.reason && <p className={cx('review-target__reason')}>{comment.reason}</p>}
            </article>
          ))}
          {!isReadOnly && (
            <div className={cx('review-target__composer')}>
              <label htmlFor={`review-comment-${target.type}-${target.stepId ?? 'case'}`}>
                {formatMessage(messages.addCommentLabel)}
              </label>
              <textarea
                id={`review-comment-${target.type}-${target.stepId ?? 'case'}`}
                value={text}
                maxLength={1000}
                placeholder={formatMessage(messages.placeholder)}
                disabled={reviewState.isMutating}
                onChange={(event) => setText(event.target.value)}
              />
              <Button
                variant="primary"
                adjustWidthOn="content"
                disabled={!text.trim() || reviewState.isMutating}
                data-automation-id="add-review-comment"
                onClick={() => void submitComment()}
              >
                {formatMessage(messages.add)}
              </Button>
            </div>
          )}
          {mutationError && <div role="alert">{formatMessage(messages.mutationError)}</div>}
        </div>
      )}
    </div>
  );
};

interface ReviewStripProps {
  lifecycle: Parameters<typeof LifecycleBadge>[0]['lifecycle'];
  reviewState: ReviewCommentsLoadState;
  isReadOnly?: boolean;
  readOnlyReason?: 'FIX_RUNNING' | 'NO_PERMISSION';
}

export const ReviewStrip = ({
  lifecycle,
  reviewState,
  isReadOnly = false,
  readOnlyReason,
}: ReviewStripProps) => {
  const { formatMessage } = useIntl();
  const [mutationError, setMutationError] = useState(false);
  const pendingCount = reviewState.comments.filter(
    (comment) => comment.state === CommentState.PENDING,
  ).length;
  let pushHint = formatMessage(messages.pushUnavailable);
  if (isReadOnly) {
    pushHint = formatMessage(
      readOnlyReason === 'NO_PERMISSION' ? messages.permissionHint : messages.fixingHint,
    );
  } else if (pendingCount === 0) {
    pushHint = formatMessage(messages.addAtLeastOne);
  }

  const discard = async () => {
    if (!window.confirm(formatMessage(messages.discardConfirmation))) return;

    setMutationError(false);
    try {
      await reviewState.discardPending();
    } catch {
      setMutationError(true);
    }
  };

  return (
    <section className={cx('review-strip')} data-automation-id="ai-review-strip">
      <div className={cx('review-strip__summary')}>
        <LifecycleBadge lifecycle={lifecycle} />
        <strong>{formatMessage(messages.reviewComments)}</strong>
        <span>{formatMessage(messages.notSentCount, { count: pendingCount })}</span>
        {reviewState.isLoading && (
          <output aria-label={formatMessage(messages.loading)}>
            <BubblesLoader />
          </output>
        )}
      </div>
      <div className={cx('review-strip__actions')}>
        {pendingCount > 0 && !isReadOnly && (
          <Button
            variant="text-danger"
            adjustWidthOn="content"
            disabled={reviewState.isMutating}
            data-automation-id="discard-review-comments"
            onClick={() => void discard()}
          >
            {formatMessage(messages.discard)}
          </Button>
        )}
        <Tooltip content={pushHint} placement="top">
          <span>
            <Button variant="primary" disabled>
              {formatMessage(messages.push, { count: pendingCount })}
            </Button>
          </span>
        </Tooltip>
      </div>
      {reviewState.isError && (
        <div className={cx('review-strip__error')} role="alert">
          <span>{formatMessage(messages.loadError)}</span>
          <Button
            variant="text"
            adjustWidthOn="content"
            data-automation-id="retry-review-comments"
            onClick={reviewState.reload}
          >
            {formatMessage(messages.retry)}
          </Button>
        </div>
      )}
      {mutationError && <div role="alert">{formatMessage(messages.mutationError)}</div>}
    </section>
  );
};
