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
import { TEST_CASE_LIBRARY_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';
import { Scenario } from 'pages/inside/common/testCaseList/testCaseSidePanel/scenario';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';

import { TestPlanDto } from 'controllers/testPlan';
import { messages } from './messages';
import { MOCK_DATA_1, MOCK_DATA_2 } from './mocks';
import { CoverStatusCard } from './coverStatusCard';
import { ExecutionStatus } from './executionStatus';

import styles from './testPlanSidePanel.scss';

const cx = createClassnames(styles);

interface TestPlanSidePanelProps {
  testPlan: TestPlanDto | null;
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

    useOnClickOutside(sidePanelRef, onClose);

    if (!testPlan) {
      return null;
    }

    // Select mock data based on even/odd ID
    const mockData = Number(testPlan.id) % 2 === 0 ? MOCK_DATA_1 : MOCK_DATA_2;

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
        <PriorityIcon priority={mockData.priority} className={cx('priority-icon')} />
        <span>{testPlan.name}</span>
      </div>
    );

    const descriptionComponent = (
      <div className={cx('description-wrapper')}>
        <PathBreadcrumb
          path={mockData.breadcrumbPath}
          color="var(--rp-ui-base-e-400)"
          isIconVisible={false}
        />
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
          <div className={cx('meta-item-row')}>
            <DurationIcon />
            <span className={cx('meta-value')}>{mockData.duration}</span>
          </div>
        </div>
      </div>
    );

    const contentComponent = (
      <div className={cx('content')}>
        <CoverStatusCard status={mockData.coverStatus} />
        <CollapsibleSection
          title={formatMessage(messages.executionsInLaunchesTitle)}
          defaultMessage={formatMessage(commonMessages.noExecutions)}
        >
          {!isEmpty(mockData.executions) && <ExecutionStatus executions={mockData.executions} />}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(messages.manualScenarioTitle)}
          defaultMessage={formatMessage(messages.noManualScenario)}
        >
          {!isEmpty(mockData.scenario) && <Scenario scenario={mockData.scenario} />}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(commonMessages.tags)}
          defaultMessage={formatMessage(commonMessages.noTagsAdded)}
        >
          {!isEmpty(mockData.tags) && <AdaptiveTagList tags={mockData.tags} isShowAllView />}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(commonMessages.description)}
          defaultMessage={formatMessage(commonMessages.descriptionNotSpecified)}
        >
          {!isEmpty(mockData.description) && (
            <ExpandedTextSection text={mockData.description} defaultVisibleLines={4} />
          )}
        </CollapsibleSection>
      </div>
    );

    const footerComponent = (
      <div className={cx('footer')}>
        <PopoverControl
          items={menuItems}
          placement="top-start"
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
          descriptionComponent={descriptionComponent}
          contentComponent={contentComponent}
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
