import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { isEmpty } from 'es-toolkit/compat';
import Link from 'redux-first-router-link';
import {
  AdaptiveTagList,
  BubblesLoader,
  Button,
  ChevronDownDropdownIcon,
  DurationIcon,
  IssueList,
  RerunIcon,
  RunManualIcon,
  SidePanel,
} from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Issue } from '@reportportal/ui-kit/issueList';

import { useOnClickOutside } from 'common/hooks';
import { createClassnames, formatDuration } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { FolderBreadcrumbs } from 'components/folderBreadcrumbs';
import {
  BtsTicket,
  manualLaunchFoldersSelector,
  manualLaunchTestCaseExecutionsSelector,
  updateManualLaunchExecutionStatusAction,
} from 'controllers/manualLaunch';
import {
  MANUAL_LAUNCH_DETAILS_PAGE,
  MANUAL_LAUNCH_EXECUTION_PAGE,
  TEST_CASE_LIBRARY_PAGE,
} from 'controllers/pages/constants';
import { useManualLaunchId, useProjectDetails } from 'hooks/useTypedSelector';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as testCaseMessages } from 'pages/inside/common/testCaseList/testCaseSidePanel/messages';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { InfoBlock } from 'pages/inside/common/infoBlock';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { RequirementsList } from 'pages/inside/common/requirementsList/requirementsList';
import { Scenario } from 'pages/inside/common/testCaseList/testCaseSidePanel/scenario';
import { formatTimestamp } from 'pages/inside/common/testCaseList/utils';
import { ExecutionStatusPopover } from 'pages/inside/manualLaunchesPage/executionStatusPopover';
import { Divider } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { AttachmentList, type Attachment } from 'pages/inside/common/attachmentList';
import { IN_PROGRESS } from 'common/constants/testStatuses';
import { projectKeySelector } from 'controllers/project';
import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';
import { TestCaseManualScenario } from 'types/testCase';
import {
  MANUAL_LAUNCHES_PAGE_EVENTS,
  MANUAL_LAUNCHES_PLACE,
} from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';

import { messages } from './messages';
import { useExecutionDetails } from './useExecutionDetails';

import styles from './executionSidePanel.scss';

const cx = createClassnames(styles);

interface ExecutionSidePanelProps {
  executionId: number | null;
  onClose: () => void;
}

