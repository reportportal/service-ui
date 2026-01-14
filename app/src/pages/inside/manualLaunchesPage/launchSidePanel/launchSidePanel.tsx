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

import { memo, useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  Button,
  RerunIcon,
  UserIcon,
  LaunchTypeIcon,
  TestPlanIcon,
  SidePanel,
} from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { useOnClickOutside } from 'common/hooks';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { formatTimestampForSidePanel } from 'pages/inside/common/testCaseList/utils';

import { commonMessages } from 'pages/inside/common/common-messages';
import { Launch } from '../types';
import { LaunchAttribute } from '../launchAttribute';
import { TestStatisticsChart } from '../testStatisticsChart';
import { getLaunchStatistics } from '../useManualLaunches';
import { messages } from './messages';
import { COMMON_LOCALE_KEYS } from '../../../../common/constants/localization';

import styles from './launchSidePanel.scss';

const cx = createClassnames(styles);

interface LaunchSidePanelProps {
  launch: Launch | null;
  isVisible: boolean;
  onClose: () => void;
}

export const LaunchSidePanel = memo(({ launch, isVisible, onClose }: LaunchSidePanelProps) => {
  const { formatMessage } = useIntl();
  const sidePanelRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(sidePanelRef, onClose);

  if (!launch) {
    return null;
  }

  const handleEditLaunchClick = () => {
    // TODO: Implement edit launch functionality
  };

  const handleToRunClick = () => {
    // TODO: Implement to run functionality
  };

  const { totalTests, passedTests, failedTests, skippedTests, testsToRun, inProgressTests } =
    getLaunchStatistics(launch);

  const { testPlan, owner, mode, startTime } = launch;

  const descriptionComponent = (
    <div className={cx('header-meta')}>
      <div className={cx('meta-row', 'meta-row-with-action')}>
        <div className={cx('meta-item-row')}>
          <LaunchTypeIcon className={cx('launch-type-icon')} />
          <span className={cx('meta-label')}>{formatMessage(messages.type)}:</span>
          <span className={cx('meta-value')}>{mode}</span>
        </div>
      </div>
      <div className={cx('meta-row')}>
        <div className={cx('meta-item-row')}>
          <UserIcon />
          <span className={cx('meta-label')}>{formatMessage(messages.owner)}:</span>
          <span className={cx('meta-value')}>{owner}</span>
        </div>
      </div>
      <div className={cx('meta-row')}>
        <div className={cx('meta-item-row')}>
          <RerunIcon />
          <span className={cx('meta-label')}>{formatMessage(messages.created)}:</span>
          <span className={cx('meta-value')}>{formatTimestampForSidePanel(startTime)}</span>
        </div>
      </div>
      {testPlan && (
        <div className={cx('meta-row')}>
          <div className={cx('meta-item-row')}>
            <TestPlanIcon />
            <span className={cx('meta-label')}>{formatMessage(messages.testPlan)}:</span>
            <span className={cx('meta-value')}>{testPlan}</span>
          </div>
        </div>
      )}
    </div>
  );

  const contentComponent = (
    <div className={cx('content')}>
      <TestStatisticsChart
        total={totalTests}
        passed={passedTests}
        failed={failedTests}
        skipped={skippedTests}
        inProgress={inProgressTests}
        toRun={testsToRun}
      />
      <CollapsibleSection
        title={formatMessage(commonMessages.description)}
        defaultMessage={formatMessage(commonMessages.descriptionNotSpecified)}
      >
        {launch.description && (
          <ExpandedTextSection text={launch.description} defaultVisibleLines={5} />
        )}
      </CollapsibleSection>
      <CollapsibleSection
        title={formatMessage(messages.attributesTitle)}
        defaultMessage={formatMessage(messages.noAttributesAdded)}
      >
        {!isEmpty(launch.attributes) && (
          <div className={cx('attributes-list')}>
            {launch.attributes.map((attr) => (
              <LaunchAttribute
                key={`${attr.key}-${attr.value}`}
                attributeKey={attr.key}
                value={attr.value}
              />
            ))}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );

  const footerComponent = (
    <div className={cx('footer')}>
      <Button
        variant="ghost"
        className={cx('action-button')}
        onClick={handleEditLaunchClick}
        data-automation-id="launch-edit-launch"
      >
        {formatMessage(messages.editLaunch)}
      </Button>
      <Button
        variant="primary"
        className={cx('action-button', 'last-button')}
        onClick={handleToRunClick}
        disabled={testsToRun === 0}
        data-automation-id="launch-to-run"
      >
        {formatMessage(testsToRun ? messages.toRunWithCount : COMMON_LOCALE_KEYS.DONE, {
          testCount: testsToRun,
        })}
      </Button>
    </div>
  );

  return (
    <div ref={sidePanelRef}>
      <SidePanel
        className={cx('launch-side-panel')}
        title={launch.name}
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
});
