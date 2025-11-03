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
import Parser from 'html-react-parser';
import { Button, RerunIcon, OwnerIcon, LaunchTypeIcon, TestPlanIcon } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { useOnClickOutside } from 'common/hooks';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { formatTimestampForSidePanel } from 'pages/inside/common/testCaseList/utils';

import { commonMessages } from 'pages/inside/common/common-messages';
import { Launch } from '../types';
import { LaunchAttribute } from '../launchAttribute';
import { TestStatisticsChart } from '../testStatisticsChart';
import { getLaunchStatistics } from '../useManualLaunches';
import { messages } from './messages';

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

  if (!isVisible || !launch) {
    return null;
  }

  const handleEditLaunchClick = () => {
    // TODO: Implement edit launch functionality
  };

  const handleToRunClick = () => {
    // TODO: Implement to run functionality
  };

  const handleRemoveAttribute = () => {
    // TODO: Implement remove attribute functionality
  };

  const { totalTests, passedTests, failedTests, skippedTests, testsToRun, inProgressTests } =
    getLaunchStatistics(launch);

  return (
    <div ref={sidePanelRef} className={cx('launch-side-panel')}>
      <div className={cx('header')}>
        <div className={cx('header-top')}>
          <div className={cx('launch-name')}>
            <span className={cx('launch-title')}>{launch.name}</span>
          </div>
          <button
            type="button"
            className={cx('close-button')}
            onClick={onClose}
            aria-label={formatMessage(commonMessages.closePanel)}
            data-automation-id="close-launch-panel"
          >
            {Parser(CrossIcon as unknown as string)}
          </button>
        </div>
        <div className={cx('header-meta')}>
          <div className={cx('meta-row', 'meta-row-with-action')}>
            <div className={cx('meta-item-row')}>
              <LaunchTypeIcon className={cx('launch-type-icon')} />
              <span className={cx('meta-label')}>{formatMessage(messages.type)}:</span>
              <span className={cx('meta-value')}>{launch.mode}</span>
            </div>
          </div>
          <div className={cx('meta-row')}>
            <div className={cx('meta-item-row')}>
              <OwnerIcon />
              <span className={cx('meta-label')}>{formatMessage(messages.owner)}:</span>
              <span className={cx('meta-value')}>{launch.owner}</span>
            </div>
          </div>
          <div className={cx('meta-row')}>
            <div className={cx('meta-item-row')}>
              <RerunIcon />
              <span className={cx('meta-label')}>{formatMessage(messages.created)}:</span>
              <span className={cx('meta-value')}>
                {formatTimestampForSidePanel(launch.startTime)}
              </span>
            </div>
          </div>
          <div className={cx('meta-row')}>
            <div className={cx('meta-item-row')}>
              <TestPlanIcon />
              <span className={cx('meta-label')}>{formatMessage(messages.testPlan)}:</span>
              <span className={cx('meta-value')}>-</span>
            </div>
          </div>
          <div className={cx('statistics-section')}>
            <TestStatisticsChart
              total={totalTests}
              passed={passedTests}
              failed={failedTests}
              skipped={skippedTests}
              inProgress={inProgressTests}
              toRun={testsToRun}
            />
          </div>
        </div>
      </div>
      <div className={cx('content')}>
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
                  onRemove={() => handleRemoveAttribute()}
                />
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>
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
          data-automation-id="launch-to-run"
        >
          {formatMessage(messages.toRunWithCount, { testCount: testsToRun })}
        </Button>
      </div>
    </div>
  );
});
