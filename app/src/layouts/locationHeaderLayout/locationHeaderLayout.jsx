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
import { UserPageLocationLevel } from 'layouts/locationHeaderLayout/userPageLocationLevel';
import { Breadcrumbs } from '@reportportal/ui-kit';
import { NavLink } from 'components/main/navLink';
import styles from './locationHeaderLayout.scss';


const cx = classNames.bind(styles);

export const LocationHeaderLayout = ({ title, children, breadcrumbs, treeView }) => {
  const isLastClickable = Boolean(breadcrumbs[breadcrumbs.length - 1].link);

  return (
    <div className={cx('location-header-container')}>
      {treeView 
        ? <UserPageLocationLevel descriptors={breadcrumbs} /> 
        : <Breadcrumbs descriptors={breadcrumbs} LinkComponent={NavLink} className={cx('crumbs')} isLastClickable={isLastClickable} />
      }
      <div className={cx('header')}>
        <span className={cx('title')}>{title}</span>
        {children}
      </div>
    </div>
  );
};

LocationHeaderLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.shape({
        type: PropTypes.string.isRequired,
        payload: PropTypes.object,
      }),
    })
  ),
  treeView: PropTypes.bool,
};

LocationHeaderLayout.defaultProps = {
  children: null,
  breadcrumbs: null,
  treeView: false,
};
