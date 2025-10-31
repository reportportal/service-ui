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
import { Button, CopyIcon } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { useOnClickOutside } from 'common/hooks';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { SegmentStatus, SegmentedStatusBar } from 'components/statusBar';

import { Launch } from '../types';
import { LaunchAttribute } from '../launchAttribute';
import { messages } from './messages';

import styles from './launchSidePanel.scss';
import { formatTimestampForSidePanel } from 'pages/inside/common/testCaseList/utils';

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

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(launch.id.toString());
  };

  const handleOpenDetailsClick = () => {
    // TODO: Implement open details functionality
  };

  const handleRunTestsClick = () => {
    // TODO: Implement run tests functionality
  };

  const handleRemoveAttribute = () => {
    // TODO: Implement remove attribute functionality
  };

  const totalTests = launch.statistics?.executions?.total ?? 0;
  const passedTests = launch.statistics?.executions?.passed ?? 0;
  const failedTests = launch.statistics?.executions?.failed ?? 0;
  const skippedTests = launch.statistics?.executions?.skipped ?? 0;

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
            aria-label={formatMessage(messages.closePanel)}
            data-automation-id="close-launch-panel"
          >
            {Parser(CrossIcon as unknown as string)}
          </button>
        </div>
        <div className={cx('header-meta')}>
          <div className={cx('meta-row')}>
            <div className={cx('meta-item-row', 'id-row')}>
              <span className={cx('meta-label')}>ID:</span>
              <span className={cx('meta-value')}>{launch.id}</span>
              <button
                type="button"
                className={cx('copy-button')}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleCopyId}
                aria-label={formatMessage(messages.copyId)}
                data-automation-id="copy-launch-id"
              >
                <CopyIcon />
              </button>
            </div>
            <div className={cx('meta-item-row')}>
              <span className={cx('meta-label')}>{formatMessage(messages.created)}:</span>
              <span className={cx('meta-value')}>
                {formatTimestampForSidePanel(launch.startTime)}
              </span>
            </div>
          </div>
          <div className={cx('meta-row')}>
            <div className={cx('meta-item-row')}>
              <span className={cx('meta-label')}>{formatMessage(messages.owner)}:</span>
              <span className={cx('meta-value')}>{launch.owner}</span>
            </div>
          </div>
        </div>
        {totalTests > 0 && (
          <div className={cx('status-bar-section')}>
            <SegmentedStatusBar
              data={[
                { status: SegmentStatus.Passed, value: passedTests },
                { status: SegmentStatus.Failed, value: failedTests },
                { status: SegmentStatus.Skipped, value: skippedTests },
              ]}
              className={cx('status-bar')}
            />
          </div>
        )}
      </div>
      <div className={cx('content')}>
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
        <CollapsibleSection
          title={formatMessage(messages.descriptionTitle)}
          defaultMessage={formatMessage(messages.descriptionNotSpecified)}
        >
          {launch.description && (
            <ExpandedTextSection text={launch.description} defaultVisibleLines={5} />
          )}
        </CollapsibleSection>
      </div>
      <div className={cx('footer')}>
        <Button
          variant="ghost"
          className={cx('action-button')}
          onClick={handleOpenDetailsClick}
          data-automation-id="launch-open-details"
        >
          {formatMessage(messages.openDetails)}
        </Button>
        <Button
          variant="primary"
          className={cx('action-button', 'last-button')}
          onClick={handleRunTestsClick}
          data-automation-id="launch-run-tests"
        >
          {formatMessage(messages.runTests)}
        </Button>
      </div>
    </div>
  );
});
