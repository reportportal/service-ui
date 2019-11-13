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
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';
import styles from './pageBreadcrumbs.scss';

const cx = classNames.bind(styles);
@track()
export class PageBreadcrumbs extends Component {
  static propTypes = {
    data: PropTypes.array,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    data: [],
  };
  render() {
    const { data, tracking } = this.props;
    return (
      <ul className={cx('page-breadcrumbs')}>
        {data.map(({ title, link, eventInfo }, i) => (
          <li key={title} className={cx('page-breadcrumbs-item')}>
            {i === data.length - 1 ? (
              <span title={title}>{title}</span>
            ) : (
              <NavLink
                to={link}
                onClick={() => tracking.trackEvent(eventInfo)}
                className={cx('page-breadcrumbs-link')}
              >
                {title}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    );
  }
}
