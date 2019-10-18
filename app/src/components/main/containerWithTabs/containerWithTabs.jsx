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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './containerWithTabs.scss';

const cx = classNames.bind(styles);

@track()
export class ContainerWithTabs extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    selectTabEventInfo: PropTypes.object,
    customClass: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    data: [],
    customClass: '',
    selectTabEventInfo: null,
  };

  state = {
    active: 0,
  };

  tabClickHandler = (e) => {
    const id = +e.currentTarget.dataset.id;
    this.selectTabTracking(id);
    if (this.state.active !== id) {
      this.setState({ active: id });
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
    return (
      <div className={cx('container-with-tabs')}>
        <div className={cx('tabs-wrapper', this.props.customClass)}>
          {this.props.data.length
            ? this.props.data.map((item, id) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={id}
                  data-id={id}
                  className={cx({ tab: true, active: this.state.active === id })}
                  onClick={this.tabClickHandler}
                >
                  {item.name}
                </div>
              ))
            : null}
        </div>
        <div className={cx('content-wrapper')}>
          {this.props.data.length ? this.props.data[this.state.active].content : null}
        </div>
      </div>
    );
  }
}
