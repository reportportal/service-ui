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
import classNames from 'classnames/bind';
import styles from './containerWithTabs.scss';

const cx = classNames.bind(styles);

export class ContainerWithTabs extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
  };
  static defaultProps = {
    data: [],
  };

  state = {
    active: 0,
  };

  tabClickHandler = (e) => {
    const id = +e.currentTarget.dataset.id;
    if (this.state.active !== id) {
      this.setState({ active: id });
    }
  };

  render() {
    return (
      <div className={cx('container-with-tabs')}>
        <div className={cx('tabs-wrapper')}>
          {
            this.props.data.length
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
              : null
          }
        </div>
        <div className={cx('content-wrapper')}>
          { this.props.data.length ? this.props.data[this.state.active].content : null }
        </div>
      </div>
    );
  }
}
