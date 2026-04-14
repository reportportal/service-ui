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

import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { Button, ChevronDownDropdownIcon, PlusIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { formatIsoDateShortDashed } from '../../milestoneDateUtils';
import {
  aggregateMilestoneCoverage,
  daysLeftUntil,
  milestoneTestPlansAsTestPlanDtos,
} from '../milestoneUtils';
import { MilestoneCardActionsMenu } from './milestoneCardActionsMenu';
import { MilestoneCardStatusButton } from './milestoneCardStatusButton';
import { MilestoneTypeIcon } from '../milestoneTypeIcon';
import { TestPlansTable } from '../../../testPlansTable';
import { useCreateTestPlanModal } from '../../../testPlanModals';
import { messages } from '../messages';

import type { MilestoneCardProps } from './types';

import styles from './milestoneCard.scss';

const cx = createClassnames(styles);

export const MilestoneCard = ({
  milestone,
  onEditMilestone,
  onDuplicateMilestone,
  onChangeMilestoneStatus,
}: MilestoneCardProps) => {
  const { formatMessage } = useIntl();
  const [expanded, setExpanded] = useState(false);
  const { canManageTestPlans } = useUserPermissions();
  const { openModal: openCreateTestPlanModal } = useCreateTestPlanModal();
  const handleMenuCreateTestPlan = useCallback(
    (m: MilestoneCardProps['milestone']) => openCreateTestPlanModal({ milestoneId: m.id }),
    [openCreateTestPlanModal],
  );
  const { coveredPct, plansCount } = aggregateMilestoneCoverage(milestone);
  const daysLeft = daysLeftUntil(milestone.endDate);

  const dateRange = `${formatIsoDateShortDashed(milestone.startDate)} — ${formatIsoDateShortDashed(milestone.endDate)}`;

  const testPlanRows = useMemo(
    () => milestoneTestPlansAsTestPlanDtos(milestone.testPlans, milestone.id),
    [milestone.id, milestone.testPlans],
  );

  const toggleExpanded = () => setExpanded((v) => !v);

  return (
    <div className={cx('milestone-card__group')}>
      <div className={cx('milestone-card')}>
        <div className={cx('milestone-card__header')}>
          <button
            type="button"
            className={cx('milestone-card__header-toggle')}
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={formatMessage(messages.expandMilestone, { name: milestone.name })}
          >
            <span
              className={cx('milestone-card__chevron', {
                'milestone-card__chevron_open': expanded,
              })}
            >
              <ChevronDownDropdownIcon />
            </span>
            <MilestoneTypeIcon type={milestone.type} placement="card" />
            <div className={cx('milestone-card__title-block')}>
              <div className={cx('milestone-card__name')}>{milestone.name}</div>
              <div className={cx('milestone-card__dates')}>{dateRange}</div>
            </div>
            <div className={cx('milestone-card__metrics')}>
              <div className={cx('milestone-card__metric')}>
                <span className={cx('milestone-card__metric-value')}>{coveredPct}%</span>
                <span className={cx('milestone-card__metric-label')}>
                  {formatMessage(messages.coveredLabel)}
                </span>
              </div>
              <div className={cx('milestone-card__metric')}>
                <span className={cx('milestone-card__metric-value')}>{daysLeft}</span>
                <span className={cx('milestone-card__metric-label')}>
                  {formatMessage(messages.daysLeftLabel)}
                </span>
              </div>
              <div className={cx('milestone-card__metric')}>
                <span
                  className={cx('milestone-card__metric-value', {
                    'milestone-card__metric-value_alert': plansCount <= 0,
                  })}
                >
                  {plansCount}
                </span>
                <span className={cx('milestone-card__metric-label')}>
                  {formatMessage(messages.plansLabel)}
                </span>
              </div>
            </div>
          </button>
          <div className={cx('milestone-card__header-actions')}>
            <MilestoneCardStatusButton
              onChangeMilestoneStatus={onChangeMilestoneStatus}
              milestone={milestone}
            />
            <MilestoneCardActionsMenu
              milestone={milestone}
              onEditMilestone={onEditMilestone}
              onDuplicateMilestone={onDuplicateMilestone}
              onCreateTestPlan={canManageTestPlans ? handleMenuCreateTestPlan : undefined}
            />
          </div>
        </div>
      </div>
      {expanded && (
        <div
          className={cx('milestone-card__drawer', {
            'milestone-card__drawer_empty': isEmpty(testPlanRows),
          })}
        >
          {isEmpty(testPlanRows) ? (
            <div className={cx('milestone-card__test-plans-empty-bar-wrap')}>
              <div className={cx('milestone-card__test-plans-empty-bar')}>
                <p className={cx('milestone-card__test-plans-empty-text')}>
                  {formatMessage(messages.noTestPlansInMilestone)}
                </p>
                {canManageTestPlans && (
                  <Button
                    variant="primary"
                    onClick={() => openCreateTestPlanModal({ milestoneId: milestone.id })}
                  >
                    {formatMessage(messages.createTestPlanUnderMilestone)}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={cx('milestone-card__test-plans')}>
                <TestPlansTable testPlans={testPlanRows} isLoading={false} />
              </div>
              {canManageTestPlans && (
                <div className={cx('milestone-card__test-plans-footer')}>
                  <Button
                    variant="text"
                    adjustWidthOn="content"
                    icon={<PlusIcon />}
                    onClick={() => openCreateTestPlanModal({ milestoneId: milestone.id })}
                  >
                    {formatMessage(messages.createTestPlanUnderMilestone)}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
