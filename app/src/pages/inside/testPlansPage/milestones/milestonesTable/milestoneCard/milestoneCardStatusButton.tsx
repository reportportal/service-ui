/*
 * Copyright 2026 EPAM Systems
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

import { useState, type MouseEvent } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { ChevronDownDropdownIcon, Popover } from '@reportportal/ui-kit';

import { MILESTONES_PAGE_EVENTS } from 'analyticsEvents/milestonesPageEvents';
import type { TmsMilestoneStatus } from 'controllers/milestone';
import { createClassnames } from 'common/utils';

import {
  getMilestoneStatusMessageDescriptor,
  getMilestoneStatusPopoverOptionMessageDescriptor,
} from '../../milestoneStatusMessages';
import {
  getMilestoneStatusChooseEventType,
  getMilestoneStatusPopoverOptions,
  milestoneStatusToCssModifier,
} from '../../milestoneStatus';

import type { MilestoneCardProps } from './types';

import styles from './milestoneCard.scss';

const cx = createClassnames(styles);

export const MilestoneCardStatusButton = ({
  milestone,
  onChangeMilestoneStatus,
}: MilestoneCardProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const [isOpened, setIsOpened] = useState(false);
  const statusModifier = milestoneStatusToCssModifier(milestone.status);
  const options = getMilestoneStatusPopoverOptions(milestone.status);

  const handleMilestoneStatusOptionClick = (
    event: MouseEvent<HTMLButtonElement>,
    targetStatus: TmsMilestoneStatus,
  ) => {
    event.stopPropagation();
    setIsOpened(false);

    if (targetStatus !== milestone.status) {
      trackEvent(
        MILESTONES_PAGE_EVENTS.chooseMilestoneStatus(
          getMilestoneStatusChooseEventType(targetStatus, milestone.status),
        ),
      );
    }
    onChangeMilestoneStatus?.(milestone, targetStatus);
  };

  return (
    <Popover
      className={cx('milestone-card__status-popover')}
      content={
        <div className={cx('milestone-card__status-options')}>
          {options.map((targetStatus) => (
            <button
              key={targetStatus}
              type="button"
              className={cx('milestone-card__status-option')}
              onClick={(e) => handleMilestoneStatusOptionClick(e, targetStatus)}
            >
              {formatMessage(
                getMilestoneStatusPopoverOptionMessageDescriptor(targetStatus, milestone.status),
              )}
            </button>
          ))}
        </div>
      }
      placement="bottom-end"
      isOpened={isOpened}
      setIsOpened={setIsOpened}
      isCentered={false}
    >
      <button
        type="button"
        className={cx(
          'milestone-card__status-toggle',
          `milestone-card__status-toggle_${statusModifier}`,
        )}
        aria-expanded={isOpened}
        aria-haspopup="listbox"
      >
        <span className={cx('milestone-card__status-toggle-label')}>
          {formatMessage(getMilestoneStatusMessageDescriptor(milestone.status))}
        </span>
        <span
          className={cx('milestone-card__status-chevron', {
            'milestone-card__status-chevron_open': isOpened,
          })}
        >
          <ChevronDownDropdownIcon />
        </span>
      </button>
    </Popover>
  );
};
