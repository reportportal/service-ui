
import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { AdaptiveTagList, BubblesLoader, Button, ChevronDownDropdownIcon, DurationIcon, RerunIcon, RunManualIcon, SidePanel } from '@reportportal/ui-kit';

import { useOnClickOutside } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { FolderBreadcrumbs } from 'components/folderBreadcrumbs';
import { commonMessages } from "pages/inside/common/common-messages";
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { RequirementsList } from 'pages/inside/common/requirementsList/requirementsList';
import { Scenario } from 'pages/inside/common/testCaseList/testCaseSidePanel/scenario/scenario';
import { formatTimestamp } from 'pages/inside/common/testCaseList/utils';
import { Divider } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { AttachmentList } from 'pages/inside/testCaseLibraryPage/attachmentList';
import { Attachment } from 'pages/inside/testCaseLibraryPage/types';

import { messages } from './messages';
import { useExecutionDetails } from './useExecutionDetails';

import styles from './executionSidePanel.scss';

const cx = createClassnames(styles);

interface ExecutionSidePanelProps {
  executionId: number | null;
  isVisible: boolean;
  onClose: () => void;
};

export const ExecutionSidePanel = ({ executionId, isVisible, onClose }: ExecutionSidePanelProps) => {
  const { formatMessage } = useIntl();
  const { executionDetails, isLoading } = useExecutionDetails(executionId);
  const sidePanelRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(sidePanelRef, onClose);

  const titleComponent = (
    <div className={cx('title-wrapper')}>
      {executionDetails?.testCasePriority && <PriorityIcon priority={executionDetails.testCasePriority} />}
      <span className={cx('title-name')}>
        {`${executionDetails?.testCaseId} ${executionDetails?.testCaseName}`}
      </span>
    </div>
  )

  const descriptionComponent = (
    <div className={cx('sidepanel-description')}>
      <FolderBreadcrumbs folderId={executionDetails?.testFolder?.testItemId} instanceKey={TMS_INSTANCE_KEY.MANUAL_LAUNCH_EXECUTION} />
      <div className={cx('meta-row')}>
        <div className={cx('meta-row-item')}>
          <span className={cx('meta-label')}>{formatMessage(messages.executionId)}:</span>
          <span className={cx('meta-value')}>{executionDetails?.id}</span>
        </div>
        {executionDetails?.startedAt && (<div className={cx('meta-row-item')}>
          <RerunIcon />
          <span className={cx('meta-value')}>{formatTimestamp(executionDetails.startedAt)}</span>
        </div>)}
        {executionDetails?.duration && (
          <div className={cx('meta-row-item')}>
            <DurationIcon />
            <span className={cx('meta-value')}>{executionDetails.duration}</span>
          </div>
        )}
      </div>
    </div>
  );

  const contentComponent = (
    <div className={cx('content-wrapper')}>
      <div className={cx('execution-info')}>
        <div className={cx('info-item')}>
          <span className={cx('info-label')}>{formatMessage(messages.linkedToBTS)}</span>
        </div>
        {executionDetails?.executionComment && (
          <div className={cx('info-item')}>
            <span className={cx('info-label')}>{formatMessage(messages.executionComment)}</span>
            <span className={cx('info-value')}>{executionDetails?.executionComment?.comment}</span>
          </div>
        )}
        <Divider />
        {executionDetails?.attachments?.length && (
          <div className={cx('info-item')}>
            <span className={cx('meta-label')}>{`${formatMessage(commonMessages.attachments)} ${executionDetails.attachments?.length}`}</span>
            <AttachmentList attachments={executionDetails.attachments as Attachment[]} />
          </div>
        )}
      </div>
      {executionDetails?.testCaseDescription && (
        <CollapsibleSection title={formatMessage(commonMessages.description)}>
          <ExpandedTextSection text={executionDetails.testCaseDescription} defaultVisibleLines={5} />
        </CollapsibleSection>
      )}
      {executionDetails?.requirements && <CollapsibleSection title={formatMessage(commonMessages.requirements)}>
        <RequirementsList items={executionDetails.requirements} />
      </CollapsibleSection>}
      {executionDetails?.tags && <CollapsibleSection title={formatMessage(commonMessages.tags)}>
        <AdaptiveTagList tags={executionDetails.tags} isShowAllView />
      </CollapsibleSection>}
      {executionDetails?.manualScenario && <CollapsibleSection title={formatMessage(commonMessages.scenario)}>
        <Scenario scenario={executionDetails?.manualScenario} />
      </CollapsibleSection>}
    </div>
  );

  const footerComponent = (
    <div className={cx('footer')}>
      <Button
        variant="ghost"
        className={cx('action-button')}
        onClick={() => {}}
        data-automation-id="test-plan-open-in-library"
      >
        {formatMessage(messages.changeStatus)}
        <ChevronDownDropdownIcon />
      </Button>
      <Button
        variant="primary"
        className={cx('action-button')}
        onClick={() => {}}
        data-automation-id="test-plan-quick-run"
      >
        {formatMessage(messages.runTest)}
        <RunManualIcon />
      </Button>
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
        isOpen={isVisible}
        onClose={onClose}
      />
    </div>
  )
};