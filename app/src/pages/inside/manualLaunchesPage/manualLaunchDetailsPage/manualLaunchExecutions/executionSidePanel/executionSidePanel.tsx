import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
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
import type { Issue } from '@reportportal/ui-kit/issueList';

import { useOnClickOutside } from 'common/hooks';
import { createClassnames, formatDuration } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { FolderBreadcrumbs } from 'components/folderBreadcrumbs';
import { BtsTicket, EXECUTION_STATUSES } from 'controllers/manualLaunch';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';
import { ExecutionStatusPopover } from 'pages/inside/manualLaunchesPage/manualLaunchExecutionPage/executionStatusPopover';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as testCaseMessages } from 'pages/inside/common/testCaseList/testCaseSidePanel/messages';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { InfoBlock } from 'pages/inside/common/infoBlock';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { RequirementsList } from 'pages/inside/common/requirementsList/requirementsList';
import { Scenario } from 'pages/inside/common/testCaseList/testCaseSidePanel/scenario';
import { TestCaseManualScenario } from 'pages/inside/common/testCaseList/types';
import { formatTimestamp } from 'pages/inside/common/testCaseList/utils';
import { Divider } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { AttachmentList, type Attachment } from 'pages/inside/common/attachmentList';

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
  const { canManageExecutions } = useUserPermissions();
  const [isPopoverOpened, setIsPopoverOpened] = useState(false);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const { executionDetails, isLoading } = useExecutionDetails(executionId);

  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;

  const isScenarioProvided =
    (executionDetails?.manualScenario?.manualScenarioType === TestCaseManualScenario.STEPS &&
      !isEmpty(executionDetails?.manualScenario?.steps)) ||
    executionDetails?.manualScenario?.manualScenarioType === TestCaseManualScenario.TEXT;

  useOnClickOutside(sidePanelRef, onClose);

  const convertBTSTicketsToIssues = (tickets: BtsTicket[]): Issue[] => {
    return tickets.map(
      (ticket) =>
        ({
          key: String(ticket.id),
          name: ticket.name || ticket.id,
          ...ticket,
        }) as Issue,
    );
  };

  const titleComponent = (
    <div className={cx('title-wrapper')}>
      {executionDetails?.testCasePriority && (
        <PriorityIcon priority={executionDetails.testCasePriority} />
      )}
      {executionDetails?.testCaseName && (
        <span className={cx('title-name')}>{executionDetails.testCaseName}</span>
      )}
    </div>
  );

  const descriptionComponent = (
    <div className={cx('sidepanel-description')}>
      <FolderBreadcrumbs
        folderId={executionDetails?.testFolder?.id}
        instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
      />
      <div className={cx('meta-row')}>
        <div className={cx('meta-row-item')}>
          <span className={cx('meta-label')}>{formatMessage(messages.executionId)}:</span>
          <a
            href={`/#/organizations/${organizationSlug}/projects/${projectSlug}/testLibrary/test-cases/${executionDetails?.testCaseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cx('meta-value')}
          >
            {executionDetails?.testCaseId}
          </a>
        </div>
        {executionDetails?.executionStatus !== EXECUTION_STATUSES.TO_RUN &&
          executionDetails?.startedAt && (
            <div className={cx('meta-row-item')}>
              <RerunIcon />
              <span className={cx('meta-value')}>
                {formatTimestamp(executionDetails.startedAt)}
              </span>
            </div>
          )}
        <div className={cx('meta-row-item')}>
          <DurationIcon />
          {executionDetails?.duration ? (
            <span className={cx('meta-value')}>{formatDuration(executionDetails.duration)}</span>
          ) : (
            <span className={cx('meta-empty-value')}> - </span>
          )}
        </div>
      </div>
    </div>
  );

  const contentComponent = (
    <div className={cx('content-wrapper')}>
      {executionDetails?.executionComment?.comment && (
        <div className={cx('execution-info')}>
          {!isEmpty(executionDetails.executionComment.btsTickets) && (
            <div className={cx('info-item')}>
              <span className={cx('info-label')}>{formatMessage(messages.linkedToBTS)}</span>
              <IssueList
                issues={convertBTSTicketsToIssues(executionDetails.executionComment.btsTickets)}
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
    </div>
  );

  const footerComponent = canManageExecutions && (
    <div className={cx('footer')}>
      {executionDetails && (
        <ExecutionStatusPopover
          executionId={executionDetails.id}
          currentStatus={executionDetails.executionStatus}
          isOpened={isPopoverOpened}
          setIsOpened={setIsPopoverOpened}
        >
          <Button
            variant="ghost"
            className={cx('action-button')}
            onClick={() => setIsPopoverOpened(true)}
            data-automation-id="test-plan-open-in-library"
          >
            {formatMessage(messages.changeStatus)}
            <ChevronDownDropdownIcon />
          </Button>
        </ExecutionStatusPopover>
      )}
      {executionDetails?.executionStatus === EXECUTION_STATUSES.TO_RUN && (
        <Button
          variant="primary"
          className={cx('action-button')}
          onClick={() => {}}
          data-automation-id="test-plan-quick-run"
        >
          {formatMessage(messages.runTest)}
          <RunManualIcon />
        </Button>
      )}
    </div>
  );

  return (
    <div ref={sidePanelRef}>
      <SidePanel
        className={cx('execution-side-panel')}
        title={isLoading ? <BubblesLoader /> : titleComponent}
        descriptionComponent={isLoading ? <BubblesLoader /> : descriptionComponent}
        contentComponent={isLoading ? <BubblesLoader /> : contentComponent}
        footerComponent={isLoading ? <BubblesLoader /> : footerComponent}
        isOpen={!!executionId}
        onClose={onClose}
      />
    </div>
  );
};
