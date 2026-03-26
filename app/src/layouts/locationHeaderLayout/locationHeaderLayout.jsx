/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Breadcrumbs } from '@reportportal/ui-kit';
import { NavLink } from 'components/main/navLink';
import styles from './locationHeaderLayout.scss';

const cx = classNames.bind(styles);

export const LocationHeaderLayout = ({ title, children, breadcrumbs, tree }) => {
  const isLastClickable = Boolean(breadcrumbs?.[breadcrumbs.length - 1]?.link);
  const isSingleItemClickable = tree?.length && isLastClickable;
  const shouldShowBreadcrumbs = breadcrumbs?.length || tree?.length;

  return (
    <div className={cx('location-header-container')}>
      {shouldShowBreadcrumbs && (
        <Breadcrumbs descriptors={breadcrumbs} tree={tree} LinkComponent={NavLink} className={cx('crumbs')} isLastClickable={isLastClickable} isSingleItemClickable={isSingleItemClickable} />
      )}
      <div className={cx('header')}>
        <span className={cx('title')}>{title}</span>
        {children}
      </div>
    </div>
  );
};



const breadcrumbItemShape = {
  title: PropTypes.string.isRequired,
  link: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.object,
  }),
};

const breadcrumbItemPropType = PropTypes.shape(breadcrumbItemShape);

const treeItemPropType = PropTypes.shape({
  ...breadcrumbItemShape,
  children: PropTypes.arrayOf(breadcrumbItemPropType),
});

LocationHeaderLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(breadcrumbItemPropType),
  tree: PropTypes.arrayOf(treeItemPropType),
};

LocationHeaderLayout.defaultProps = {
  children: null,
};
