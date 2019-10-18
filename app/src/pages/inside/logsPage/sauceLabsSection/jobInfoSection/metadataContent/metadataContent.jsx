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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import DownloadIcon from 'common/img/download-inline.svg';
import { jobInfoSelector } from 'controllers/log/sauceLabs';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { buildAssetLink } from '../utils';
import { METADATA_FIELDS_CONFIG } from './constants';
import styles from './metadataContent.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  metadata: jobInfoSelector(state),
}))
export class MetadataContent extends Component {
  static propTypes = {
    metadata: PropTypes.object,
    assets: PropTypes.object,
    authToken: PropTypes.string,
    isFullscreenMode: PropTypes.bool,
  };

  static defaultProps = {
    metadata: {},
    assets: {},
    authToken: '',
    isFullscreenMode: false,
  };

  getScreenShotsCount = () => {
    const { screenshots = [] } = this.props.assets;
    return screenshots.length;
  };

  getScreenShotsLink = () => {
    const {
      assets: { assetsPrefix },
      authToken,
    } = this.props;
    return buildAssetLink(assetsPrefix, 'screenshots.zip', authToken);
  };

  getVideoLink = () => `${this.props.metadata.video_url}?auth=${this.props.authToken}`;

  render() {
    const { metadata, isFullscreenMode } = this.props;

    return (
      <div className={cx('metadata-content')}>
        <ScrollWrapper
          autoHeight
          autoHeightMax={isFullscreenMode ? '100%' : 558}
          hideTracksWhenNotNeeded
          autoHide
        >
          {METADATA_FIELDS_CONFIG.map(({ key, message, dataFormatter }) => (
            <div key={key} className={cx('content-row-item')}>
              <div className={cx('row-item-key')}>{message}</div>
              <div className={cx('row-item-value')}>{dataFormatter(metadata[key])}</div>
            </div>
          ))}
        </ScrollWrapper>
        <div className={cx('download-assets-block', { 'full-screen': isFullscreenMode })}>
          <a className={cx('assets-block-item')} href={this.getScreenShotsLink()} target="_blank">
            {`${this.getScreenShotsCount()} Screenshots`}
            {Parser(DownloadIcon)}
          </a>
          <a className={cx('assets-block-item')} href={this.getVideoLink()} target="_blank">
            1 Video
            {Parser(DownloadIcon)}
          </a>
        </div>
      </div>
    );
  }
}
