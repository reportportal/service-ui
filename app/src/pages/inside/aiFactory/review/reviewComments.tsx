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

import { useId, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { BubblesLoader, Button, DeleteIcon, Modal, Tooltip } from '@reportportal/ui-kit';

import CommentIcon from 'common/img/comment-inline.svg';
import { createClassnames } from 'common/utils';
import { fromNowFormat } from 'common/utils/timeDateUtils';
import { LifecycleBadge } from 'pages/inside/aiFactory/common';
import { CommentState, CommentTargetType, FixRoundStatus } from 'types/aiFactory';
import type {
  AiCommentState,
  ReviewCommentRS,
  ReviewCommentTarget,
  ScenarioSnapshot,
  TestCaseAiRS,
} from 'types/aiFactory';

import { messages } from './messages';
import type { ReviewCommentsLoadState } from './useReviewComments';
import type { FixRoundLoadState } from './useFixRound';

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
  const uniqueId = useId();
  const comments = useMemo(
    () => reviewState.comments.filter((comment) => matchesTarget(comment, target)),
    [reviewState.comments, target],
  );
  const hasPending = comments.some((comment) => comment.state === CommentState.PENDING);
  const targetId = `${target.type.toLowerCase()}-${target.stepId ?? 'case'}-${uniqueId}`;
  const triggerId = `review-comment-trigger-${targetId}`;
  const threadId = `review-comment-thread-${targetId}`;
  const composerId = `review-comment-${targetId}`;

  const submitComment = async () => {
    if (isReadOnly) return;

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
    if (isReadOnly) return;

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
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={threadId}
        aria-label={formatMessage(messages.commentCount, { count: comments.length })}
        data-automation-id={`review-comment-toggle-${target.type}-${target.stepId ?? 'case'}`}
        disabled={reviewState.isLoading}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img src={CommentIcon} alt="" aria-hidden="true" />
        <span>{comments.length}</span>
      </button>
      {isOpen && (
        <section
          id={threadId}
          className={cx('review-target__thread')}
          aria-labelledby={triggerId}
        >
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
              <label htmlFor={composerId}>{formatMessage(messages.addCommentLabel)}</label>
              <textarea
                id={composerId}
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
        </section>
      )}
    </div>
  );
};

interface ReviewStripProps {
  lifecycle: Parameters<typeof LifecycleBadge>[0]['lifecycle'];
  reviewState: ReviewCommentsLoadState;
  isReadOnly?: boolean;
  readOnlyReason?: 'FIX_RUNNING' | 'NO_PERMISSION';
  fixRoundState: FixRoundLoadState;
  lastAgentChange?: TestCaseAiRS['lastAgentChange'];
}

interface ScenarioSnapshotViewProps {
  snapshot: ScenarioSnapshot;
}

const ScenarioSnapshotView = ({ snapshot }: ScenarioSnapshotViewProps) => {
  const { formatMessage } = useIntl();
  const hasContent = Boolean(
    snapshot.precondition ||
    snapshot.instructions ||
    snapshot.expectedResult ||
    snapshot.steps?.length,
  );

  if (!hasContent) return <p>{formatMessage(messages.noScenarioContent)}</p>;

  return (
    <div className={cx('agent-changes__scenario')}>
      {snapshot.precondition && (
        <section>
          <strong>{formatMessage(messages.precondition)}</strong>
          <p>{snapshot.precondition}</p>
        </section>
      )}
      {(snapshot.instructions || snapshot.expectedResult) && (
        <section>
          <strong>{formatMessage(messages.instructions)}</strong>
          <p>{snapshot.instructions}</p>
          <strong>{formatMessage(messages.expectedResult)}</strong>
          <p>{snapshot.expectedResult}</p>
        </section>
      )}
      {snapshot.steps?.map((step) => (
        <section key={step.position}>
          <strong>{`${step.position}. ${formatMessage(messages.instructions)}`}</strong>
          <p>{step.instructions}</p>
          <strong>{formatMessage(messages.expectedResult)}</strong>
          <p>{step.expectedResult}</p>
        </section>
      ))}
    </div>
  );
};

