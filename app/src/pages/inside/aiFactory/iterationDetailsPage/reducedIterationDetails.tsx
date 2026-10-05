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

import { ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { Button, RefreshIcon, SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { formatDuration } from 'common/utils/timeDateUtils';
import {
  ReducedPipelineIterationDetail,
  ReducedPipelineStatus,
} from 'controllers/aiFactory/pipelines';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { messages } from './messages';
import styles from './iterationDetailsPage.scss';

const cx = createClassnames(styles);

const STATUS_MESSAGES: Record<ReducedPipelineStatus, keyof typeof messages> = {
  PENDING: 'liveStatusPending',
  PASSED: 'liveStatusPassed',
  FAILED: 'liveStatusFailed',
  NEEDS_HUMAN: 'liveStatusNeedsHuman',
  UNKNOWN: 'liveStatusUnknown',
};

type BreadcrumbDescriptors = ComponentProps<
  typeof PageHeaderWithBreadcrumbsAndActions
>['breadcrumbDescriptors'];

export interface ReducedIterationDetailsProps {
  iteration: ReducedPipelineIterationDetail | null;
  hasError: boolean;
  isUnavailable: boolean;
  breadcrumbDescriptors: BreadcrumbDescriptors;
  onRetry: () => void;
}

const buildMetadata = (iteration: ReducedPipelineIterationDetail): string[] =>
  [
    iteration.pipelineName,
    iteration.trigger,
    iteration.startedAt !== undefined ? new Date(iteration.startedAt).toLocaleString() : undefined,
    iteration.durationMs !== undefined ? formatDuration(iteration.durationMs) : undefined,
  ].filter((value): value is string => Boolean(value));

export const ReducedIterationDetails = ({
  iteration,
  hasError,
  isUnavailable,
  breadcrumbDescriptors,
  onRetry,
}: ReducedIterationDetailsProps) => {
  const { formatMessage } = useIntl();
  if (hasError || isUnavailable || !iteration) {
    return (
      <SettingsLayout>
        <output className={cx('state')} aria-live={hasError ? 'assertive' : 'polite'}>
          <SystemMessage mode={hasError ? 'error' : 'info'}>
            {formatMessage(hasError ? messages.detailError : messages.detailUnavailable)}
            <div className={cx('error-action')}>
              <Button
                variant="text"
                data-automation-id="retryReducedIterationButton"
                onClick={onRetry}
              >
                {formatMessage(messages.retry)}
              </Button>
            </div>
          </SystemMessage>
        </output>
      </SettingsLayout>
    );
  }
  const metadata = buildMetadata(iteration);
  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.iterationTitle, { number: iteration.number })}
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={
            <Button
              variant="text"
              data-automation-id="refreshReducedIterationButton"
              icon={<RefreshIcon />}
              onClick={onRetry}
            >
              {formatMessage(messages.refresh)}
            </Button>
          }
        />
        <div className={cx('content')} data-automation-id="reducedIterationDetails">
          <span className={cx('reduced-status')}>
            {formatMessage(messages[STATUS_MESSAGES[iteration.status]])}
          </span>
          {metadata.length > 0 && <div className={cx('meta')}>{metadata.join(' · ')}</div>}
          {iteration.attributes.length > 0 && (
            <div className={cx('attributes')}>
              {iteration.attributes.map((attribute) => (
                <span key={attribute.key} className={cx('attributes__chip')}>
                  {`${attribute.key}: ${attribute.value}`}
                </span>
              ))}
            </div>
          )}
          <div className={cx('reduced-stages')}>
            {iteration.stages.length === 0
              ? formatMessage(messages.noStages)
              : iteration.stages.map((stage) => (
                  <div key={stage.id} className={cx('reduced-stage')}>
                    <span>{stage.label}</span>
                    <span className={cx('reduced-stage__status')}>
                      {formatMessage(messages[STATUS_MESSAGES[stage.status]])}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
