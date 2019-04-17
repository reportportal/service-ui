/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './blockContainer.scss';

const cx = classNames.bind(styles);

export const BlockContainerHeader = ({ children }) => (
  <div className={cx('block-header')}>{children}</div>
);
BlockContainerHeader.propTypes = {
  children: PropTypes.node,
};

BlockContainerHeader.defaultProps = {
  children: null,
};

export const BlockContainerBody = ({ children }) => (
  <div className={cx('block-content')}>{children}</div>
);
BlockContainerBody.propTypes = {
  children: PropTypes.node,
};

BlockContainerBody.defaultProps = {
  children: null,
};
