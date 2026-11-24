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

import { ComponentProps, Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';
import {
  Button,
  ChevronDownDropdownIcon,
  CycleArrowsIcon,
  RefreshIcon,
  RerunIcon,
  SystemMessage,
} from '@reportportal/ui-kit';

import { createClassnames, formatCost, formatTokens } from 'common/utils';
import {
  AGENT_UNIT_NAME_KEYS,
  AGENT_UNITS_SECTION_KEY,
  getAgentUnitName,
} from 'common/utils/agentUnitName';
import { formatDuration } from 'common/utils/timeDateUtils';
import { isHttpUrl } from 'common/utils/isHttpUrl';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  ReducedPipelineIterationDetail,
  ReducedPipelineDetailStage,
  ReducedPipelineAttribute,
  ReducedPipelineSection,
  ReducedPipelineStatus,
} from 'controllers/aiFactory/pipelines';
import { loadStageTrace } from 'controllers/aiFactory/stageTrace';
import { TEST_CASE_LIBRARY_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScoreBar } from 'pages/inside/aiFactory/common';
import { CRITERION_MESSAGE } from 'pages/inside/aiFactory/evaluation/criterionMessages';
import { IterationProvenance } from 'pages/inside/aiFactory/iterationDetailsPage/iterationProvenance';
import { getLiveLibraryCaseFolder } from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases';
import { LiveReviewCases } from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveReviewCases';
import {
  IterationStageTraceEntry,
  isReviewStage,
} from 'pages/inside/aiFactory/iterationDetailsPage/stageTraceAction/iterationStageTraceEntry';
import type { ProjectDetails } from 'pages/organization/constants';
import { CriterionKey, type AiCriterionKey } from 'types/aiFactory';

import { getReducedStatusVariant } from '../common/reducedStatusVariant';
import { LivePipelineSettingsButton } from '../pipelineSettings';
import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { KpiTile } from './kpiTile';
import { LiveStageRetryAction } from './liveStageRetryAction';
import { CaseLink } from './stagePanels/caseLink';
import {
  readLegacyGradeReport,
  readTraceGradeReport,
  type GradeReport,
} from './readLegacyGradeReport';
import { messages } from './messages';
import stageCardStyles from './stageCards/stageCards.scss';
import stagePanelStyles from './stagePanels/stagePanels.scss';
import styles from './iterationDetailsPage.scss';

const cx = createClassnames(styles);
const cardCx = createClassnames(stageCardStyles);
const panelCx = createClassnames(stagePanelStyles);

const isVisibleAttribute = ({ key }: ReducedPipelineAttribute) =>
  key !== 'autoReadyPromoted' && key !== 'autoReadyThreshold';

const HIDDEN_SUMMARY_ATTRIBUTE = /^(?:agent[ _-]?output|warnings)$/i;

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
  isLoading?: boolean;
  isInvalidRoute?: boolean;
  failureKind?: 'forbidden' | 'notFound' | null;
  breadcrumbDescriptors: BreadcrumbDescriptors;
  requestedStage?: string;
  onRetry: () => void;
  onBack?: () => void;
  onCompare?: (pipelineId: number, iterationId: number) => void;
  projectKey?: string;
  showRerun?: boolean;
  canRetryStages?: boolean;
  canStartCiJobs?: boolean;
  onRefreshCiConnection?: () => void;
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
  const highlights =
    stageKind && stageKind !== 'upload'
      ? stage.attributes?.filter(
          (attribute) =>
            attribute.type === 'META' &&
            attribute.key !== 'tokens' &&
            isVisibleAttribute(attribute),
        )
      : [];
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

const formatStageTableValue = (
  value: string,
  valueType: string | undefined,
  formatNumber: ReturnType<typeof useIntl>['formatNumber'],
) => {
  if (valueType !== 'DURATION' && valueType !== 'NUMBER') return value;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) return value;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || Math.abs(numericValue) > Number.MAX_SAFE_INTEGER) {
    return value;
  }

  if (valueType === 'DURATION') {
    return numericValue >= 0 ? formatDuration(numericValue) : value;
  }
  return formatNumber(numericValue, { maximumFractionDigits: 20 });
};

interface UploadReportLibraryLinkProps {
  projectKey: string;
  iterationId: number;
  displayId: string;
}

