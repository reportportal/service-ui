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
  };

  static defaultProps = {
    observer: {},
  };

  constructor(props) {
    super(props);
    this.videoNode = React.createRef();
  }

  componentDidMount() {
    this.player = videojs(this.videoNode.current, this.props);
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
            className="video-js vjs_video_1-dimensions vjs-controls-enabled vjs-workinghover vjs-v7"
          />
        </div>
      </div>
    );
  }
}
