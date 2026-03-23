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
import { MeatballMenuIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { PopoverControl, PopoverItem } from 'pages/common/popoverControl/popoverControl';

import { messages } from '../messages';

import styles from './milestoneCard.scss';

const cx = createClassnames(styles);

export const MilestoneCardActionsMenu = () => {
  const { formatMessage } = useIntl();
  const [isOpened, setIsOpened] = useState(false);

  const items: PopoverItem[] = useMemo(
    () => [
      {
        label: formatMessage(messages.menuEditMilestone),
        onClick: () => setIsOpened(false),
      },
      {
        label: formatMessage(messages.menuCreateTestPlan),
        onClick: () => setIsOpened(false),
      },
      {
        label: formatMessage(messages.menuDuplicateMilestone),
        onClick: () => setIsOpened(false),
      },
      {
        label: formatMessage(messages.menuDeleteMilestone),
        variant: 'destructive',
        onClick: () => setIsOpened(false),
      },
    ],
    [formatMessage],
  );

  return (
    <div
      className={cx('milestone-card__actions-wrap')}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <PopoverControl
        items={items}
        placement="bottom-end"
        isOpened={isOpened}
        setIsOpened={setIsOpened}
      >
        <button
          type="button"
          className={cx('milestone-card__actions-trigger')}
          aria-expanded={isOpened}
          aria-haspopup="menu"
          aria-label={formatMessage(messages.milestoneActions)}
        >
          <MeatballMenuIcon />
        </button>
      </PopoverControl>
    </div>
  );
};
