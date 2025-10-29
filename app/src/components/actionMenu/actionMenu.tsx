/*!
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

import { ReactNode } from 'react';
import { MeatballMenuIcon, Popover } from '@reportportal/ui-kit';
import { PopoverProps } from '@reportportal/ui-kit/dist/components/popover';
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';

import styles from './actionMenu.scss';

const cx = createClassnames(styles);

export interface ActionItem {
  label: string;
  onClick: () => void;
  hasPermission?: boolean;
  className?: string;
  danger?: boolean;
}

export interface LinkItem {
  label: string;
  to: string | object;
  hasPermission?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface ActionMenuProps extends Pick<PopoverProps, 'placement'> {
  links?: LinkItem[];
  actions?: ActionItem[];
  className?: string;
  contentClassName?: string;
  trigger?: ReactNode;
  showDivider?: boolean;
}

export const ActionMenu = ({
  placement = 'bottom-end',
  links = [],
  actions = [],
  className,
  contentClassName,
  trigger,
  showDivider = true,
}: ActionMenuProps): JSX.Element | null => {
  const hasLinks = links.some((link) => link.hasPermission !== false);
  const hasActions = actions.some((action) => action.hasPermission !== false);
  const hasAnyPermissions = hasLinks || hasActions;
  const shouldShowDivider = showDivider && hasLinks && hasActions;

  if (!hasAnyPermissions) {
    return null;
  }

  const renderLinks = () => {
    if (!links.length) return null;

    return (
      <>
        {links
          .filter(({ hasPermission = true }) => hasPermission)
          .map(({ label, to, className, onClick }) => (
            <Link key={label} to={to} className={cx('action-item', className)} onClick={onClick}>
              {label}
            </Link>
          ))}
      </>
    );
  };

  const renderActions = () => {
    if (!actions.length) return null;

    return (
      <>
        {actions
          .filter(({ hasPermission = true }) => hasPermission)
          .map(({ label, className, danger, onClick }) => (
            <button
              key={label}
              type="button"
              className={cx('action-item', className, {
                'danger-button': danger,
              })}
              onClick={onClick}
            >
              {label}
            </button>
          ))}
      </>
    );
  };

  return (
    <Popover
      placement={placement}
      content={
        <div className={cx('action-dropdown', contentClassName)}>
          {renderLinks()}
          {shouldShowDivider && <div className={cx('divider')} />}
          {renderActions()}
        </div>
      }
      className={cx('actions-popover', className)}
    >
      {trigger || <MeatballMenuIcon />}
    </Popover>
  );
};
