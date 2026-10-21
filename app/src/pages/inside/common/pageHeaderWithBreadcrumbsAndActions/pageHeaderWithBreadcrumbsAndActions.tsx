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

import { ReactNode } from 'react';
import { Breadcrumbs, useEllipsisTitle } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { useBreadCrumbsTree } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { NavLink } from 'components/main/navLink';

import styles from './pageHeaderWithBreadcrumbsAndActions.scss';

const cx = createClassnames(styles);

interface BreadcrumbDescriptor {
  id: string;
  title: string | ReactNode;
  onClick?: VoidFn;
}

interface PageHeaderWithBreadcrumbsAndActionsProps {
  title: ReactNode;
  breadcrumbDescriptors: BreadcrumbDescriptor[];
  titleAddon?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
  titleTailNumChars?: number;
}

export const PageHeaderWithBreadcrumbsAndActions = ({
  title,
  breadcrumbDescriptors = [],
  titleAddon,
  description,
  actions,
  actionsClassName,
  titleTailNumChars,
}: PageHeaderWithBreadcrumbsAndActionsProps) => {
  const breadcrumbsTree = useBreadCrumbsTree();
  const stringTitle = typeof title === 'string' ? title : undefined;
  const { ref: titleRef, title: ellipsisTitle } = useEllipsisTitle(stringTitle);

  // with a description the actions are aligned with it, otherwise with the title
  const actionsBlock = actions && (
    <div className={cx('page-header-with-breadcrumbs-and-actions__actions', actionsClassName)}>
      {actions}
    </div>
  );

  return (
    <header className={cx('page-header-with-breadcrumbs-and-actions')}>
      <div className={cx('page-header-with-breadcrumbs-and-actions__breadcrumb')}>
        <Breadcrumbs
          descriptors={breadcrumbDescriptors}
          tree={breadcrumbsTree}
          LinkComponent={NavLink}
          titleTailNumChars={titleTailNumChars}
        />
      </div>
      <div className={cx('page-header-with-breadcrumbs-and-actions__title-row')}>
        <div className={cx('page-header-with-breadcrumbs-and-actions__title-group')}>
          <h1
            ref={titleRef}
            title={ellipsisTitle}
            className={cx('page-header-with-breadcrumbs-and-actions__title')}
          >
            {title}
          </h1>
          {titleAddon}
        </div>
        {!description && actionsBlock}
      </div>
      {description && (
        <div className={cx('page-header-with-breadcrumbs-and-actions__description-row')}>
          <p className={cx('page-header-with-breadcrumbs-and-actions__description')}>
            {description}
          </p>
          {actionsBlock}
        </div>
      )}
    </header>
  );
};
