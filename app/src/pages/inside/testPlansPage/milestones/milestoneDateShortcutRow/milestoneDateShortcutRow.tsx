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

import { Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import styles from '../milestoneModals/createMilestoneModal/createMilestoneModal.scss';

import type { MilestoneDateShortcutRowProps } from './types';

export type { MilestoneDateShortcutItem, MilestoneDateShortcutRowProps } from './types';

const cx = createClassnames(styles);

export const MilestoneDateShortcutRow = ({ items, disabled }: MilestoneDateShortcutRowProps) => (
  <div className={cx('create-milestone-modal__date-shortcuts')}>
    {items.map((item) => (
      <Button
        key={item.id}
        type="button"
        variant="text"
        adjustWidthOn="content"
        className={cx('create-milestone-modal__date-shortcut')}
        disabled={disabled}
        onClick={item.onClick}
      >
        {item.label}
      </Button>
    ))}
  </div>
);