export const ExecutionSidePanel = ({ executionId, onClose }: ExecutionSidePanelProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const launchId = useManualLaunchId();
  const { canManageExecutions } = useUserPermissions();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const projectKey = useSelector(projectKeySelector);
  const dispatch = useDispatch();
  const { executionDetails, isLoading } = useExecutionDetails(executionId);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const currentStatus =
    executions.find((e) => e.id === executionId)?.executionStatus ??
    executionDetails?.executionStatus;
  const isScenarioProvided =
    (executionDetails?.manualScenario?.manualScenarioType === TestCaseManualScenario.STEPS &&
      !isEmpty(executionDetails?.manualScenario?.steps)) ||
    executionDetails?.manualScenario?.manualScenarioType === TestCaseManualScenario.TEXT;
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  useOnClickOutside(sidePanelRef, isStatusPopoverOpen ? undefined : onClose);

  const onFolderClick = (e?: React.MouseEvent, folderId?: number) => {
    e?.preventDefault();

    dispatch({
      type: MANUAL_LAUNCH_DETAILS_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
        launchId,
        ...(folderId && {
          manualLaunchPageRoute: `folder/${folderId}`,
        }),
      },
    });
    onClose();
  };

  const navigateToExecutionPage = () => {
    dispatch({
      type: MANUAL_LAUNCH_EXECUTION_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
        launchId,
        testCaseId: executionDetails.testCaseId,
        executionId: executionDetails.id,
      },
    });
  };

  const onRunTestClick = () => {
    trackEvent(MANUAL_LAUNCHES_PAGE_EVENTS.CLICK_RUN_TEST);
    dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey,
        launchId,
        executionId,
        status: IN_PROGRESS,
        onSuccess: navigateToExecutionPage,
      }),
    );
  };

  const onContinueTestingClick = () => {
    trackEvent(MANUAL_LAUNCHES_PAGE_EVENTS.CLICK_CONTINUE_TESTING);
    navigateToExecutionPage();
  };

  const convertBTSTicketsToIssues = (tickets: BtsTicket[]): Issue[] => {
    return tickets.map(
      (ticket) =>
        ({
          ...ticket,
          key: String(ticket.ticketId),
          name: ticket.ticketId,
          link: ticket.url,
        }) as Issue,
    );
  };

  const headerComponent = (
    <div className={cx('header-title-wrapper')}>
      {executionDetails?.testCasePriority && (
        <PriorityIcon
          priority={executionDetails.testCasePriority}
          className={cx('priority-icon')}
        />
      )}
      {executionDetails?.testCaseName && (
        <span className={cx('header-title')} title={executionDetails.testCaseName}>
          {executionDetails.testCaseName}
        </span>
      )}
    </div>
  );

  const descriptionComponent = executionDetails && (
    <div className={cx('sidepanel-description')}>
      <FolderBreadcrumbs
        folderId={executionDetails.testFolder?.testItemId}
        instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
        onNavigate={onFolderClick}
        customFoldersSelector={manualLaunchFoldersSelector}
        withoutRedirect
      />
      <div className={cx('meta-row')}>
        <div className={cx('meta-row-item')}>
          <span className={cx('meta-label')}>{formatMessage(messages.executionId)}:</span>
          <Link
            className={cx('meta-value', 'id-link')}
            to={{
              type: TEST_CASE_LIBRARY_PAGE,
              payload: {
                organizationSlug,
                projectSlug,
                testCasePageRoute: `test-cases/${executionDetails.testCaseId}`,
              },
            }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={formatMessage(messages.openTestCaseInNewTab)}
          >
            {executionDetails.testCaseDisplayId ?? executionDetails.testCaseId}
          </Link>
        </div>
        {executionDetails.startedAt &&
          executionDetails.executionStatus !== ExecutionStatus.TO_RUN && (
            <div className={cx('meta-row-item')}>
              <RerunIcon />
              <span className={cx('meta-value')}>
                {formatTimestamp(executionDetails.startedAt)}
              </span>
            </div>
          )}
        {executionDetails.duration != null && (
          <div className={cx('meta-row-item')}>
            <DurationIcon />
            <span className={cx('meta-value')}>{formatDuration(executionDetails.duration)}</span>
          </div>
        )}
      </div>
    </div>
  );

  const contentComponent = (
    <div className={cx('content-wrapper')}>
      {executionDetails?.executionComment?.comment && (
        <div className={cx('execution-info')}>
          {!isEmpty(executionDetails?.btsTickets) && (
            <div className={cx('info-item')}>
              <span className={cx('info-label')}>{formatMessage(messages.linkedToBTS)}</span>
              <IssueList
                issues={convertBTSTicketsToIssues(executionDetails.btsTickets)}
                className={cx('bts-issues')}
              />
            </div>
          )}
          {executionDetails.executionComment.comment && (
            <div className={cx('info-item')}>
              <span className={cx('info-label')}>{formatMessage(messages.executionComment)}</span>
              <span className={cx('info-value')}>{executionDetails.executionComment.comment}</span>
            </div>
          )}
          {!isEmpty(executionDetails.executionComment.attachments) && (
            <>
              <Divider />
              <div className={cx('info-item')}>
                <span
                  className={cx('meta-label')}
                >{`${formatMessage(commonMessages.attachments)} ${executionDetails.executionComment.attachments.length}`}</span>
                <AttachmentList
                  attachments={executionDetails.executionComment.attachments as Attachment[]}
                />
              </div>
            </>
          )}
        </div>
      )}
      <CollapsibleSection
        title={formatMessage(commonMessages.description)}
        defaultMessage={formatMessage(commonMessages.descriptionNotSpecified)}
      >
        {executionDetails?.testCaseDescription && (
          <ExpandedTextSection
            text={executionDetails.testCaseDescription}
            defaultVisibleLines={5}
          />
        )}
      </CollapsibleSection>
      <CollapsibleSection
        title={formatMessage(commonMessages.requirements)}
        defaultMessage={formatMessage(commonMessages.requirementsAreNotSpecified)}
      >
        {!isEmpty(executionDetails?.requirements) && (
          <RequirementsList items={executionDetails.requirements} />
        )}
      </CollapsibleSection>
      <CollapsibleSection title={formatMessage(commonMessages.tags)}>
        {isEmpty(executionDetails?.attributes) ? (
          <InfoBlock label={formatMessage(commonMessages.noTagsAdded)} />
        ) : (
          <AdaptiveTagList
            tags={executionDetails.attributes.map((attr) => attr.key)}
            isShowAllView
          />
        )}
      </CollapsibleSection>
      <CollapsibleSection
        title={formatMessage(commonMessages.scenario)}
        defaultMessage={formatMessage(testCaseMessages.noDetailsForScenario)}
      >
        {isScenarioProvided && <Scenario scenario={executionDetails.manualScenario} />}
      </CollapsibleSection>
      {executionDetails?.manualScenario?.manualScenarioType === TestCaseManualScenario.TEXT && (
        <CollapsibleSection
          title={formatMessage(commonMessages.attachments)}
          defaultMessage={formatMessage(commonMessages.noAttachmentsAdded)}
        >
          {!isEmpty(executionDetails.manualScenario?.attachments) && (
            <AttachmentList
              attachments={executionDetails.manualScenario.attachments}
              className={cx('attachments-list')}
              withPreview
            />
          )}
        </CollapsibleSection>
      )}
    </div>
  );

  const footerComponent =
    canManageExecutions && executionDetails ? (
      <div className={cx('footer')}>
        <ExecutionStatusPopover
          executionId={executionId}
          isOpened={isStatusPopoverOpen}
          setIsOpened={setIsStatusPopoverOpen}
          currentStatus={currentStatus}
          place={MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR}
          shouldUsePortal
          strategy="fixed"
        >
          <Button
            variant="ghost"
            className={cx('action-button')}
            data-automation-id="test-plan-open-in-library"
          >
            {formatMessage(messages.changeStatus)}
            <ChevronDownDropdownIcon />
          </Button>
        </ExecutionStatusPopover>
        {currentStatus === ExecutionStatus.TO_RUN && (
          <Button
            variant="primary"
            className={cx('action-button')}
            onClick={onRunTestClick}
            data-automation-id="test-plan-quick-run"
          >
            {formatMessage(commonMessages.runTest)}
            <RunManualIcon />
          </Button>
        )}
        {currentStatus === ExecutionStatus.IN_PROGRESS && (
          <Button
            variant="primary"
            className={cx('action-button')}
            onClick={onContinueTestingClick}
            data-automation-id="test-plan-continue-testing"
          >
            {formatMessage(messages.continueTesting)}
            <RunManualIcon />
          </Button>
        )}
      </div>
    ) : null;

  return (
    <div ref={sidePanelRef}>
      <SidePanel
        className={cx('execution-side-panel')}
        headerComponent={isLoading ? <BubblesLoader /> : headerComponent}
        descriptionComponent={isLoading ? <BubblesLoader /> : descriptionComponent}
        contentComponent={isLoading ? <BubblesLoader /> : contentComponent}
        footerComponent={isLoading ? <BubblesLoader /> : footerComponent}
        isOpen={!!executionId}
        onClose={onClose}
      />
    </div>
  );
};