export const ReviewStrip = ({
  lifecycle,
  reviewState,
  isReadOnly = false,
  readOnlyReason,
  fixRoundState,
  lastAgentChange,
}: ReviewStripProps) => {
  const { formatMessage } = useIntl();
  const [mutationError, setMutationError] = useState(false);
  const [isChangesVisible, setIsChangesVisible] = useState(false);
  const pendingCount = reviewState.comments.filter(
    (comment) => comment.state === CommentState.PENDING,
  ).length;
  let pushHint = '';
  if (isReadOnly) {
    pushHint = formatMessage(
      readOnlyReason === 'NO_PERMISSION' ? messages.permissionHint : messages.fixingHint,
    );
  } else if (pendingCount === 0) {
    pushHint = formatMessage(messages.addAtLeastOne);
  }

  const discard = async () => {
    if (isReadOnly) return;

    if (!window.confirm(formatMessage(messages.discardConfirmation))) return;

    setMutationError(false);
    try {
      await reviewState.discardPending();
    } catch {
      setMutationError(true);
    }
  };

  const isRunning = fixRoundState.current?.status === FixRoundStatus.RUNNING;
  const hasFailed = fixRoundState.current?.status === FixRoundStatus.FAILED && pendingCount > 0;
  const canPush = pendingCount > 0 && !isReadOnly && !fixRoundState.isStarting;

  const push = async () => {
    if (isReadOnly) return;

    setMutationError(false);
    await fixRoundState.start();
  };

  return (
    <section className={cx('review-strip')} data-automation-id="ai-review-strip">
      <div className={cx('review-strip__summary')}>
        <LifecycleBadge lifecycle={lifecycle} />
        <strong>{formatMessage(messages.reviewComments)}</strong>
        <span>{formatMessage(messages.notSentCount, { count: pendingCount })}</span>
        {reviewState.isLoading && (
          <span className={cx('review-strip__loading')}>
            <BubblesLoader />
            <output className={cx('visually-hidden')} aria-live="polite" aria-atomic="true">
              {formatMessage(messages.loading)}
            </output>
          </span>
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
            <Button
              variant="primary"
              disabled={!canPush}
              data-automation-id="push-review-comments"
              onClick={() => void push()}
            >
              {formatMessage(messages.push, { count: pendingCount })}
            </Button>
          </span>
        </Tooltip>
      </div>
      {isRunning && (
        <div className={cx('review-strip__status')}>
          <BubblesLoader />
          <output aria-live="polite" aria-atomic="true">
            <strong>
              {formatMessage(messages.fixing, { round: fixRoundState.current?.round })}
            </strong>
          </output>
        </div>
      )}
      {hasFailed && (
        <div className={cx('review-strip__status', 'review-strip__status--failed')}>
          <output aria-live="assertive" aria-atomic="true">
            {formatMessage(messages.failedActions)}
          </output>
          {!isReadOnly && (
            <>
              <Button
                variant="text"
                adjustWidthOn="content"
                disabled={!canPush}
                data-automation-id="push-review-comments-again"
                onClick={() => void push()}
              >
                {formatMessage(messages.pushAgain)}
              </Button>
              <Button
                variant="text-danger"
                adjustWidthOn="content"
                disabled={reviewState.isMutating}
                onClick={() => void discard()}
              >
                {formatMessage(messages.discard)}
              </Button>
            </>
          )}
        </div>
      )}
      {lastAgentChange && !isRunning && (
        <div className={cx('review-strip__status')}>
          <Button
            variant="text"
            adjustWidthOn="content"
            data-automation-id="show-agent-changes"
            onClick={() => setIsChangesVisible(true)}
          >
            {formatMessage(messages.whatChanged)}
          </Button>
        </div>
      )}
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
      {fixRoundState.isError && (
        <div className={cx('review-strip__error')} role="alert">
          {formatMessage(messages.fixStartFailed)}
        </div>
      )}
      {isChangesVisible && lastAgentChange && (
        <Modal
          title={formatMessage(messages.changesTitle, { round: lastAgentChange.round })}
          okButton={{
            children: formatMessage(messages.close),
            onClick: () => setIsChangesVisible(false),
          }}
          onClose={() => setIsChangesVisible(false)}
        >
          <p className={cx('agent-changes__score')}>
            {formatMessage(messages.scoreChange, {
              before: lastAgentChange.scoreBefore,
              after: lastAgentChange.scoreAfter ?? '—',
            })}
          </p>
          <div className={cx('agent-changes__columns')}>
            <section>
              <h3>{formatMessage(messages.before)}</h3>
              <ScenarioSnapshotView snapshot={lastAgentChange.before} />
            </section>
            <section>
              <h3>{formatMessage(messages.after)}</h3>
              <ScenarioSnapshotView snapshot={lastAgentChange.after} />
            </section>
          </div>
        </Modal>
      )}
    </section>
  );
};
