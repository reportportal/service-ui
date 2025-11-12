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
import {
  Button,
  SidePanel,
  ExternalLinkIcon,
  CoveredManuallyIcon,
  MeatballMenuIcon,
  DurationIcon,
  CopyIcon,
} from '@reportportal/ui-kit';

import { createClassnames, copyToClipboard } from 'common/utils';
import { useOnClickOutside } from 'common/hooks';
import { CollapsibleSection } from 'components/collapsibleSection';
import { PopoverControl } from 'pages/common/popoverControl';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { PathBreadcrumb } from 'componentLibrary/breadcrumbs/pathBreadcrumb';
import { commonMessages } from 'pages/inside/common/common-messages';

import { TestPlanDto } from 'controllers/testPlan';
import { messages } from './messages';

import styles from './testPlanSidePanel.scss';

const cx = createClassnames(styles);

interface TestPlanSidePanelProps {
  testPlan: TestPlanDto | null;
  isVisible: boolean;
  onClose: () => void;
}

export const TestPlanSidePanel = memo(
  ({ testPlan, isVisible, onClose }: TestPlanSidePanelProps) => {
    const { formatMessage } = useIntl();
    const sidePanelRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useOnClickOutside(sidePanelRef, onClose);

    if (!testPlan) {
      return null;
    }

    const handleRemoveFromTestPlan = () => {
      // TODO: Implement remove from test plan functionality
      setIsMenuOpen(false);
    };

    const handleOpenInLibraryClick = () => {
      // TODO: Implement open in library functionality
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

    // TODO: Replace with actual breadcrumb data when available in testPlan DTO
    const breadcrumbPath = ['Regression Weekly A-team', 'Checkout flow'];

    const titleComponent = (
      <div className={cx('test-plan-title')}>
        <PriorityIcon priority="unspecified" className={cx('priority-icon')} />
        <span>{testPlan.name}</span>
      </div>
    );

    const descriptionComponent = (
      <div className={cx('description-wrapper')}>
        <PathBreadcrumb
          path={breadcrumbPath}
          color="var(--rp-ui-base-e-400)"
          isIconVisible={false}
        />
        <div className={cx('header-meta')}>
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
              <span className={cx('meta-value')}>
                {/* TODO: Add actual duration when available in testPlan DTO */}
                16 min
              </span>
            </div>
          </div>
        </div>
      </div>
    );

    const contentComponent = (
      <div className={cx('content')}>
        <CollapsibleSection
          title={formatMessage(messages.testCasesTitle)}
          defaultMessage={formatMessage(commonMessages.descriptionNotSpecified)}
        >
          {/* TODO: Add test cases content */}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(messages.testPlanInformationTitle)}
          defaultMessage={formatMessage(commonMessages.descriptionNotSpecified)}
        >
          {/* TODO: Add test plan information content */}
        </CollapsibleSection>
        <CollapsibleSection
          title={formatMessage(messages.attributesTitle)}
          defaultMessage={formatMessage(messages.noAttributesAdded)}
        >
          {/* TODO: Add attributes content */}
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
            aria-label={formatMessage(messages.moreActionsTooltip)}
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
            <CoveredManuallyIcon />
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