const UploadReportLibraryLink = ({
  projectKey,
  iterationId,
  displayId,
}: UploadReportLibraryLinkProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const scope = useMemo(
    () => ({ projectKey, iterationId, displayId }),
    [projectKey, iterationId, displayId],
  );
  const [result, setResult] = useState<{ scope: typeof scope; folderId: number }>();

  useEffect(() => {
    const controller = new AbortController();
    getLiveLibraryCaseFolder(scope.projectKey, scope.displayId, controller.signal).then(
      (folderId) => {
        if (!controller.signal.aborted && folderId !== undefined) {
          setResult({ scope, folderId });
        }
      },
      () => {},
    );
    return () => controller.abort();
  }, [scope]);

  if (!result || result.scope !== scope) return null;

  return (
    <Link
      className={cx('reduced-section__library-link')}
      to={{
        type: TEST_CASE_LIBRARY_PAGE,
        payload: { organizationSlug, projectSlug, testCasePageRoute: `folder/${result.folderId}` },
        query: { iteration: String(iterationId) },
      }}
    >
      {formatMessage(messages.openUploadReportInLibrary)}
    </Link>
  );
};

const renderCaseCellLink = (
  row: ReducedPipelineSection['rows'][number],
  columnKey: string,
  name: string,
) => {
  const cellLink = row.cellLinks?.[columnKey];
  if (cellLink?.entityType !== 'TEST_CASE') return undefined;

  const entityId = cellLink.entityId ?? '';
  const numericId = /^\d+$/.test(entityId) ? Number(entityId) : undefined;
  const testCaseId = numericId && Number.isSafeInteger(numericId) ? numericId : undefined;
  const searchName = testCaseId === undefined ? row.cells.name : undefined;
  if (testCaseId === undefined && !searchName) return undefined;

  return <CaseLink testCaseId={testCaseId} searchName={searchName} name={name} />;
};

