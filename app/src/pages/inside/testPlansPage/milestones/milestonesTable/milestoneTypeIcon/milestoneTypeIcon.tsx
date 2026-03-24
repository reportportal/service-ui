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

import type { ComponentType, SVGProps } from 'react';

import { BoltIcon, CycleArrowsIcon, DiamondIcon, FlagIcon, RocketIcon } from '@reportportal/ui-kit';
import { MilestoneType, TmsMilestoneType } from 'controllers/milestone';

import { createClassnames } from 'common/utils';

import styles from './milestoneTypeIcon.scss';

const cx = createClassnames(styles);

const ICONS: Record<TmsMilestoneType, ComponentType<SVGProps<SVGSVGElement>>> = {
  [MilestoneType.RELEASE]: RocketIcon,
  [MilestoneType.SPRINT]: CycleArrowsIcon,
  [MilestoneType.PLAN]: FlagIcon,
  [MilestoneType.FEATURE]: BoltIcon,
  [MilestoneType.OTHER]: DiamondIcon,
};

export type MilestoneTypeIconPlacement = 'default' | 'toggle' | 'menu';

interface MilestoneTypeIconProps {
  type: TmsMilestoneType;
  placement?: MilestoneTypeIconPlacement;
}

export const MilestoneTypeIcon = ({ type, placement = 'default' }: MilestoneTypeIconProps) => {
  const Icon = ICONS[type];

  return (
    <span
      className={cx('milestone-type-icon', `milestone-type-icon--${type}`, {
        'milestone-type-icon--toggle': placement === 'toggle',
        'milestone-type-icon--menu': placement === 'menu',
      })}
      aria-hidden
    >
      <Icon />
    </span>
  );
};
