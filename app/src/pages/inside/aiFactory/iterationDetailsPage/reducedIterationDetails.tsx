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

import { ComponentProps, Fragment, ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Button,
  CycleArrowsIcon,
  RefreshIcon,
  RerunIcon,
  SystemMessage,
} from '@reportportal/ui-kit';

import { createClassnames, formatCost, formatTokens } from 'common/utils';
import { formatDuration } from 'common/utils/timeDateUtils';
import {
  ReducedPipelineIterationDetail,
  ReducedPipelineDetailStage,
  ReducedPipelineAttribute,
  ReducedPipelineSection,
  ReducedPipelineStatus,
} from 'controllers/aiFactory/pipelines';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScoreBar } from 'pages/inside/aiFactory/common';

import { getReducedStatusVariant } from '../common/reducedStatusVariant';
import { LivePipelineSettingsButton } from '../pipelineSettings';
import { LiveReviewCases } from './liveReviewCases/liveReviewCases';
import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { KpiTile } from './kpiTile';
import { CaseLink } from './stagePanels/caseLink';
import { messages } from './messages';
import stageCardStyles from './stageCards/stageCards.scss';
import stagePanelStyles from './stagePanels/stagePanels.scss';
import styles from './iterationDetailsPage.scss';

const cx = createClassnames(styles);
const cardCx = createClassnames(stageCardStyles);
const panelCx = createClassnames(stagePanelStyles);

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

const SECTION_STATUS_VARIANTS: Record<string, string> = {
  passed: 'done',
  created: 'done',
  done: 'done',
  ready: 'done',
  failed: 'failed',
  running: 'active',
  inprogress: 'waiting',
  inreview: 'waiting',
  waiting: 'waiting',
  needshuman: 'waiting',
};

const getSectionStatusVariant = (status: string) =>
  SECTION_STATUS_VARIANTS[status.toLowerCase().replace(/[\s_-]/g, '')] ?? 'neutral';

type BreadcrumbDescriptors = ComponentProps<
  typeof PageHeaderWithBreadcrumbsAndActions
>['breadcrumbDescriptors'];

export interface ReducedIterationDetailsProps {
  iteration: ReducedPipelineIterationDetail | null;
  hasError: boolean;
  isUnavailable: boolean;
  isInvalidRoute?: boolean;
  failureKind?: 'forbidden' | 'notFound' | null;
  breadcrumbDescriptors: BreadcrumbDescriptors;
  requestedStage?: string;
  onRetry: () => void;
  onBack?: () => void;
  onCompare?: (pipelineId: number, iterationId: number) => void;
  projectKey?: string;
}

type GenerationStageKind = 'create' | 'grade' | 'upload';

const GENERATION_SECTION_SHAPES: Record<GenerationStageKind, { key: string; columns: string[] }> = {
  create: { key: 'authoredCases', columns: ['name', 'status'] },
  grade: { key: 'gradedCases', columns: ['name', 'total'] },
  upload: { key: 'uploadReport', columns: ['testCase', 'result'] },
};

const getGenerationStageKind = (
  pipelineType: string | undefined,
  stage: ReducedPipelineDetailStage,
): GenerationStageKind | undefined => {
  if (pipelineType !== 'TEST_CASE_GENERATION' || !stage.stageKey) return undefined;
  const key = stage.stageKey.toLowerCase();
  return key === 'create' || key === 'grade' || key === 'upload' ? key : undefined;
};

const getGenerationSectionKind = (
  section: ReducedPipelineSection,
  stageKind: GenerationStageKind | undefined,
): GenerationStageKind | undefined => {
  if (!stageKind || section.role !== 'RESULT') return undefined;
  const expected = GENERATION_SECTION_SHAPES[stageKind];
  const columns = new Set(section.columns.map(({ key }) => key));
  return section.key === expected.key && expected.columns.every((key) => columns.has(key))
    ? stageKind
    : undefined;
};

