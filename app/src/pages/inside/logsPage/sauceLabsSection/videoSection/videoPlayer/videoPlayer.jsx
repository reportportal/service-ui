import React from 'react';
import classNames from 'classnames/bind';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import styles from './videoPlayer.scss';

const cx = classNames.bind(styles);

export class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.videoNode = React.createRef();
  }

  componentDidMount() {
    this.player = videojs(this.videoNode.current, this.props);
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  setCurrentTime = (time) => this.player.currentTime(time);

  render() {
    return (
      <div className={cx('video-player')}>
        <div data-vjs-player>
          {/* eslint-disable jsx-a11y/media-has-caption */}
          <video
            ref={this.videoNode}
            className="video-js vjs_video_1-dimensions vjs-controls-enabled vjs-workinghover vjs-v7"
          />
        </div>
      </div>
    );
  }
}
