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

import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { BubblesLoader, Button } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { showModalAction } from 'controllers/modal';
import { LifecycleBadge } from 'pages/inside/aiFactory/common';
import { messages } from 'pages/inside/aiFactory/review/messages';
import { LiveFixIterationLinks } from 'pages/inside/aiFactory/review/liveFixIterationLinks';
import type { LiveReviewCommentsLoadState } from 'pages/inside/aiFactory/review/useLiveReviewComments';
import type { AiLifecycle } from 'types/aiFactory';

import styles from './reviewComments.scss';

interface LiveReviewStripProps {
  lifecycle?: AiLifecycle;
  reviewState: LiveReviewCommentsLoadState;
  isReadOnly: boolean;
}

const cx = createClassnames(styles);

const FIX_STATUS_MESSAGES = {
  FIXED: messages.nativeFixFixed,
  FIXED_GRADE_FAILED: messages.nativeFixGradeFailed,
  FAILED: messages.nativeFixFailed,
};
const MONITOR_ERROR_MESSAGES = {
  READ: messages.nativeFixReadError,
  TIMEOUT: messages.nativeFixTimeout,
  MISSING: messages.nativeFixMissing,
};
const START_ERROR_MESSAGES = {
  CONFLICT: messages.nativeFixConflict,
  FAILED: messages.nativeFixStartFailed,
  UNCONFIRMED: messages.nativeFixStartUnconfirmed,
};

const LiveFixFeedback = ({ reviewState }: Pick<LiveReviewStripProps, 'reviewState'>) => {
  const { formatMessage } = useIntl();
  const round = reviewState.fixRoundState;
  const terminalMessage =
    round && round.status !== 'PENDING' ? FIX_STATUS_MESSAGES[round.status] : undefined;
  return (
    <>
      {reviewState.fixCompleted && (
        <output className={cx('review-strip__status')} aria-live="polite">
          {formatMessage(terminalMessage ?? messages.nativeFixCompleted, {
            round: round?.roundNumber,
          })}
        </output>
      )}
      {reviewState.fixStartError && (
        <div role="alert">{formatMessage(START_ERROR_MESSAGES[reviewState.fixStartError])}</div>
      )}
      {reviewState.fixMonitoringError && (
        <div role="alert">
          {formatMessage(MONITOR_ERROR_MESSAGES[reviewState.fixMonitoringError])}
          <Button
            variant="text"
            adjustWidthOn="content"
            disabled={reviewState.isLoading || reviewState.isMutating}
            data-automation-id="retry-fix-monitoring"
            onClick={reviewState.retryFixMonitoring}
          >
            {formatMessage(messages.nativeFixRetry)}
          </Button>
        </div>
      )}
    </>
  );
};

const LivePushButton = ({
  reviewState,
  isReadOnly,
}: Pick<LiveReviewStripProps, 'reviewState' | 'isReadOnly'>) => {
  const { formatMessage } = useIntl();
  if (isReadOnly) return null;
  const hint = reviewState.fixInProgress ? messages.fixingHint : messages.addAtLeastOne;
  return (
    <Button
      variant="primary"
      adjustWidthOn="content"
      disabled={!reviewState.canPush}
      title={reviewState.canPush ? undefined : formatMessage(hint)}
      data-automation-id="push-review-comments"
      onClick={() => void reviewState.pushToAgent?.()}
    >
      {formatMessage(messages.push, { count: reviewState.unsentCount })}
    </Button>
  );
};

export const LiveReviewStrip = ({ lifecycle, reviewState, isReadOnly }: LiveReviewStripProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const discard = () =>
    dispatch(
      showModalAction({
        id: 'confirmationModal',
        data: {
          title: formatMessage(messages.discard),
          message: formatMessage(messages.discardConfirmation),
          confirmText: formatMessage(COMMON_LOCALE_KEYS.DISCARD),
          cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          dangerConfirm: true,
          onConfirm: () => void reviewState.discardPending().catch(() => false),
        },
      }),
    );
  return (
    <section className={cx('review-strip')} data-automation-id="ai-live-review-strip">
      <div className={cx('review-strip__summary')}>
        {lifecycle && <LifecycleBadge lifecycle={lifecycle} />}
        <strong>{formatMessage(messages.reviewComments)}</strong>
        {reviewState.isLoaded && (
          <span>{formatMessage(messages.notSentCount, { count: reviewState.unsentCount })}</span>
        )}
        {reviewState.isLoading && (
          <>
            <BubblesLoader />
            <output className={cx('visually-hidden')} aria-live="polite">
              {formatMessage(messages.loading)}
            </output>
          </>
        )}
      </div>
      <div className={cx('review-strip__actions')}>
        <LivePushButton reviewState={reviewState} isReadOnly={isReadOnly} />
        {reviewState.unsentCount > 0 && !isReadOnly && (
          <Button
            variant="text-danger"
            adjustWidthOn="content"
            disabled={reviewState.isMutating}
            data-automation-id="discard-review-comments"
            onClick={discard}
          >
            {formatMessage(messages.discard)}
          </Button>
        )}
        <Button
          variant="text"
          adjustWidthOn="content"
          disabled={reviewState.isLoading || reviewState.isMutating}
          data-automation-id="refresh-review-comments"
          onClick={reviewState.reload}
        >
          {formatMessage(messages.refresh)}
        </Button>
      </div>
      {reviewState.fixInProgress && (
        <output className={cx('review-strip__status')} aria-live="polite">
          {formatMessage(
            reviewState.fixRound === undefined ? messages.fixingWithoutRound : messages.fixing,
            { round: reviewState.fixRound },
          )}
        </output>
      )}
      <LiveFixFeedback reviewState={reviewState} />
      <LiveFixIterationLinks reviewState={reviewState} isReadOnly={isReadOnly} />
      {reviewState.isError && <div role="alert">{formatMessage(messages.loadError)}</div>}
      {reviewState.isMutationError && (
        <div role="alert">{formatMessage(messages.mutationError)}</div>
      )}
    </section>
  );
};
