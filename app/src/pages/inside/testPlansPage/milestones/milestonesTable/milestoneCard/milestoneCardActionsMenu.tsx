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

import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, MeatballMenuIcon, Popover } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import { messages } from '../messages';

import type { MilestoneCardProps } from './types';

import styles from './milestoneCard.scss';

const cx = createClassnames(styles);

export const MilestoneCardActionsMenu = ({
  milestone,
  onEditMilestone,
  onDuplicateMilestone,
}: Pick<MilestoneCardProps, 'milestone' | 'onEditMilestone' | 'onDuplicateMilestone'>) => {
  const { formatMessage } = useIntl();
  const [isOpened, setIsOpened] = useState(false);

  const items = useMemo(
    () => [
      {
        label: formatMessage(messages.menuEditMilestone),
        onClick: () => {
          setIsOpened(false);
          onEditMilestone?.(milestone);
        },
      },
      {
        label: formatMessage(messages.menuCreateTestPlan),
        onClick: () => setIsOpened(false),
      },
      {
        label: formatMessage(messages.menuDuplicateMilestone),
        onClick: () => {
          setIsOpened(false);
          onDuplicateMilestone?.(milestone);
        },
      },
      {
        label: formatMessage(messages.menuDeleteMilestone),
        destructive: true,
        onClick: () => setIsOpened(false),
      },
    ],
    [formatMessage, milestone, onDuplicateMilestone, onEditMilestone],
  );

  return (
    <Popover
      className={cx('milestone-card__actions-popover')}
      content={
        <ul className={cx('milestone-card__actions-menu')}>
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={cx('milestone-card__actions-menu-item', {
                  'milestone-card__actions-menu-item_destructive': Boolean(item.destructive),
                })}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      }
      placement="bottom-end"
      isOpened={isOpened}
      setIsOpened={setIsOpened}
    >
      <Button
        variant="ghost"
        adjustWidthOn="content"
        className={cx('milestone-card__actions-trigger')}
        aria-expanded={isOpened}
        aria-haspopup="menu"
        aria-label={formatMessage(messages.milestoneActions)}
      >
        <MeatballMenuIcon />
      </Button>
    </Popover>
  );
};