const renderReducedStageSection = (
  section: ReducedPipelineSection,
  stageId: number,
  expandedRows: Set<string>,
  onToggleDetails: (rowKey: string) => void,
  {
    formatMessage,
    formatNumber,
  }: Pick<ReturnType<typeof useIntl>, 'formatMessage' | 'formatNumber'>,
  {
    generationKind,
    gradeSummary,
    action,
  }: { generationKind?: GenerationStageKind; gradeSummary?: string; action?: ReactNode } = {},
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

  const isUnitsSection = section.key === AGENT_UNITS_SECTION_KEY;
  const reportedUnitNameColumn = isUnitsSection
    ? AGENT_UNIT_NAME_KEYS.find((key) => section.columns.some((column) => column.key === key))
    : undefined;
  const addUnitNameColumn = isUnitsSection && !reportedUnitNameColumn;
  const unitNameColumn = addUnitNameColumn ? 'name' : reportedUnitNameColumn;
  const isGradedCasesSection = section.key === 'gradedCases' && section.role === 'RESULT';
  const resultColumns = isGradedCasesSection
    ? section.columns.filter(({ key }) => key !== 'line')
    : section.columns;
  const columns: ReducedPipelineSection['columns'] = addUnitNameColumn
    ? [{ key: 'name', label: formatMessage(messages.agentUnitColumn) }, ...resultColumns]
    : resultColumns;
  const scoreDetailsLabel = formatMessage(messages.scoreDetails);
  const isGradeReport = gradeSummary !== undefined;

  return (
    <section
      key={section.key}
      className={cx('reduced-section', {
        'reduced-section--single-column': section.role === 'DETAILS' && columns.length === 1,
        'reduced-section--grade': isGradedCasesSection && !isGradeReport,
        'reduced-section--grade-report': isGradeReport,
        'reduced-section--create': generationKind === 'create',
        'reduced-section--upload': generationKind === 'upload',
      })}
      data-automation-id={generationKind ? `live-${generationKind}-results` : undefined}
    >
      {action}
      {isGradeReport ? (
        <p className={cx('reduced-section__summary')}>{gradeSummary}</p>
      ) : (
        <h3>{section.title}</h3>
      )}
      <div className={cx('reduced-section__scroll')}>
        <table aria-label={isGradeReport ? section.title : undefined}>
          <thead>
            <tr>
              {columns.map((column) => (
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
                  <tr
                    className={cx({
                      'reduced-section__row--expanded': isExpanded,
                      'reduced-section__row--grade': isGradeReport,
                    })}
                    onClick={
                      isGradeReport
                        ? ({ target }) => {
                            if (!(target instanceof Element && target.closest('button, a'))) {
                              onToggleDetails(detailsKey);
                            }
                          }
                        : undefined
                    }
                  >
                    {columns.map((column) => {
                      const isUnitName = column.key === unitNameColumn;
                      const value = isUnitName
                        ? getAgentUnitName(row)
                        : (row.cells[column.key] ?? '');
                      const isStatusColumn =
                        column.valueType === 'STATUS' ||
                        /^(step)?status$/.test(column.key.toLowerCase().replace(/[_-]/g, '')) ||
                        (section.key === 'uploadReport' && column.key === 'result');
                      let cellContent: ReactNode;
                      if (!isUnitName && isStatusColumn && value) {
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
                      } else {
                        cellContent =
                          renderCaseCellLink(row, column.key, value) ??
                          (isUnitName
                            ? value
                            : formatStageTableValue(value, column.valueType, formatNumber));
                      }
                      return (
                        <td
                          key={column.key}
                          title={
                            typeof cellContent === 'string' && cellContent !== value
                              ? value
                              : undefined
                          }
                          className={cx({
                            'reduced-section__score-cell': column.valueType === 'SCORE',
                            'reduced-section__total-cell': column.key === 'total',
                          })}
                        >
                          {isGradeReport && column.key === 'name' ? (
                            <div className={cx('reduced-section__grade-case')}>
                              <button
                                type="button"
                                className={cx('reduced-section__grade-toggle')}
                                aria-expanded={isExpanded}
                                aria-label={formatMessage(messages.gradeCaseDetails, {
                                  name: value,
                                })}
                                onClick={() => onToggleDetails(detailsKey)}
                              >
                                <ChevronDownDropdownIcon aria-hidden="true" />
                              </button>
                              {cellContent}
                            </div>
                          ) : (
                            cellContent
                          )}
                          {!isGradeReport &&
                            column.key === columns[0]?.key &&
                            row.details.length > 0 && (
                              <button
                                type="button"
                                className={cx('reduced-section__details-toggle', {
                                  'reduced-section__details-toggle--inline':
                                    section.key === 'transcript' && columns.length > 1,
                                })}
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
                      <td colSpan={columns.length}>
                        <div className={cx('reduced-section__detail-list')}>
                          {row.details.map((detail) => (
                            <div key={detail.heading}>
                              <strong>{detail.heading}</strong>
                              {detail.items.length > 0 && (
                                <ul>
                                  {detail.items.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              )}
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
      {isGradeReport && (
        <p className={cx('reduced-section__legend')}>{formatMessage(messages.gradeLegend)}</p>
      )}
    </section>
  );
};

const findSelectedStage = (
  stages: ReducedPipelineDetailStage[],
  selectedStageId: number | null,
  requestedStage?: string,
) => {
  const requestedKey = requestedStage?.toLowerCase();
  const requestedMatch = requestedKey
    ? stages.find(({ key, label, stageKey }) =>
        [stageKey, key, label].some((value) => value?.toLowerCase() === requestedKey),
      )
    : undefined;
  return stages.find(({ id }) => id === selectedStageId) ?? requestedMatch ?? stages[0];
};

const numericAttribute = (attributes: ReducedPipelineAttribute[] | undefined, key: string) => {
  const value = attributes?.find((attribute) => attribute.key === key)?.value;
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
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

interface StageRetryOptions {
  projectKey: string;
  disabled: boolean;
  isCiUnavailable: boolean;
  onRefreshCiConnection?: () => void;
  onRefresh: () => void;
}

const isRetryableStage = (stage: ReducedPipelineDetailStage) =>
  stage.retryable === true &&
  stage.ownedBy === 'PIPELINE' &&
  stage.status === 'FAILED' &&
  ['create', 'upload'].includes(stage.stageKey?.toLowerCase() ?? '');

const renderReducedStageCards = (
  iteration: ReducedPipelineIterationDetail,
  currentStage: ReducedPipelineDetailStage | undefined,
  onSelect: (stageId: number) => void,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
  stageRetry?: StageRetryOptions,
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
            const isCompletedReview = stage.status === 'PASSED' && isReviewStage(stage);
            return (
              <div key={stage.id} className={cardCx('stage-cards__item-wrapper')}>
                {index > 0 && (
                  <span className={cardCx('stage-cards__arrow')} aria-hidden="true">
                    →
                  </span>
                )}
                <div className={cx('reduced-stage-card')}>
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
                      <span className={cardCx('stage-cards__item-description')}>
                        {stage.summary}
                      </span>
                    )}
                    {stage.attributes
                      ?.filter(
                        (attribute) => attribute.type === 'META' && isVisibleAttribute(attribute),
                      )
                      .map((attribute) => (
                        <span
                          key={attribute.key}
                          className={cardCx('stage-cards__item-description')}
                        >
                          {attribute.label ?? attribute.key}: {attribute.value}
                        </span>
                      ))}
                    {suiteScore !== undefined && <ScoreBar value={suiteScore} max={100} />}
                    {!isCompletedReview && readyCount !== undefined && totalCount !== undefined && (
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
                  {stageRetry && isRetryableStage(stage) && (
                    <LiveStageRetryAction
                      key={`${stageRetry.projectKey}:${iteration.id}:${stage.id}:${stage.attempt}`}
                      projectKey={stageRetry.projectKey}
                      iterationId={iteration.id}
                      stageId={stage.id}
                      stageLabel={stage.label}
                      disabled={stageRetry.disabled}
                      isCiUnavailable={stageRetry.isCiUnavailable}
                      onRefreshCiConnection={stageRetry.onRefreshCiConnection}
                      onRefresh={stageRetry.onRefresh}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const GRADE_CRITERIA: ReadonlyArray<readonly [AiCriterionKey, string]> = [
  [CriterionKey.ATOMICITY, 'A'],
  [CriterionKey.CLEAR_STEPS, 'CS'],
  [CriterionKey.EXPECTED_RESULTS, 'CER'],
  [CriterionKey.NO_INVENTED_LOGIC, 'NIL'],
  [CriterionKey.NO_INVENTED_UI, 'NIU'],
  [CriterionKey.COHERENCE, 'C'],
];

const renderGradeReport = (
  report: GradeReport,
  stageId: number,
  expandedRows: Set<string>,
  onToggleDetails: (rowKey: string) => void,
  {
    formatMessage,
    formatNumber,
  }: Pick<ReturnType<typeof useIntl>, 'formatMessage' | 'formatNumber'>,
) => {
  const criterionColumns = GRADE_CRITERIA.map(([key, shortLabel]) => {
    const maxima = new Set(
      report.test_cases.flatMap(({ criterias }) =>
        criterias.filter(({ name }) => name === key).map(({ max_score }) => max_score),
      ),
    );
    const [max] = maxima;
    return {
      key,
      label: maxima.size === 1 ? `${shortLabel} /${max}` : shortLabel,
      valueType: 'SCORE',
    };
  });
  const section: ReducedPipelineSection = {
    key: 'gradedCases',
    title: formatMessage(messages.gradedCases),
    role: 'RESULT',
    columns: [
      { key: 'name', label: formatMessage(messages.gradeColumnTestCase) },
      ...criterionColumns,
      {
        key: 'total',
        label: formatMessage(messages.gradeColumnTotal, { max: report.max_score }),
        valueType: 'SCORE',
      },
    ],
    rows: report.test_cases.map((testCase, index) => {
      const criteria = new Map(testCase.criterias.map((criterion) => [criterion.name, criterion]));
      const details = testCase.criterias.flatMap((criterion) => {
        const rubricKey = GRADE_CRITERIA.find(([key]) => key === criterion.name)?.[0];
        if (rubricKey && criterion.failure_reasons.length === 0) return [];
        const name = rubricKey ? formatMessage(CRITERION_MESSAGE[rubricKey]) : criterion.name;
        return [
          {
            heading: `${name} · ${criterion.score}/${criterion.max_score}`,
            items: [...new Set(criterion.failure_reasons)],
          },
        ];
      });
      if (!details.length) {
        details.push({ heading: formatMessage(messages.gradeNoReportedReasons), items: [] });
      }
      return {
        key: String(index),
        cells: {
          ...Object.fromEntries(
            criterionColumns.map(({ key }) => {
              const criterion = criteria.get(key);
              return [key, criterion ? String(criterion.score) : '—'];
            }),
          ),
          name: testCase.name,
          total: String(testCase.total_score),
        },
        cellLinks: { name: { entityType: 'TEST_CASE' } },
        details,
      };
    }),
  };

  return renderReducedStageSection(
    section,
    stageId,
    expandedRows,
    onToggleDetails,
    { formatMessage, formatNumber },
    {
      generationKind: 'grade',
      gradeSummary: formatMessage(messages.gradeReportSummary, {
        score: report.total_score,
        max: report.max_score,
      }),
    },
  );
};

interface TraceGradeResultsProps {
  iteration: ReducedPipelineIterationDetail;
  stageId: number;
  stageKey: string;
  attempt?: number;
  projectKey: string;
  expandedRows: Set<string>;
  onToggleDetails: (rowKey: string) => void;
}

const TraceGradeResults = ({
  iteration,
  stageId,
  stageKey,
  attempt,
  projectKey,
  expandedRows,
  onToggleDetails,
}: TraceGradeResultsProps) => {
  const enabled = useAiFactoryEnabled();
  const intl = useIntl();
  const scope = useMemo(
    () => ({ iteration, projectKey, stageKey, attempt, enabled }),
    [iteration, projectKey, stageKey, attempt, enabled],
  );
  const [result, setResult] = useState<{ scope: typeof scope; report?: GradeReport }>();

  useEffect(() => {
    if (!scope.enabled) return;

    const controller = new AbortController();
    loadStageTrace(
      {
        projectKey: scope.projectKey,
        iterationId: scope.iteration.id,
        stageKey: scope.stageKey,
        attempt: scope.attempt,
      },
      controller.signal,
    ).then(
      (trace) => {
        if (!controller.signal.aborted) setResult({ scope, report: readTraceGradeReport(trace) });
      },
      () => {
        if (!controller.signal.aborted) setResult({ scope });
      },
    );
    return () => controller.abort();
  }, [scope]);

  return result?.scope === scope && result.report
    ? renderGradeReport(result.report, stageId, expandedRows, onToggleDetails, intl)
    : null;
};

const renderReducedStagePanel = (
  currentStage: ReducedPipelineDetailStage,
  iterationId: number,
  projectKey: string | undefined,
  expandedRows: Set<string>,
  onToggleDetails: (rowKey: string) => void,
  {
    formatMessage,
    formatNumber,
  }: Pick<ReturnType<typeof useIntl>, 'formatMessage' | 'formatNumber'>,
  generationKind?: GenerationStageKind,
  reviewContent?: ReactNode,
  traceContent?: ReactNode,
  gradeResults?: ReactNode,
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
          .map((section) => {
            const sectionKind = getGenerationSectionKind(section, generationKind);
            const displayId =
              sectionKind === 'upload'
                ? section.rows.find(({ cells }) => cells.testCase?.trim())?.cells.testCase.trim()
                : undefined;
            return renderReducedStageSection(
              section,
              currentStage.id,
              expandedRows,
              onToggleDetails,
              { formatMessage, formatNumber },
              {
                generationKind: sectionKind,
                action: projectKey && displayId && (
                  <UploadReportLibraryLink
                    projectKey={projectKey}
                    iterationId={iterationId}
                    displayId={displayId}
                  />
                ),
              },
            );
          })}
        {gradeResults}
        {reviewContent}
      </section>
      <aside className={panelCx('stage-panels__aside')}>
        <div className={cx('stage-details-heading')}>
          <h2 className={panelCx('aside-title')}>{formatMessage(messages.stageDetailsTitle)}</h2>
          {traceContent}
        </div>
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
            ?.filter(
              (attribute) =>
                (!generationKind || attribute.type !== 'META') && isVisibleAttribute(attribute),
            )
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
                renderReducedStageSection(section, currentStage.id, expandedRows, onToggleDetails, {
                  formatMessage,
                  formatNumber,
                }),
              )}
          </div>
        )}
      </aside>
    </div>
  </div>
);

const renderSelectedStagePanel = (
  iteration: ReducedPipelineIterationDetail,
  stage: ReducedPipelineDetailStage,
  projectKey: string | undefined,
  expandedRows: Set<string>,
  onToggleDetails: (rowKey: string) => void,
  intl: ReturnType<typeof useIntl>,
) => {
  const generationKind = getGenerationStageKind(iteration.pipelineType, stage);
  const isActiveIteration = iteration.status === 'PENDING' || iteration.status === 'RUNNING';
  const reviewContent =
    isReviewStage(stage) && projectKey ? (
      <LiveReviewCases
        projectKey={projectKey}
        iterationId={iteration.id}
        refreshVersion={isActiveIteration ? undefined : iteration}
      />
    ) : undefined;

  let gradeResults: ReactNode;
  if (
    generationKind === 'grade' &&
    !stage.sections?.some(({ key, role }) => key === 'gradedCases' && role === 'RESULT')
  ) {
    const report = readLegacyGradeReport(stage.sections);
    if (report) {
      gradeResults = renderGradeReport(report, stage.id, expandedRows, onToggleDetails, intl);
    } else if (projectKey && stage.stageKey) {
      gradeResults = (
        <TraceGradeResults
          iteration={iteration}
          stageId={stage.id}
          stageKey={stage.stageKey}
          attempt={stage.attempt}
          projectKey={projectKey}
          expandedRows={expandedRows}
          onToggleDetails={onToggleDetails}
        />
      );
    }
  }

  return renderReducedStagePanel(
    stage,
    iteration.id,
    projectKey,
    expandedRows,
    onToggleDetails,
    intl,
    generationKind,
    reviewContent,
    <IterationStageTraceEntry iteration={iteration} stage={stage} projectKey={projectKey} />,
    gradeResults,
  );
};

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
  isLoading = false,
  isInvalidRoute = false,
  failureKind = null,
  breadcrumbDescriptors,
  requestedStage,
  onRetry,
  onBack,
  onCompare,
  projectKey,
  showRerun = false,
  canRetryStages = false,
  canStartCiJobs = false,
  onRefreshCiConnection,
}: ReducedIterationDetailsProps) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());
  const toggleRowDetails = (rowKey: string) => {
    setExpandedRows((previous) => {
      const next = new Set(previous);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };
  if (isUnavailable || !iteration || isInvalidRoute || failureKind) {
    return renderReducedDetailError(
      { isInvalidRoute, failureKind, hasError, onBack, onRetry },
      formatMessage,
    );
  }

  const metadata = buildReducedMetadata(iteration, formatMessage);
  const visibleAttributes = iteration.attributes.filter(
    (attribute) =>
      isVisibleAttribute(attribute) &&
      !HIDDEN_SUMMARY_ATTRIBUTE.test(attribute.key) &&
      !HIDDEN_SUMMARY_ATTRIBUTE.test(attribute.label ?? ''),
  );
  const kpis = buildReducedKpis(iteration, formatMessage);
  const currentStage = findSelectedStage(iteration.stages, selectedStageId, requestedStage);
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
              {showRerun && (
                <Button
                  variant="text"
                  data-automation-id="rerunIterationButton"
                  icon={<RerunIcon />}
                >
                  {formatMessage(messages.rerun)}
                </Button>
              )}
              <LivePipelineSettingsButton pipelineId={iteration.pipelineId} fromIteration />
              <Button
                variant="text"
                data-automation-id="refreshReducedIterationButton"
                icon={<RefreshIcon />}
                disabled={isLoading}
                onClick={onRetry}
              >
                {formatMessage(messages.refresh)}
              </Button>
            </div>
          }
        />
        <div className={cx('content')} data-automation-id="reducedIterationDetails">
          {hasError && (
            <SystemMessage mode="warning">
              <output aria-live="polite">{formatMessage(messages.automaticRefreshFailed)}</output>
            </SystemMessage>
          )}
          <section className={cx('summary-card')} aria-label={formatMessage(messages.summaryLabel)}>
            <IterationProvenance iteration={iteration} projectKey={projectKey} />
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
            {visibleAttributes.length > 0 && (
              <div className={cx('attributes')}>
                {visibleAttributes.map((attribute) => (
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
          {renderReducedStageCards(
            iteration,
            currentStage,
            setSelectedStageId,
            formatMessage,
            canRetryStages && projectKey && iteration.pipelineType === 'TEST_CASE_GENERATION'
              ? {
                  projectKey,
                  disabled: isLoading,
                  isCiUnavailable: !canStartCiJobs,
                  onRefresh: onRetry,
                  onRefreshCiConnection,
                }
              : undefined,
          )}
          {currentStage &&
            renderSelectedStagePanel(
              iteration,
              currentStage,
              projectKey,
              expandedRows,
              toggleRowDetails,
              intl,
            )}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
