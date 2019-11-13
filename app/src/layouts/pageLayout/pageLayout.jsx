/*
 * Copyright 2019 EPAM Systems
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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './pageLayout.scss';
import { PageBreadcrumbs } from './pageBreadcrumbs';

const cx = classNames.bind(styles);

export const PageLayout = ({ children }) => <div className={cx('page-layout')}>{children}</div>;

PageLayout.propTypes = {
  children: PropTypes.node,
};
PageLayout.defaultProps = {
  children: null,
};

export const PageHeader = ({ children, breadcrumbs }) => (
  <div className={cx('page-header')}>
    <PageBreadcrumbs data={breadcrumbs} />
    <div className={cx('children-container')}>{children}</div>
  </div>
);
PageHeader.propTypes = {
  breadcrumbs: PropTypes.array,
  children: PropTypes.node,
};
PageHeader.defaultProps = {
  breadcrumbs: [],
  children: null,
};

export const PageSection = ({ children }) => <div className={cx('page-content')}>{children}</div>;
PageSection.propTypes = {
  children: PropTypes.node,
};
PageSection.defaultProps = {
  children: null,
};
