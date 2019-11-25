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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import styles from './videoPlayer.scss';

const cx = classNames.bind(styles);

export class VideoPlayer extends React.Component {
  static propTypes = {
    observer: PropTypes.object,
    onPlay: PropTypes.func,
  };

  static defaultProps = {
    observer: {},
    onPlay: () => {},
  };

  constructor(props) {
    super(props);
    this.videoNode = React.createRef();
  }

  componentDidMount() {
    this.player = videojs(this.videoNode.current, this.props);
    this.player.on('play', this.props.onPlay);
    this.props.observer.subscribe('goToVideoTimeline', this.updateCurrentTime);
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  setCurrentTime = (time) => {
    this.player.currentTime(time);
    this.player.pause();
  };

  updateCurrentTime = (time) => {
    if (this.player.hasStarted()) {
      this.setCurrentTime(time);
    } else {
      this.player.play().then(() => this.setCurrentTime(time));
    }
  };

  render() {
    return (
      <div className={cx('video-player')}>
        <div data-vjs-player>
          {/* eslint-disable jsx-a11y/media-has-caption */}
          <video
            ref={this.videoNode}
            className="video-js vjs_video_1-dimensions vjs-controls-enabled vjs-workinghover vjs-v7 vjs-default-skin"
          />
        </div>
      </div>
    );
  }
}
