/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
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
        <div className={classes}>
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
