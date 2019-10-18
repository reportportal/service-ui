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
import track from 'react-tracking';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './inputBigSwitcher.scss';

const cx = classNames.bind(styles);
@track()
export class InputBigSwitcher extends Component {
  static propTypes = {
    children: PropTypes.node,
    value: PropTypes.bool,
    mobileDisabled: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onChangeEventInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    title: PropTypes.string,
  };

  static defaultProps = {
    children: '',
    value: false,
    mobileDisabled: false,
    disabled: false,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onChangeEventInfo: {},
    title: '',
  };
  render() {
    const {
      mobileDisabled,
      onChangeEventInfo,
      tracking,
      onChange,
      disabled,
      onFocus,
      onBlur,
      children,
      value,
      title,
    } = this.props;
    const classes = cx({
      'switcher-wrapper': true,
      'mobile-disabled': mobileDisabled,
      disabled,
    });
    const sliderClasses = cx({
      slider: true,
      'turned-on': !!value,
    });
    const handlerOnChange = (e) => {
      onChange(e.target.checked);
      onChangeEventInfo && tracking.trackEvent(onChangeEventInfo);
    };
    return (
      // eslint-disable-next-line
      <label className={cx('input-big-switcher')} tabIndex="1">
        <div className={classes} title={title}>
          <div className={cx('on')}>
            <FormattedMessage id={'Common.on'} defaultMessage={'ON'} />
          </div>
          <div className={cx('off')}>
            <FormattedMessage id={'Common.off'} defaultMessage={'OFF'} />
          </div>
          <input
            className={cx('input')}
            type="checkbox"
            checked={value}
            disabled={disabled}
            onFocus={onFocus}
            onChange={handlerOnChange}
            onBlur={onBlur}
          />
          <div className={sliderClasses} />
        </div>
        {children && <span className={cx('children-container')}>{children}</span>}
      </label>
    );
  }
}
