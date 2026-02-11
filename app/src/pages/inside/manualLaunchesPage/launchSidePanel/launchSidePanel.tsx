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
import { useDispatch } from 'react-redux';
import {
  Button,
  RerunIcon,
  UserIcon,
  LaunchTypeIcon,
  TestPlanIcon,
  SidePanel,
  BubblesLoader,
} from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { useOnClickOutside } from 'common/hooks';
import { CollapsibleSection } from 'components/collapsibleSection';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { formatTimestampForSidePanel } from 'pages/inside/common/testCaseList/utils';
import { MANUAL_LAUNCH_DETAILS_PAGE } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { commonMessages } from 'pages/inside/common/common-messages';
import { LaunchAttribute } from '../launchAttribute';
import { TestStatisticsChart } from '../testStatisticsChart';
import { useLaunchDetails } from './useLaunchDetails';
import { messages } from './messages';

import styles from './launchSidePanel.scss';

const cx = createClassnames(styles);

interface LaunchSidePanelProps {
  launchId: number | null;
  isVisible: boolean;
  onClose: () => void;
}

export const LaunchSidePanel = memo(({ launchId, isVisible, onClose }: LaunchSidePanelProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const { launchDetails, isLoading } = useLaunchDetails(launchId);

  useOnClickOutside(sidePanelRef, onClose);

  if (!launchDetails) {
    return null;
  }

  const handleEditLaunchClick = () => {
    // TODO: Implement edit launch functionality
  };

  const handleToRunClick = () => {
    // TODO: Implement to run functionality
  };

  const handleOpenDetailsClick = () => {
    if (launchId) {
      dispatch({
        type: MANUAL_LAUNCH_DETAILS_PAGE,
        payload: { organizationSlug, projectSlug, launchId: launchId.toString() },
      });
      onClose();
    }
  };

  const { total, passed, failed, skipped, toRun, inProgress } = launchDetails.executionStatistic;

  const { testPlan, owner, type, startTime } = launchDetails;

  const ownerInfo = owner?.name ?? owner?.email;

  const descriptionComponent = (
    <div className={cx('header-meta')}>
      <div className={cx('meta-row', 'meta-row-with-action')}>
        <div className={cx('meta-item-row')}>
          <LaunchTypeIcon className={cx('launch-type-icon')} />
          <span className={cx('meta-label')}>{formatMessage(messages.type)}:</span>
          <span className={cx('meta-value')}>{type}</span>
        </div>
      </div>
      <div className={cx('meta-row')}>
        <div className={cx('meta-item-row')}>
          <UserIcon />
          <span className={cx('meta-label')}>{formatMessage(messages.owner)}:</span>
          <span className={cx('meta-value')}>{ownerInfo}</span>
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
            <span className={cx('meta-value')}>{testPlan.name}</span>
          </div>
        </div>
      )}
    </div>
  );

  const contentComponent = (
    <div className={cx('content')}>
      <TestStatisticsChart
        total={total}
        passed={passed}
        failed={failed}
        skipped={skipped}
        inProgress={inProgress}
        toRun={toRun}
      />
      <CollapsibleSection
        title={formatMessage(commonMessages.description)}
        defaultMessage={formatMessage(commonMessages.descriptionNotSpecified)}
      >
        {launchDetails.description && (
          <ExpandedTextSection text={launchDetails.description} defaultVisibleLines={5} />
        )}
      </CollapsibleSection>
      <CollapsibleSection
        title={formatMessage(messages.attributesTitle)}
        defaultMessage={formatMessage(messages.noAttributesAdded)}
      >
        {!isEmpty(launchDetails.attributes) && (
          <div className={cx('attributes-list')}>
            {launchDetails.attributes.map((attr) => (
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
        variant="text"
        className={cx('action-button')}
        onClick={handleOpenDetailsClick}
        data-automation-id="launch-open-details"
      >
        {formatMessage(messages.openDetails)}
      </Button>
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
        disabled={toRun === 0}
        data-automation-id="launch-to-run"
      >
        {formatMessage(toRun ? messages.toRunWithCount : COMMON_LOCALE_KEYS.DONE, {
          testCount: toRun,
        })}
      </Button>
    </div>
  );

  return (
    <div ref={sidePanelRef} className={cx('launch-side-panel-wrapper')}>
      <SidePanel
        className={cx('launch-side-panel')}
        title={launchDetails.name}
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
});
