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
  ReducedPipelineSection,
  ReducedPipelineStatus,
} from 'controllers/aiFactory/pipelines';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';

import { getReducedStatusVariant } from '../common/reducedStatusVariant';
import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { messages } from './messages';
import styles from './iterationDetailsPage.scss';

const cx = createClassnames(styles);

const STATUS_MESSAGES: Record<ReducedPipelineStatus, keyof typeof messages> = {
  PENDING: 'liveStatusPending',
  RUNNING: 'liveStatusRunning',
  WAITING: 'liveStatusWaiting',
  PASSED: 'liveStatusPassed',
  FAILED: 'liveStatusFailed',
  NEEDS_HUMAN: 'liveStatusNeedsHuman',
  SKIPPED: 'liveStatusSkipped',
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

const renderReducedStageSection = (section: ReducedPipelineSection, scoreDetailsLabel: string) => (
  <section key={section.key} className={cx('reduced-section')}>
    <h3>{section.title}</h3>
    <div className={cx('reduced-section__scroll')}>
      <table>
        <thead><tr>{section.columns.map((column) => (
          <th key={column.key} scope="col">{column.label}</th>
        ))}</tr></thead>
        <tbody>{section.rows.map((row) => (
          <tr key={row.key}>{section.columns.map((column) => (
            <td key={column.key}>
              {row.cells[column.key] ?? ''}
              {column.key === section.columns[0]?.key && row.details.length > 0 && (
                <details>
                  <summary>{scoreDetailsLabel}</summary>
                  {row.details.map((detail) => (
                    <div key={detail.heading}>
                      <strong>{detail.heading}</strong>
                      <ul>{detail.items.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  ))}
                </details>
              )}
            </td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  </section>
);

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
        <div className={cx('state')}>
          <SystemMessage mode={hasError ? 'error' : 'info'}>
            <output aria-live={hasError ? 'assertive' : 'polite'} aria-atomic="true">
              {formatMessage(hasError ? messages.detailError : messages.detailUnavailable)}
            </output>
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
        </div>
      </SettingsLayout>
    );
  }
  const attributeValue = (key: string) =>
    iteration.attributes.find((attribute) => attribute.key === key)?.value;
  const requirement = iteration.attributes.find((attribute) => attribute.key === 'requirement');
  const metadata = [
    { label: formatMessage(messages.metaRequirement), value: requirement?.value &&
      [requirement.value, requirement.description].filter(Boolean).join(' · ') },
    { label: formatMessage(messages.metaTrigger), value: iteration.trigger },
    { label: formatMessage(messages.metaStartedBy), value: iteration.startedBy },
    { label: formatMessage(messages.metaModel), value: attributeValue('model') },
    { label: formatMessage(messages.metaEnvironment), value: attributeValue('env') },
    { label: formatMessage(messages.metaCiPipeline), value: attributeValue('ci') },
    { label: formatMessage(messages.metaStarted), value: iteration.startedAt !== undefined
      ? new Date(iteration.startedAt).toLocaleString() : undefined },
    { value: iteration.durationMs !== undefined ? formatDuration(iteration.durationMs) : undefined },
  ].filter((field) => field.value);
  const testCases = attributeValue('testCases');
  const kpis = [
    { label: formatMessage(messages.kpiTestCases), value: testCases },
    { label: formatMessage(messages.kpiSuiteScore), value: attributeValue('suiteScore') },
    { label: formatMessage(messages.kpiAutoReadyPromoted), value: attributeValue('autoReadyPromoted') &&
      testCases ? `${attributeValue('autoReadyPromoted')} / ${testCases}` : attributeValue('autoReadyPromoted') },
    { label: formatMessage(messages.kpiReadyNow), value: attributeValue('readyNow') && testCases
      ? `${attributeValue('readyNow')} / ${testCases}` : attributeValue('readyNow') },
    { label: formatMessage(messages.kpiCost), value: attributeValue('cost') },
  ].filter((field) => field.value);
  const waitingStage = iteration.stages.find((stage) => stage.status === 'WAITING' && stage.message);
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
          <span
            className={cx(
              'reduced-status',
              `reduced-status--${getReducedStatusVariant(iteration.status)}`,
            )}
          >
            {iteration.statusText ?? formatMessage(messages[STATUS_MESSAGES[iteration.status]])}
          </span>
          {iteration.pipelineName && <h2 className={cx('reduced-pipeline-name')}>{iteration.pipelineName}</h2>}
          {iteration.warnings?.map((warning) => (
            <p key={warning} className={cx('reduced-warning')}>{warning}</p>
          ))}
          {waitingStage && <p className={cx('reduced-banner')}>{waitingStage.message}</p>}
          {metadata.length > 0 && (
            <div className={cx('meta')}>
              {metadata.map(({ label, value }) => (
                <span key={label ?? 'duration'} className={cx('meta__field')}>
                  {label && <span className={cx('meta__label')}>{label}:</span>}
                  <span className={cx('meta__value')}>{value}</span>
                </span>
              ))}
            </div>
          )}
          {kpis.length > 0 && (
            <div className={cx('reduced-kpis')}>
              {kpis.map(({ label, value }) => (
                <div key={label} className={cx('reduced-kpi')}>
                  <strong>{value}</strong><span>{label}</span>
                </div>
              ))}
            </div>
          )}
          {iteration.attributes.length > 0 && (
            <div className={cx('attributes')}>
              {iteration.attributes.map((attribute) => (
                <span key={attribute.key} className={cx('attributes__chip')}>
                  {`${attribute.label ?? attribute.key}: ${attribute.value}`}
                </span>
              ))}
            </div>
          )}
          <div className={cx('reduced-stages')}>
            {iteration.stages.length === 0
              ? formatMessage(messages.noStages)
              : iteration.stages.map((stage) => (
                  <div key={stage.id} className={cx('reduced-stage')}>
                    <div className={cx('reduced-stage__header')}>
                      <span className={cx('reduced-stage__label')}>{stage.label}</span>
                      <span className={cx('reduced-stage__status',
                        `reduced-stage__status--${getReducedStatusVariant(stage.status)}`)}>
                        {stage.statusText ?? formatMessage(messages[STATUS_MESSAGES[stage.status]])}
                      </span>
                    </div>
                    {stage.summary && <strong>{stage.summary}</strong>}
                    {stage.message && <p className={cx('reduced-stage__message')}>{stage.message}</p>}
                    {stage.durationMs !== undefined && (
                      <span className={cx('reduced-stage__duration')}>
                        {formatMessage(messages.stageDetailsDuration)}: {formatDuration(stage.durationMs)}
                      </span>
                    )}
                    {stage.links?.map((link) => (
                      <span key={`${link.type}-${link.url}`} title={link.url}
                        className={cx('reduced-stage__duration')}>
                        {link.type === 'RUN' ? formatMessage(messages.stageDetailsCiJob) : link.type}: {link.label}
                      </span>
                    ))}
                    {stage.attributes && stage.attributes.length > 0 && (
                      <div className={cx('attributes')}>
                        {stage.attributes.map((attribute) => (
                          <span key={attribute.key} className={cx('attributes__chip')}>
                            {`${attribute.label ?? attribute.key}: ${attribute.value}`}
                          </span>
                        ))}
                      </div>
                    )}
                    {stage.sections?.map((section) =>
                      renderReducedStageSection(section, formatMessage(messages.scoreDetails)),
                    )}
                  </div>
                ))}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
