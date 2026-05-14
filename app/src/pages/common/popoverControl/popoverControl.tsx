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

import { ComponentProps, ReactElement, ReactNode } from 'react';
import { compact } from 'es-toolkit';
import { isArray, isEmpty } from 'es-toolkit/compat';
import { Popover, Tooltip } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';

import styles from './popoverControl.scss';

const cx = createClassnames(styles);

export interface PopoverItem {
  label: string;
  icon?: ReactElement;
  /** @deprecated Consider defining a variant instead */
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  variant?: 'destructive' | 'danger' | 'text';
  onClick?: VoidFn;
}

const normalizeItemGroups = (items: PopoverItem[] | PopoverItem[][]): PopoverItem[][] => {
  if (isEmpty(items)) {
    return [[]];
  }

  return isArray(items[0]) ? (items as PopoverItem[][]) : [items as PopoverItem[]];
};

interface PopoverControlProps {
  items: PopoverItem[] | PopoverItem[][];
  placement?: ComponentProps<typeof Popover>['placement'];
  strategy?: ComponentProps<typeof Popover>['strategy'];
  shouldUsePortal?: ComponentProps<typeof Popover>['shouldUsePortal'];
  children?: ReactNode;
  isOpened?: boolean;
  setIsOpened?: (isOpened: boolean) => void;
}

export const PopoverControl = ({
  items,
  placement,
  strategy,
  shouldUsePortal,
  children,
  isOpened,
  setIsOpened,
}: PopoverControlProps) => {
  const renderItem = (item: PopoverItem, groupIndex: number, itemIndex: number) => {
    const { label, icon, className = '', variant, disabled, tooltip, onClick } = item;

    const buttonContent = (
      <>
        {icon} {label}
      </>
    );

    return (
      <li key={`popover-control-g${groupIndex}-i${itemIndex}-${label}`}>
        <button
          type="button"
          className={cx('popover-control__item-button', className, {
            [`popover-control__item-button--${variant}`]: Boolean(variant),
            'popover-control__item-button--disabled': Boolean(disabled),
          })}
          disabled={disabled}
          onClick={disabled ? undefined : onClick}
        >
          {tooltip ? (
            <Tooltip
              content={tooltip}
              placement="right"
              tooltipClassName={cx('popover-control__tooltip')}
            >
              {buttonContent}
            </Tooltip>
          ) : (
            buttonContent
          )}
        </button>
      </li>
    );
  };

  const renderGroup = (group: PopoverItem[], groupIndex: number) => {
    const divider =
      groupIndex > 0 ? (
        <li
          key={`popover-control-g${groupIndex}-divider`}
          className={cx('popover-control__divider')}
          role="presentation"
        />
      ) : null;

    return compact([
      divider,
      ...group.map((item, itemIndex) => renderItem(item, groupIndex, itemIndex)),
    ]);
  };

  const renderList = () =>
    normalizeItemGroups(items).flatMap((group, groupIndex) => renderGroup(group, groupIndex));

  return (
    <Popover
      className={cx('popover-control')}
      isOpened={isOpened}
      content={<ul>{renderList()}</ul>}
      placement={placement}
      strategy={strategy}
      shouldUsePortal={shouldUsePortal}
      setIsOpened={setIsOpened}
    >
      {children}
    </Popover>
  );
};
