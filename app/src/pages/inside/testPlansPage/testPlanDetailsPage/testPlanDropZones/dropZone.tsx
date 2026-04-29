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

import { useDrop } from 'react-dnd';

import { createClassnames } from 'common/utils';
import { TEST_PLAN_DRAG_TYPES, DragItem } from 'pages/inside/common/testLibrarySidePanel/constants';

import styles from './testPlanDropZones.scss';

const cx = createClassnames(styles);

export type DropZoneVariant = 'add-launch' | 'add' | 'cancel';

interface DropZoneProps {
  variant: DropZoneVariant;
  title: string;
  subtitle: string;
  showIcon?: boolean;
  onDrop?: (item: DragItem, itemType: string | symbol | null) => void;
}

export const DropZone = ({ variant, title, subtitle, showIcon, onDrop }: DropZoneProps) => {
  const [{ isOver }, dropRef] = useDrop<DragItem, void, { isOver: boolean }>(
    () => ({
      accept: [...TEST_PLAN_DRAG_TYPES],
      drop: (item, monitor) => {
        onDrop?.(item, monitor.getItemType());
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [onDrop],
  );

  return (
    <div
      ref={dropRef}
      className={cx('test-plan-drop-zones__zone', `test-plan-drop-zones__zone--${variant}`, {
        'test-plan-drop-zones__zone--over': isOver,
      })}
    >
      <div className={cx('test-plan-drop-zones__content')}>
        {showIcon && (
          <span className={cx('test-plan-drop-zones__icon')}>
            <div className={cx('test-plan-drop-zones__icon-vertical')} />
            <div className={cx('test-plan-drop-zones__icon-horizontal')} />
          </span>
        )}
        <span className={cx('test-plan-drop-zones__title')}>{title}</span>
        <span className={cx('test-plan-drop-zones__hint')}>{subtitle}</span>
      </div>
    </div>
  );
};
