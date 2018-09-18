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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './containerWithTabs.scss';

const cx = classNames.bind(styles);

@track()
export class ContainerWithTabs extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    selectTabEventInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    customClass: PropTypes.string,
    active: PropTypes.number,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    data: [],
    selectTabEventInfo: null,
    customClass: '',
    active: 0,
    onChange: () => {},
  };

  tabClickHandler = (e) => {
    const id = +e.currentTarget.dataset.id;
    this.selectTabTracking(id);
    if (this.props.active !== id) {
      this.props.onChange(id);
    }
  };

  selectTabTracking = (id) => {
    if (this.props.selectTabEventInfo) {
      this.props.tracking.trackEvent(this.props.selectTabEventInfo);
    } else if (this.props.data[id].eventInfo) {
      this.props.tracking.trackEvent(this.props.data[id].eventInfo);
    }
  };

  render() {
    const { data, active } = this.props;
    return (
      <div className={cx('container-with-tabs')}>
        <div className={cx('tabs-wrapper', this.props.customClass)}>
          {data.length
            ? data.map((item, id) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={id}
                  data-id={id}
                  className={cx('tab', { active: active === id })}
                  onClick={this.tabClickHandler}
                >
                  {item.name}
                  {item.removable && (
                    <span className={cx('remove-button')} onClick={item.onRemove}>
                      {Parser(CrossIcon)}
                    </span>
                  )}
                </div>
              ))
            : null}
        </div>
        <div className={cx('content-wrapper')}>{data.length ? data[active].content : null}</div>
      </div>
    );
  }
}
