/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { ReactNode } from 'react';
import { type IntlShape, type MessageDescriptor, useIntl } from 'react-intl';
import { BubblesLoader, Button } from '@reportportal/ui-kit';
import Link from 'redux-first-router-link';

import { ALL } from 'common/constants/reservedFilterIds';
import { createClassnames } from 'common/utils';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { NAMESPACE as LAUNCH_NAMESPACE } from 'controllers/launch';
import { PROJECT_LAUNCHES_PAGE, PROJECT_PIPELINE_ITERATION_PAGE } from 'controllers/pages';
import {
  AutomationStatus,
  MergeRequestState,
  type AiAutomationStatus,
  type AiMergeRequestState,
  type AutomateAcceptedRS,
  type TestCaseAiRS,
} from 'types/aiFactory';

import { getAutomationSkipReason, type AutomationCandidate } from './automationUtils';
import { useAutomationModal } from './useAutomationModal';
import { automationDisabledMessages, messages } from './messages';
import styles from './automationSection.scss';

const cx = createClassnames(styles);

const automationStatusMessages: Record<AiAutomationStatus, MessageDescriptor> = {
  [AutomationStatus.NOT_AUTOMATED]: messages.notAutomated,
  [AutomationStatus.IN_PROGRESS]: messages.inProgress,
  [AutomationStatus.AUTOMATED]: messages.automated,
  [AutomationStatus.FAILED]: messages.failed,
};

const mergeRequestStateMessages: Record<AiMergeRequestState, MessageDescriptor> = {
  [MergeRequestState.OPEN]: messages.mergeRequestOpen,
  [MergeRequestState.MERGED]: messages.mergeRequestMerged,
  [MergeRequestState.CLOSED]: messages.mergeRequestClosed,
};

const resultStatusMessages: Record<'PASSED' | 'FAILED', MessageDescriptor> = {
  PASSED: messages.passed,
  FAILED: messages.failed,
};

const isSafeInternalId = (value: number) => Number.isSafeInteger(value) && value > 0;

interface AutomationSectionProps {
  testCase: AutomationCandidate;
  automation?: TestCaseAiRS['automation'];
  canAutomate?: boolean;
  organizationSlug?: string;
  projectSlug?: string;
  isLoading?: boolean;
  isError?: boolean;
  hasLoadedData?: boolean;
  onRetry?: () => void;
  onSuccess?: (response: AutomateAcceptedRS) => void;
}

interface AutomationResultsProps {
  automation?: TestCaseAiRS['automation'];
  organizationSlug?: string;
  projectSlug?: string;
}

type Automation = NonNullable<TestCaseAiRS['automation']>;
type FormatMessage = IntlShape['formatMessage'];

interface RouteContext {
  organizationSlug?: string;
  projectSlug?: string;
}

const renderIteration = (
  iteration: NonNullable<Automation['iteration']>,
  routeContext: RouteContext,
  formatMessage: FormatMessage,
): ReactNode => {
  const label = formatMessage(messages.iteration, { number: iteration.number });
  const { organizationSlug, projectSlug } = routeContext;
  if (
    !organizationSlug ||
    !projectSlug ||
    !isSafeInternalId(iteration.pipelineId) ||
    !isSafeInternalId(iteration.iterationId)
  ) {
    return label;
  }
  return (
    <Link
      className={cx('automation-section__link')}
      data-automation-id="automationIterationLink"
      to={{
        type: PROJECT_PIPELINE_ITERATION_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          pipelineId: iteration.pipelineId,
          iterationId: iteration.iterationId,
        },
      }}
    >
      {label}
    </Link>
  );
};

const renderStatusRow = (
  automation: Automation | undefined,
  routeContext: RouteContext,
  formatMessage: FormatMessage,
): ReactNode => {
  const status = automation?.status ?? AutomationStatus.NOT_AUTOMATED;
  return (
    <div className={cx('automation-section__result-row')}>
      <dt>{formatMessage(messages.status)}</dt>
      <dd>
        <output data-automation-id="automationProgress">
          <span data-automation-id="automationStatus">
            {formatMessage(automationStatusMessages[status] ?? messages.unknownStatus)}
          </span>
          {automation?.iteration && (
            <>
              <span aria-hidden="true"> · </span>
              {renderIteration(automation.iteration, routeContext, formatMessage)}
            </>
          )}
        </output>
      </dd>
    </div>
  );
};

const renderLaunchRow = (
  launch: Automation['launch'],
  routeContext: RouteContext,
  formatMessage: FormatMessage,
): ReactNode => {
  if (!launch) return null;
  const { organizationSlug, projectSlug } = routeContext;
  const canLink = Boolean(organizationSlug && projectSlug && isSafeInternalId(launch.id));
  const content = canLink ? (
    <Link
      className={cx('automation-section__link')}
      data-automation-id="automationLaunchLink"
      to={{
        type: PROJECT_LAUNCHES_PAGE,
        payload: { organizationSlug, projectSlug, filterId: ALL },
        query: createNamespacedQuery({ 'filter.in.id': String(launch.id) }, LAUNCH_NAMESPACE),
      }}
    >
      {launch.name}
    </Link>
  ) : (
    launch.name
  );
  return (
    <div className={cx('automation-section__result-row')}>
      <dt>{formatMessage(messages.launch, { number: launch.number })}</dt>
      <dd>{content}</dd>
    </div>
  );
};

