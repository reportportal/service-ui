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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDarkReasonable } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DownloadIcon from 'common/img/download-inline.svg';
import { DEFAULT_HIGHLIGHT_STYLE } from 'common/constants/hightLightStyle';
import { buildAssetLink } from '../utils';
import styles from './logsContent.scss';

const cx = classNames.bind(styles);

export class LogsContent extends Component {
  static propTypes = {
    logs: PropTypes.array,
    assets: PropTypes.object,
    authToken: PropTypes.string,
    isFullscreenMode: PropTypes.bool,
  };

  static defaultProps = {
    logs: [],
    assets: {},
    authToken: '',
    isFullscreenMode: false,
  };

  constructor(props) {
    super(props);
    const logPattern = /sauce-log/i;
    this.availableLogs = Object.keys(props.assets)
      .filter((key) => logPattern.exec(key))
      .map((item) => props.assets[item]);
  }

  getLogFileLink = () => {
    const {
      assets: { assetsPrefix },
      authToken,
    } = this.props;
    return buildAssetLink(assetsPrefix, this.availableLogs[0], authToken);
  };

  render() {
    const { logs, isFullscreenMode } = this.props;
    const content = JSON.stringify(logs, null, 4);

    return (
      <div className={cx('logs-content')}>
        <div className={cx('log-item-options')}>
          <span className={cx('log-name')}>{this.availableLogs[0]}</span>
          <a className={cx('download-item')} href={this.getLogFileLink()} target="_blank">
            {Parser(DownloadIcon)}
          </a>
        </div>
        <div className={cx('highlight-wrapper', { 'full-screen': isFullscreenMode })}>
          <SyntaxHighlighter
            language="json"
            style={atomOneDarkReasonable}
            customStyle={DEFAULT_HIGHLIGHT_STYLE}
            showLineNumbers
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}
