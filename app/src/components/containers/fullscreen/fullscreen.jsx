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
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import CancelIcon from 'common/img/cross-icon-inline.svg';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './fullscreen.scss';

const cx = classNames.bind(styles);

const EXIT_KEY = 'Escape';

const messages = defineMessages({
  exitNote: {
    id: 'Fullscreen.exitNote',
    defaultMessage: 'Press <b>Esc</b> to exit fullscreen mode',
  },
});

@injectIntl
export class Fullscreen extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    enabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    enabled: false,
    onChange: () => {},
  };

  componentDidMount() {
    document.addEventListener('keyup', this.detectExitKey);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.detectExitKey);
  }

  detectExitKey = (event) => {
    const key = event.key || event.keyCode;

    if (key === EXIT_KEY && this.props.enabled && this.props.onChange) {
      this.exitFullScreen(false);
    }
  };

  exitFullScreen = () => {
    this.props.onChange(false);
  };

  render() {
    return (
      <div className={cx('container', { fullscreen: this.props.enabled })}>
        {this.props.children}
        {this.props.enabled && (
          <Fragment>
            <i className={cx('icon-close')} onClick={this.exitFullScreen}>
              {Parser(CancelIcon)}
            </i>
            <div className={cx('exit-note')}>
              {Parser(this.props.intl.formatMessage(messages.exitNote))}
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
