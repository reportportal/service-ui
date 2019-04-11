import React, { Component } from 'react';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';
import { getDuration } from 'common/utils';
import CalendarIcon from 'common/img/calendar-icon-inline.svg';
import TimeIcon from 'common/img/time-icon-inline.svg';
import { jobInfoSelector, sauceLabsAuthTokenSelector } from 'controllers/log/sauceLabs';
import { VideoPlayer } from './videoPlayer';
import styles from './videoSection.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  jobInfo: jobInfoSelector(state),
  authToken: sauceLabsAuthTokenSelector(state),
}))
export class VideoSection extends Component {
  static propTypes = {
    jobInfo: PropTypes.object,
    authToken: PropTypes.string,
    observer: PropTypes.object,
  };

  static defaultProps = {
    jobInfo: {},
    authToken: '',
    observer: {},
  };

  getVideoOptions = () => ({
    controls: true,
    inactivityTimeout: 2000,
    liveui: true,
    poster: 'https://cdn1.saucelabs.com/web-ui/images/assets/70c6f06fe089b68f008ac6bc9aff8b8a.png',
    sources: [
      {
        src: `${this.props.jobInfo.video_url}?auth=${this.props.authToken}`,
        type: 'video/mp4',
      },
    ],
  });

  getVideoDuration = () =>
    getDuration(this.props.jobInfo.start_time * 1000, this.props.jobInfo.end_time * 1000, true);

  getFormattedDate = (data) => moment.unix(data).format('MMMM DD, Y [at] HH:mm:ss ');

  render() {
    const { jobInfo, observer } = this.props;

    return (
      <div className={cx('video-section')}>
        <div className={cx('section-header')}>
          <div className={cx('session-name')}>{jobInfo.name}</div>
          <div className={cx('full-screen-button')} />
        </div>
        <div className={cx('section-content')}>
          <VideoPlayer observer={observer} {...this.getVideoOptions()} />
        </div>
        <div className={cx('section-info')}>
          <div className={cx('info-item')}>
            {Parser(CalendarIcon)}
            {this.getFormattedDate(jobInfo.start_time)}
          </div>
          <div className={cx('info-item')}>
            {Parser(TimeIcon)}
            {this.getVideoDuration()}
          </div>
          <div className={cx('info-item')}>{jobInfo.os}</div>
          <div className={cx('info-item')}>{jobInfo.browser}</div>
        </div>
      </div>
    );
  }
}
