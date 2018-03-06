import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { userInfoSelector } from 'controllers/user';
import { dateFormat, fromNowFormat, getStorageItem, setStorageItem } from 'common/utils';
import styles from './absRelTime.scss';

const cx = classNames.bind(styles);

// @connect(state => ({ //TODO uncomment
//   user: userInfoSelector(state),
// }))
export class AbsRelTime extends Component {
  static propTypes = {
    startTime: PropTypes.number,
    user: PropTypes.object.isRequired,
  };
  static defaultProps = {
    startTime: 0,
  };
  state = {
    isRelativeFormat: false,
  };
  componentWillMount() {
    const currentUserSettings = getStorageItem(`${this.props.user.userId}_settings`) || {};
    if (!currentUserSettings.startTimeFormat) {
      setStorageItem(
        `${this.props.user.userId}_settings`,
        { ...currentUserSettings, startTimeFormat: 'absolute' },
      );
    }
    if (currentUserSettings.startTimeFormat === 'relative') {
      this.setState({ isRelativeFormat: true });
    }
  }
  toggleFormat = () => {
    const currentUserSettings = getStorageItem(`${this.props.user.userId}_settings`) || {};
    this.setState({ isRelativeFormat: !this.state.isRelativeFormat });
    setStorageItem(
      `${this.props.user.userId}_settings`,
      { ...currentUserSettings, startTimeFormat: this.state.isRelativeFormat ? 'relative' : 'absolute' },
    );
  };
  render() {
    return (
      <div className={cx({ 'abs-rel-time': true, relative: this.state.isRelativeFormat })} onClick={this.toggleFormat}>
        <span className={cx('relative-time')}>
          { fromNowFormat(this.props.startTime) }
        </span>
        <span className={cx('absolute-time')}>
          { dateFormat(this.props.startTime) }
        </span>
      </div>
    );
  }
}