const renderMergeRequestRow = (
  mergeRequest: Automation['mergeRequest'],
  formatMessage: FormatMessage,
): ReactNode =>
  mergeRequest ? (
    <div className={cx('automation-section__result-row')}>
      <dt>{formatMessage(messages.mergeRequest)}</dt>
      <dd data-automation-id="automationMergeRequest">
        {mergeRequest.id}
        <span aria-hidden="true"> · </span>
        {formatMessage(mergeRequestStateMessages[mergeRequest.state] ?? messages.unknownStatus)}
      </dd>
    </div>
  ) : null;

const renderLastResultRow = (
  lastResult: Automation['lastResult'],
  formatMessage: FormatMessage,
): ReactNode =>
  lastResult ? (
    <div className={cx('automation-section__result-row')}>
      <dt>{formatMessage(messages.lastResult)}</dt>
      <dd data-automation-id="automationLastResult">
        {formatMessage(resultStatusMessages[lastResult.status] ?? messages.unknownStatus)}
        {lastResult.defectType && (
          <>
            <span aria-hidden="true"> · </span>
            {formatMessage(messages.defectType, { type: lastResult.defectType })}
          </>
        )}
      </dd>
    </div>
  ) : null;

const AutomationResults = ({
  automation,
  organizationSlug,
  projectSlug,
}: AutomationResultsProps) => {
  const { formatMessage } = useIntl();
  const routeContext = { organizationSlug, projectSlug };

  return (
    <dl className={cx('automation-section__results')} data-automation-id="automationResults">
      {renderStatusRow(automation, routeContext, formatMessage)}
      {renderLaunchRow(automation?.launch, routeContext, formatMessage)}
      {renderMergeRequestRow(automation?.mergeRequest, formatMessage)}
      {renderLastResultRow(automation?.lastResult, formatMessage)}
    </dl>
  );
};

interface RequestStateProps {
  automation?: Automation;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

const renderRequestState = (
  { automation, isLoading, isError, onRetry }: RequestStateProps,
  formatMessage: FormatMessage,
): ReactNode => (
  <>
    {isLoading && (
      <output
        className={cx('automation-section__state')}
        aria-label={formatMessage(automation ? messages.updatingResults : messages.loadingResults)}
      >
        {automation ? formatMessage(messages.updatingResults) : <BubblesLoader />}
      </output>
    )}
    {isError && (
      <div className={cx('automation-section__state')} role="alert">
        <span>{formatMessage(messages.loadResultsFailed)}</span>
        {onRetry && (
          <Button
            variant="text"
            adjustWidthOn="content"
            onClick={onRetry}
            data-automation-id="retryAutomationResults"
          >
            {formatMessage(messages.retry)}
          </Button>
        )}
      </div>
    )}
  </>
);

const renderScenarioWarning = (
  isScenarioChanged: boolean | undefined,
  formatMessage: FormatMessage,
): ReactNode =>
  isScenarioChanged ? (
    <p className={cx('automation-section__warning')} data-automation-id="automationScenarioChanged">
      {formatMessage(messages.scenarioChanged)}
    </p>
  ) : null;

interface AutomationActionProps {
  disabledReason: ReturnType<typeof getAutomationSkipReason>;
  onClick: () => void;
}

const renderAutomationAction = (
  { disabledReason, onClick }: AutomationActionProps,
  formatMessage: FormatMessage,
): ReactNode => (
  <>
    <Button
      variant="ghost"
      disabled={Boolean(disabledReason)}
      onClick={onClick}
      data-automation-id="automateTestCase"
    >
      {formatMessage(messages.automate)}
    </Button>
    {disabledReason && (
      <p className={cx('automation-section__hint')}>
        {formatMessage(automationDisabledMessages[disabledReason])}
      </p>
    )}
  </>
);

export const AutomationSection = ({
  testCase,
  automation,
  canAutomate = true,
  organizationSlug,
  projectSlug,
  isLoading = false,
  isError = false,
  hasLoadedData = false,
  onRetry,
  onSuccess,
}: AutomationSectionProps) => {
  const { formatMessage } = useIntl();
  const { openModal } = useAutomationModal();
  const disabledReason = getAutomationSkipReason(testCase);
  const hasResolvedData = Boolean(automation) || hasLoadedData || (!isLoading && !isError);
  const openAutomationModal = () => openModal({ testCases: [testCase], onSuccess });

  return (
    <CollapsibleSection title={formatMessage(messages.sectionTitle)} isInitiallyExpanded>
      <div className={cx('automation-section')}>
        {hasResolvedData && (
          <AutomationResults
            automation={automation}
            organizationSlug={organizationSlug}
            projectSlug={projectSlug}
          />
        )}
        {renderRequestState({ automation, isLoading, isError, onRetry }, formatMessage)}
        {renderScenarioWarning(automation?.scenarioChangedAfterAutomation, formatMessage)}
        {canAutomate &&
          renderAutomationAction({ disabledReason, onClick: openAutomationModal }, formatMessage)}
      </div>
    </CollapsibleSection>
  );
};
