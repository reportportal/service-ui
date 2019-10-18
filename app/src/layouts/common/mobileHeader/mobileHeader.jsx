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
