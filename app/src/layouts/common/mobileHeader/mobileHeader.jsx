/*
 * Copyright 2018 EPAM Systems
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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './mobileHeader.scss';

const cx = classNames.bind(styles);

export class MobileHeader extends PureComponent {
  static propTypes = {
    opened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
  };
  static defaultProps = {
    opened: false,
    toggleSideMenu: () => {},
  };

  render() {
    const { opened, toggleSideMenu } = this.props;
    return (
      <div className={cx('mobile-header')}>
        <div className={cx('hamburger', { opened })} onClick={toggleSideMenu}>
          <div className={cx('hamburger-part')} />
          <div className={cx('hamburger-part')} />
          <div className={cx('hamburger-part')} />
        </div>
        <div className={cx('rp-logo')} />
      </div>
    );
  }
}