const renderGenerationHighlights = (
  stage: ReducedPipelineDetailStage,
  stageKind: GenerationStageKind | undefined,
) => {
  const highlights = stageKind ? stage.attributes?.filter(({ type }) => type === 'META') : [];
  return highlights?.length ? (
    <dl className={cx('generation-highlights')} data-automation-id="generationStageHighlights">
      {highlights.map((attribute) => (
        <div key={attribute.key} className={cx('generation-highlights__item')}>
          <dt>{attribute.label ?? attribute.key}</dt>
          <dd title={attribute.value}>{attribute.value}</dd>
        </div>
      ))}
    </dl>
  ) : null;
};

const renderReducedStageSection = (
  section: ReducedPipelineSection,
  scoreDetailsLabel: string,
  stageId: number,
  expandedRows: Set<string>,
  onToggleDetails: (rowKey: string) => void,
  generationKind?: GenerationStageKind,
) => {
  if (
    section.key === 'tokenUsage' &&
    section.rows.length === 1 &&
    !section.rows[0].details.length
  ) {
    const [row] = section.rows;
    return (
      <section key={section.key} className={cx('reduced-section')}>
        <h3>{section.title}</h3>
        <dl className={cx('reduced-section__key-values')}>
          {section.columns.map((column) => {
            const value = row.cells[column.key] ?? '';
            const numericValue = Number(value);
            let formattedValue = value;
            if (value !== '' && Number.isFinite(numericValue)) {
              if (column.valueType === 'MONEY') formattedValue = formatCost(numericValue);
              else if (column.valueType === 'NUMBER') formattedValue = formatTokens(numericValue);
            }
            return (
              <Fragment key={column.key}>
                <dt>{column.label}</dt>
                <dd
                  className={cx({
                    'reduced-section__key-values--emphasis': column.valueType === 'MONEY',
                  })}
                  title={value}
                >
                  {formattedValue}
                </dd>
              </Fragment>
            );
          })}
        </dl>
      </section>
    );
  }

  return (
    <section
      key={section.key}
      className={cx('reduced-section', {
        'reduced-section--grade': section.key === 'gradedCases',
        'reduced-section--create': generationKind === 'create',
        'reduced-section--upload': generationKind === 'upload',
      })}
      data-automation-id={generationKind ? `live-${generationKind}-results` : undefined}
    >
      <h3>{section.title}</h3>
      <div className={cx('reduced-section__scroll')}>
        <table>
          <thead>
            <tr>
              {section.columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cx({ 'reduced-section__score-cell': column.valueType === 'SCORE' })}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => {
              const detailsKey = `${stageId}:${section.key}:${row.key}`;
              const isExpanded = expandedRows.has(detailsKey);
              return (
                <Fragment key={row.key}>
                  <tr className={cx({ 'reduced-section__row--expanded': isExpanded })}>
                    {section.columns.map((column) => {
                      const value = row.cells[column.key] ?? '';
                      const cellLink = row.cellLinks?.[column.key];
                      const numericEntityId =
                        cellLink?.entityType === 'TEST_CASE' &&
                        /^\d+$/.test(cellLink.entityId ?? '')
                          ? Number(cellLink.entityId)
                          : undefined;
                      const testCaseId =
                        numericEntityId && Number.isSafeInteger(numericEntityId)
                          ? numericEntityId
                          : undefined;
                      const searchName =
                        cellLink?.entityType === 'TEST_CASE' && testCaseId === undefined
                          ? row.cells.name
                          : undefined;
                      const isStatusColumn =
                        column.valueType === 'STATUS' ||
                        /^(step)?status$/.test(column.key.toLowerCase().replace(/[_-]/g, '')) ||
                        (section.key === 'uploadReport' && column.key === 'result');
                      let cellContent: ReactNode = value;
                      if (isStatusColumn && value) {
                        cellContent = (
                          <span
                            className={cx(
                              'reduced-section__status',
                              `reduced-section__status--${getSectionStatusVariant(value)}`,
                            )}
                          >
                            {value}
                          </span>
                        );
                      } else if (
                        cellLink?.entityType === 'TEST_CASE' &&
                        (testCaseId !== undefined || searchName)
                      ) {
                        cellContent = (
                          <CaseLink testCaseId={testCaseId} searchName={searchName} name={value} />
                        );
                      }
                      return (
                        <td
                          key={column.key}
                          className={cx({
                            'reduced-section__score-cell': column.valueType === 'SCORE',
                            'reduced-section__total-cell': column.key === 'total',
                          })}
                        >
                          {cellContent}
                          {column.key === section.columns[0]?.key && row.details.length > 0 && (
                            <button
                              type="button"
                              className={cx('reduced-section__details-toggle')}
                              aria-expanded={isExpanded}
                              onClick={() => onToggleDetails(detailsKey)}
                            >
                              {scoreDetailsLabel}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {isExpanded && row.details.length > 0 && (
                    <tr className={cx('reduced-section__details-row')}>
                      <td colSpan={section.columns.length}>
                        <div className={cx('reduced-section__detail-list')}>
                          {row.details.map((detail) => (
                            <div key={detail.heading}>
                              <strong>{detail.heading}</strong>
                              <ul>
                                {detail.items.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const findSelectedStage = (
  stages: ReducedPipelineDetailStage[],
  selectedStageId: number | null,
  requestedStage?: string,
) =>
  stages.find(({ id }) => id === selectedStageId) ??
  stages.find(({ key, label }) =>
    [key, label].some((value) => value.toLowerCase() === requestedStage?.toLowerCase()),
  ) ??
  stages[0];

const numericAttribute = (attributes: ReducedPipelineAttribute[] | undefined, key: string) => {
  const value = attributes?.find((attribute) => attribute.key === key)?.value;
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const buildReducedMetadata = (
  iteration: ReducedPipelineIterationDetail,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) => {
  const attributeValue = (key: string) =>
    iteration.attributes.find((attribute) => attribute.key === key)?.value;
  const requirement = iteration.attributes.find((attribute) => attribute.key === 'requirement');
  const metadata = [
    {
      label: formatMessage(messages.metaRequirement),
      value:
        requirement?.value &&
        [requirement.value, requirement.description].filter(Boolean).join(' · '),
    },
    { label: formatMessage(messages.metaTrigger), value: iteration.trigger },
    { label: formatMessage(messages.metaStartedBy), value: iteration.startedBy },
    { label: formatMessage(messages.metaModel), value: attributeValue('model') },
    { label: formatMessage(messages.metaEnvironment), value: attributeValue('env') },
    { label: formatMessage(messages.metaCiPipeline), value: attributeValue('ci') },
    {
      label: formatMessage(messages.metaStarted),
      value:
        iteration.startedAt !== undefined
          ? new Date(iteration.startedAt).toLocaleString()
          : undefined,
    },
    {
      label: formatMessage(messages.metaFinished),
      value:
        iteration.finishedAt !== undefined
          ? new Date(iteration.finishedAt).toLocaleString()
          : undefined,
    },
    {
      label: formatMessage(messages.metaCreated),
      value:
        iteration.createdAt !== undefined
          ? new Date(iteration.createdAt).toLocaleString()
          : undefined,
    },
    {
      label: formatMessage(messages.stageDetailsDuration),
      value: iteration.durationMs !== undefined ? formatDuration(iteration.durationMs) : undefined,
    },
  ].filter((field) => field.value);
  return metadata;
};

const buildReducedKpis = (
  iteration: ReducedPipelineIterationDetail,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) => {
  const attributeValue = (key: string) =>
    iteration.attributes.find((attribute) => attribute.key === key)?.value;
  const testCases = attributeValue('testCases');
  const suiteScore = numericAttribute(iteration.attributes, 'suiteScore');
  const cost = numericAttribute(iteration.attributes, 'cost');
  const kpis = [
    { label: formatMessage(messages.kpiTestCases), value: testCases },
    {
      label: formatMessage(messages.kpiSuiteScore),
      value: suiteScore !== undefined ? `${suiteScore} / 100` : attributeValue('suiteScore'),
    },
    {
      label: formatMessage(messages.kpiAutoReadyPromoted),
      value:
        attributeValue('autoReadyPromoted') && testCases
          ? `${attributeValue('autoReadyPromoted')} / ${testCases}`
          : attributeValue('autoReadyPromoted'),
    },
    {
      label: formatMessage(messages.kpiReadyNow),
      value:
        attributeValue('readyNow') && testCases
          ? `${attributeValue('readyNow')} / ${testCases}`
          : attributeValue('readyNow'),
    },
    { label: formatMessage(messages.kpiFixRounds), value: attributeValue('fixRounds') },
    {
      label: formatMessage(messages.kpiCost),
      value: cost !== undefined ? formatCost(cost) : attributeValue('cost'),
    },
  ].filter((field) => field.value);
  return kpis;
};

const renderReducedStageCards = (
  iteration: ReducedPipelineIterationDetail,
  currentStage: ReducedPipelineDetailStage | undefined,
  onSelect: (stageId: number) => void,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) => {
  return (
    <section className={cx('stage-card-section')}>
      <h2 className={cx('section-title')}>{formatMessage(messages.stagesTitle)}</h2>
      {iteration.stages.length === 0 ? (
        formatMessage(messages.noStages)
      ) : (
        <div className={cardCx('stage-cards')} data-automation-id="reducedStageCards">
          {iteration.stages.map((stage, index) => {
            const suiteScore = numericAttribute(stage.attributes, 'suiteScore');
            const readyCount = numericAttribute(stage.attributes, 'ready');
            const totalCount = numericAttribute(stage.attributes, 'total');
            const stageCost = numericAttribute(stage.attributes, 'cost');
            return (
              <div key={stage.id} className={cardCx('stage-cards__item-wrapper')}>
                {index > 0 && (
                  <span className={cardCx('stage-cards__arrow')} aria-hidden="true">
                    →
                  </span>
                )}
                <button
                  type="button"
                  className={cardCx('stage-cards__item', {
                    'stage-cards__item--selected': stage.id === currentStage?.id,
                  })}
                  aria-pressed={stage.id === currentStage?.id}
                  onClick={() => onSelect(stage.id)}
                  data-automation-id={`reducedStageCard-${stage.id}`}
                >
                  <span className={cardCx('stage-cards__item-header')}>
                    <strong className={cardCx('stage-cards__item-label')}>{stage.label}</strong>
                    <span
                      className={cx(
                        'reduced-stage__status',
                        `reduced-stage__status--${getReducedStatusVariant(stage.status)}`,
                      )}
                    >
                      {stage.statusText ?? formatMessage(messages[STATUS_MESSAGES[stage.status]])}
                    </span>
                  </span>
                  {stage.message && (
                    <span className={cardCx('stage-cards__item-summary')}>{stage.message}</span>
                  )}
                  {stage.summary && (
                    <span className={cardCx('stage-cards__item-description')}>{stage.summary}</span>
                  )}
                  {stage.attributes
                    ?.filter(({ type }) => type === 'META')
                    .map((attribute) => (
                      <span key={attribute.key} className={cardCx('stage-cards__item-description')}>
                        {attribute.label ?? attribute.key}: {attribute.value}
                      </span>
                    ))}
                  {suiteScore !== undefined && <ScoreBar value={suiteScore} max={100} />}
                  {readyCount !== undefined && totalCount !== undefined && (
                    <ScoreBar value={readyCount} max={totalCount} />
                  )}
                  {(stage.durationMs !== undefined || stageCost !== undefined) && (
                    <span className={cardCx('stage-cards__item-footer')}>
                      {stage.durationMs !== undefined ? formatDuration(stage.durationMs) : ''}
                      {stage.durationMs !== undefined && stageCost !== undefined ? ' · ' : ''}
                      {stageCost !== undefined ? formatCost(stageCost) : ''}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const renderReducedStagePanel = (
  currentStage: ReducedPipelineDetailStage,
  expandedRows: Set<string>,
  onToggleDetails: (rowKey: string) => void,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
  generationKind?: GenerationStageKind,
  reviewContent?: ReactNode,
) => (
  <div className={cx('panel-card')} data-automation-id="reducedStagePanel">
    <div className={panelCx('stage-panels')}>
      <section
        className={panelCx('stage-panels__main')}
        data-automation-id={generationKind ? `live-${generationKind}-panel` : undefined}
      >
        <div className={panelCx('panel-heading')}>
          <h2>{currentStage.label}</h2>
          <span
            className={cx(
              'reduced-stage__status',
              `reduced-stage__status--${getReducedStatusVariant(currentStage.status)}`,
            )}
          >
            {currentStage.statusText ??
              formatMessage(messages[STATUS_MESSAGES[currentStage.status]])}
          </span>
          {currentStage.summary && (
            <span className={panelCx('panel-heading__summary')}>{currentStage.summary}</span>
          )}
        </div>
        {currentStage.message && (
          <p className={cx('reduced-stage__message')}>{currentStage.message}</p>
        )}
        {renderGenerationHighlights(currentStage, generationKind)}
        {currentStage.sections
          ?.filter(({ role }) => role === 'RESULT')
          .map((section) =>
            renderReducedStageSection(
              section,
              formatMessage(messages.scoreDetails),
              currentStage.id,
              expandedRows,
              onToggleDetails,
              getGenerationSectionKind(section, generationKind),
            ),
          )}
        {reviewContent}
      </section>
      <aside className={panelCx('stage-panels__aside')}>
        <h2 className={panelCx('aside-title')}>{formatMessage(messages.stageDetailsTitle)}</h2>
        <dl className={panelCx('details-list')}>
          <dt>{formatMessage(messages.stageDetailsStage)}</dt>
          <dd>{currentStage.label}</dd>
          <dt>{formatMessage(messages.stageDetailsStatus)}</dt>
          <dd>
            {currentStage.statusText ??
              formatMessage(messages[STATUS_MESSAGES[currentStage.status]])}
          </dd>
          <dt>{formatMessage(messages.stageDetailsDuration)}</dt>
          <dd>
            {currentStage.durationMs !== undefined ? formatDuration(currentStage.durationMs) : '—'}
          </dd>
          {currentStage.attempt !== undefined && (
            <>
              <dt>{formatMessage(messages.stageAttempt)}</dt>
              <dd>{currentStage.attempt}</dd>
            </>
          )}
          {currentStage.ownedBy && (
            <>
              <dt>{formatMessage(messages.stageOwner)}</dt>
              <dd>{currentStage.ownedBy}</dd>
            </>
          )}
          {currentStage.startedAt !== undefined && (
            <>
              <dt>{formatMessage(messages.metaStarted)}</dt>
              <dd>{new Date(currentStage.startedAt).toLocaleString()}</dd>
            </>
          )}
          {currentStage.finishedAt !== undefined && (
            <>
              <dt>{formatMessage(messages.metaFinished)}</dt>
              <dd>{new Date(currentStage.finishedAt).toLocaleString()}</dd>
            </>
          )}
          {Boolean(currentStage.relatedEntities?.length) && (
            <>
              <dt>{formatMessage(messages.stageRelatedEntities)}</dt>
              <dd>{currentStage.relatedEntities.map(({ entityId }) => entityId).join(', ')}</dd>
            </>
          )}
          {currentStage.links?.map((link) => (
            <Fragment key={`${link.type}-${link.url}`}>
              <dt>{link.type === 'RUN' ? formatMessage(messages.stageDetailsCiJob) : link.type}</dt>
              <dd>
                {link.type === 'RUN' && isHttpUrl(link.url) ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  link.label
                )}
              </dd>
            </Fragment>
          ))}
          {currentStage.attributes
            ?.filter(({ type }) => !generationKind || type !== 'META')
            .map((attribute) => (
              <Fragment key={attribute.key}>
                <dt title={attribute.description}>{attribute.label ?? attribute.key}</dt>
                <dd>{attribute.value}</dd>
              </Fragment>
            ))}
        </dl>
        {currentStage.sections?.some(({ role }) => role === 'DETAILS') && (
          <div
            className={cx('detail-sections-card')}
            data-automation-id="reducedStageDetailSections"
          >
            {currentStage.sections
              .filter(({ role }) => role === 'DETAILS')
              .map((section) =>
                renderReducedStageSection(
                  section,
                  formatMessage(messages.scoreDetails),
                  currentStage.id,
                  expandedRows,
                  onToggleDetails,
                ),
              )}
          </div>
        )}
      </aside>
    </div>
  </div>
);

const renderReducedDetailError = (
  {
    isInvalidRoute,
    failureKind,
    hasError,
    onBack,
    onRetry,
  }: Pick<
    ReducedIterationDetailsProps,
    'isInvalidRoute' | 'failureKind' | 'hasError' | 'onBack' | 'onRetry'
  >,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) => {
  let message = messages.detailUnavailable;
  if (isInvalidRoute) message = messages.detailInvalidRoute;
  else if (failureKind === 'forbidden') message = messages.detailForbidden;
  else if (failureKind === 'notFound') message = messages.detailNotFound;
  else if (hasError) message = messages.detailError;
  const shouldGoBack = isInvalidRoute || Boolean(failureKind);
  return (
    <SettingsLayout>
      <div className={cx('state')}>
        <SystemMessage mode={hasError || isInvalidRoute || failureKind ? 'error' : 'info'}>
          <output
            aria-live={hasError || isInvalidRoute || failureKind ? 'assertive' : 'polite'}
            aria-atomic="true"
          >
            {formatMessage(message)}
          </output>
          <div className={cx('error-action')}>
            <Button
              variant="text"
              data-automation-id={
                shouldGoBack ? 'backToPipelinesButton' : 'retryReducedIterationButton'
              }
              onClick={shouldGoBack ? onBack : onRetry}
            >
              {formatMessage(shouldGoBack ? messages.backToPipelines : messages.retry)}
            </Button>
          </div>
        </SystemMessage>
      </div>
    </SettingsLayout>
  );
};

export const ReducedIterationDetails = ({
  iteration,
  hasError,
  isUnavailable,
  isInvalidRoute = false,
  failureKind = null,
  breadcrumbDescriptors,
  requestedStage,
  onRetry,
  onBack,
  onCompare,
  projectKey,
}: ReducedIterationDetailsProps) => {
  const { formatMessage } = useIntl();
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());
  const [showRawResponse, setShowRawResponse] = useState(false);
  const toggleRowDetails = (rowKey: string) => {
    setExpandedRows((previous) => {
      const next = new Set(previous);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };
  if (hasError || isUnavailable || !iteration || isInvalidRoute || failureKind) {
    return renderReducedDetailError(
      { isInvalidRoute, failureKind, hasError, onBack, onRetry },
      formatMessage,
    );
  }

  const { rawResponse, ...mappedFields } = iteration;
  const metadata = buildReducedMetadata(iteration, formatMessage);
  const kpis = buildReducedKpis(iteration, formatMessage);
  const currentStage = findSelectedStage(iteration.stages, selectedStageId, requestedStage);
  const linkedCaseIds = Array.from(
    new Set(
      iteration.stages.flatMap((stage) =>
        (stage.relatedEntities ?? [])
          .filter(
            ({ entityType, entityId }) => entityType === 'TEST_CASE' && entityId.length <= 128,
          )
          .map(({ entityId }) => entityId),
      ),
    ),
  );
  const isReviewStage = Boolean(
    currentStage &&
    (currentStage.stageKey?.toLowerCase() === 'review' ||
      (currentStage.ownedBy === 'REPORTPORTAL' &&
        currentStage.attributes?.some(({ key }) => key === 'ready'))),
  );
  const bannerStage = iteration.stages.find(
    (stage) =>
      ['RUNNING', 'WAITING', 'NEEDS_HUMAN', 'FAILED'].includes(stage.status) && stage.message,
  );
  const statusVariant = getReducedStatusVariant(iteration.status);
  const statusText =
    iteration.statusText ?? formatMessage(messages[STATUS_MESSAGES[iteration.status]]);
  let compareTitle: string | undefined;
  if (iteration.number <= 1) {
    compareTitle = formatMessage(messages.noPreviousIteration);
  } else if (!onCompare) {
    compareTitle = formatMessage(messages.compareUnavailable);
  }
  const pipelinePrefix = iteration.pipelineName ? `${iteration.pipelineName} · ` : '';
  const title = `${pipelinePrefix}${formatMessage(messages.iterationTitle, {
    number: iteration.number,
  })}`;
  return (
    <SettingsLayout>
      <ScrollWrapper key={`${iteration.pipelineId}-${iteration.id}`} thinScrollbars>
        <PageHeaderWithBreadcrumbsAndActions
          title={title}
          titleAddon={
            <div className={cx('title-badges')}>
              <span className={cx('iteration-badge')}>
                {formatMessage(messages.iterationBadge)}
              </span>
              <span className={cx('reduced-status', `reduced-status--${statusVariant}`)}>
                {statusText}
              </span>
            </div>
          }
          breadcrumbDescriptors={breadcrumbDescriptors}
          stackActionsAtNarrowWidth
          actions={
            <div className={cx('header-actions', 'header-actions--reduced')}>
              <span title={compareTitle}>
                <Button
                  variant="text"
                  data-automation-id="compareWithPreviousButton"
                  icon={<CycleArrowsIcon />}
                  disabled={iteration.number <= 1 || !onCompare}
                  onClick={
                    onCompare ? () => onCompare(iteration.pipelineId, iteration.id) : undefined
                  }
                >
                  {formatMessage(messages.compareWithPrevious)}
                </Button>
              </span>
              <span title={formatMessage(messages.rerunUnavailable)}>
                <Button
                  variant="text"
                  data-automation-id="rerunIterationButton"
                  icon={<RerunIcon />}
                  disabled
                >
                  {formatMessage(messages.rerun)}
                </Button>
              </span>
              <LivePipelineSettingsButton pipelineId={iteration.pipelineId} />
              <Button
                variant="text"
                data-automation-id="refreshReducedIterationButton"
                icon={<RefreshIcon />}
                onClick={onRetry}
              >
                {formatMessage(messages.refresh)}
              </Button>
            </div>
          }
        />
        <div className={cx('content')} data-automation-id="reducedIterationDetails">
          <section className={cx('summary-card')} aria-label={formatMessage(messages.summaryLabel)}>
            {metadata.length > 0 && (
              <div className={cx('meta')}>
                {metadata.map(({ label, value }) => (
                  <span key={label} className={cx('meta__field')}>
                    <span className={cx('meta__label')}>{label}:</span>
                    <span className={cx('meta__value')}>{value}</span>
                  </span>
                ))}
              </div>
            )}
            {iteration.attributes.length > 0 && (
              <div className={cx('attributes')}>
                {iteration.attributes.map((attribute) => (
                  <span
                    key={attribute.key}
                    className={cx('attributes__chip')}
                    title={attribute.description}
                  >
                    <span className={cx('attributes__key')}>
                      {attribute.label ?? attribute.key}:
                    </span>
                    <span className={cx('attributes__value')}>{attribute.value}</span>
                  </span>
                ))}
              </div>
            )}
            {kpis.length > 0 && (
              <div className={cx('kpis')}>
                {kpis.map(({ label, value }) => (
                  <KpiTile key={label} label={label} value={value} />
                ))}
              </div>
            )}
          </section>
          <output
            className={cx('status-banner', `status-banner--reduced-${statusVariant}`)}
            aria-live="polite"
          >
            <span className={cx('reduced-status', `reduced-status--${statusVariant}`)}>
              {statusText}
            </span>
            <strong className={cx('status-banner__title')}>{title}</strong>
            {bannerStage?.message && (
              <span className={cx('status-banner__message')}>{bannerStage.message}</span>
            )}
          </output>
          {iteration.warnings?.map((warning) => (
            <p key={warning} className={cx('reduced-warning')}>
              {warning}
            </p>
          ))}
          {renderReducedStageCards(iteration, currentStage, setSelectedStageId, formatMessage)}
          {currentStage &&
            renderReducedStagePanel(
              currentStage,
              expandedRows,
              toggleRowDetails,
              formatMessage,
              getGenerationStageKind(iteration.pipelineType, currentStage),
              isReviewStage && projectKey ? (
                <LiveReviewCases displayIds={linkedCaseIds} projectKey={projectKey} />
              ) : undefined,
            )}
          <details className={cx('reduced-api-fields')}>
            <summary>{formatMessage(messages.validatedApiFields)}</summary>
            <pre>{JSON.stringify(mappedFields, null, 2)}</pre>
          </details>
          {rawResponse && (
            <details
              className={cx('reduced-api-fields')}
              data-automation-id="fullApiResponse"
              onToggle={(event) => setShowRawResponse(event.currentTarget.open)}
            >
              <summary>{formatMessage(messages.fullApiResponse)}</summary>
              {showRawResponse && <pre>{JSON.stringify(rawResponse, null, 2)}</pre>}
            </details>
          )}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
