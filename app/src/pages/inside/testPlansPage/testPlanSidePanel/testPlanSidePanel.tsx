/*
 * Copyright 2025 EPAM Systems
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

import { memo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button,
  SidePanel,
  ExternalLinkIcon,
  RunManualIcon,
  MeatballMenuIcon,
  DurationIcon,
  CopyIcon,
  BubblesLoader,
} from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames, copyToClipboard } from 'common/utils';
import { useOnClickOutside } from 'common/hooks';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { PopoverControl } from 'pages/common/popoverControl';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { PathBreadcrumb } from 'componentLibrary/breadcrumbs/pathBreadcrumb';
import { commonMessages } from 'pages/inside/common/common-messages';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlOrganizationAndProjectSelector,
  locationSelector,
  PROJECT_TEST_PLAN_DETAILS_PAGE,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';
import { Scenario } from 'pages/inside/common/testCaseList/testCaseSidePanel/scenario';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { testPlanFoldersSelector } from 'controllers/testPlan';
import { foldersSelector } from 'controllers/testCase';
import { useGenerateFolderPath } from 'hooks/useGenerateFolderPath';

import { TestPlanDto } from 'controllers/testPlan';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { formatDuration } from 'pages/inside/common/testCaseList/utils';
import { messages } from './messages';
import { CoverStatusCard } from './coverStatusCard';
import { ExecutionStatusCard } from './executionStatusCard';
import { useTestCaseDetails } from './useTestCaseDetails';

import styles from './testPlanSidePanel.scss';

const cx = createClassnames(styles);

interface TestPlanSidePanelProps {
  testPlan: TestPlanDto | ExtendedTestCase | null;
  isVisible: boolean;
  onClose: () => void;
}

export const TestPlanSidePanel = memo(
  ({ testPlan, isVisible, onClose }: TestPlanSidePanelProps) => {
    const dispatch = useDispatch();
    const { formatMessage } = useIntl();
    const sidePanelRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { organizationSlug, projectSlug } = useSelector(
      urlOrganizationAndProjectSelector,
    ) as ProjectDetails;

    const location = useSelector(locationSelector);
    const isTestPlanRoute = location.type === PROJECT_TEST_PLAN_DETAILS_PAGE;
    const testPlanId = location.payload?.testPlanId ?? null;

    const { testCaseDetails, isLoading, isManualCovered } = useTestCaseDetails({
      testCaseId: testPlan?.id ?? null,
      testPlanId: isTestPlanRoute ? testPlanId : null,
    });

    const testPlanFolders = useSelector(testPlanFoldersSelector);
    const testCaseFolders = useSelector(foldersSelector);
    const folders = isTestPlanRoute ? testPlanFolders : testCaseFolders;
    const breadcrumbPath = useGenerateFolderPath(testCaseDetails?.testFolder?.id, folders);

    useOnClickOutside(sidePanelRef, onClose);

    if (!testCaseDetails || !testPlan) {
      return null;
    }

    const handleRemoveFromTestPlan = () => {
      // TODO: Implement remove from test plan functionality
      setIsMenuOpen(false);
    };

    const handleOpenInLibraryClick = () => {
      dispatch({
        type: TEST_CASE_LIBRARY_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          testCasePageRoute: `test-cases/${testPlan.id}`,
        },
      });
    };

    const handleQuickRunClick = () => {
      // TODO: Implement quick run functionality
    };

    const menuItems = [
      {
        label: formatMessage(messages.removeFromTestPlan),
        onClick: handleRemoveFromTestPlan,
        variant: 'danger' as const,
      },
    ];

    const handleCopyId = async () => {
      await copyToClipboard(testPlan.id.toString());
    };

    const titleComponent = (
      <div className={cx('test-plan-title')}>
        <PriorityIcon priority={testCaseDetails?.priority} className={cx('priority-icon')} />
        <span>{testPlan.name}</span>
      </div>
    );

    const duration = testCaseDetails?.lastExecution?.duration
      ? formatDuration(testCaseDetails.lastExecution.duration)
      : '';

    const descriptionComponent = (
      <div className={cx('description-wrapper')}>
        {!isEmpty(breadcrumbPath) && (
          <PathBreadcrumb
            path={breadcrumbPath}
            color="var(--rp-ui-base-e-400)"
            isIconVisible={false}
          />
        )}
        <div className={cx('meta-row')}>
          <div className={cx('meta-item-row', 'id-row')}>
            <span className={cx('meta-label')}>{formatMessage(messages.id)}:</span>
            <span className={cx('meta-value')}>{testPlan.id}</span>
            <button
              type="button"
              className={cx('copy-button')}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={handleCopyId}
              aria-label="Copy ID"
            >
              <CopyIcon />
            </button>
          </div>
          {duration && (
            <div className={cx('meta-item-row')}>
              <DurationIcon />
              <span className={cx('meta-value')}>{duration}</span>
            </div>
          )}
        </div>
      </div>
    );

    const contentComponent = (
      <div className={cx('content')}>
        <CoverStatusCard isManualCovered={isManualCovered} />
        <CollapsibleSection
          title={formatMessage(messages.executionsInLaunchesTitle)}
          defaultMessage={formatMessage(commonMessages.noExecutions)}
        >
          {!isEmpty(testCaseDetails?.executions) && (
            <ExecutionStatusCard executions={testCaseDetails.executions} />
          )}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(messages.manualScenarioTitle)}
          defaultMessage={formatMessage(messages.noManualScenario)}
        >
          {!isEmpty(testCaseDetails?.manualScenario) && (
            <Scenario scenario={testCaseDetails.manualScenario} />
          )}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(commonMessages.tags)}
          defaultMessage={formatMessage(commonMessages.noTagsAdded)}
        >
          {!isEmpty(testCaseDetails?.attributes) && (
            <AdaptiveTagList
              tags={testCaseDetails.attributes.map((attr) => attr.key)}
              isShowAllView
            />
          )}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(commonMessages.description)}
          defaultMessage={formatMessage(commonMessages.descriptionNotSpecified)}
        >
          {!isEmpty(testCaseDetails?.description) && (
            <ExpandedTextSection text={testCaseDetails.description} defaultVisibleLines={4} />
          )}
        </CollapsibleSection>
      </div>
    );

    const footerComponent = (
      <div className={cx('footer')}>
        <PopoverControl
          items={menuItems}
          placement="top"
          isOpened={isMenuOpen}
          setIsOpened={setIsMenuOpen}
        >
          <Button
            variant="ghost"
            className={cx('action-button', 'menu-button')}
            data-automation-id="test-plan-more-actions"
            aria-label={formatMessage(commonMessages.moreActions)}
          >
            <MeatballMenuIcon />
          </Button>
        </PopoverControl>
        <div className={cx('footer-right-actions')}>
          <Button
            variant="ghost"
            className={cx('action-button')}
            onClick={handleOpenInLibraryClick}
            data-automation-id="test-plan-open-in-library"
          >
            {formatMessage(messages.openInLibrary)}
            <ExternalLinkIcon />
          </Button>
          <Button
            variant="primary"
            className={cx('action-button')}
            onClick={handleQuickRunClick}
            data-automation-id="test-plan-quick-run"
          >
            {formatMessage(messages.quickRun)}
            <RunManualIcon />
          </Button>
        </div>
      </div>
    );

    return (
      <div ref={sidePanelRef}>
        <SidePanel
          className={cx('test-plan-side-panel')}
          title={titleComponent}
          descriptionComponent={isLoading ? <BubblesLoader /> : descriptionComponent}
          contentComponent={isLoading ? <BubblesLoader /> : contentComponent}
          footerComponent={footerComponent}
          isOpen={isVisible}
          onClose={onClose}
          closeButtonAriaLabel={formatMessage(commonMessages.closePanel)}
          side="right"
        />
      </div>
    );
  },
);
