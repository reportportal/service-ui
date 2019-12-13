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

import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { screenLockVisibilitySelector } from 'controllers/screenLock';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import styles from './screenLock.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  visible: screenLockVisibilitySelector(state),
}))
export class ScreenLock extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
  };
  screenLockRoot = document.getElementById('screen-lock-root');
  render() {
    return (
      <Fragment>
        {this.props.visible &&
          ReactDOM.createPortal(
            <div className={cx('screen-lock')}>
              <div className={cx('backdrop')} />
              <SpinningPreloader />
            </div>,
            this.screenLockRoot,
          )}
      </Fragment>
    );
  }
}
