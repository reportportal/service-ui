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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { DashboardItem } from './dashboardItem';
import styles from './dashboardControl.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  dashboardControlTitle: {
    id: 'dashboardControl.title',
    defaultMessage: 'Save widget on dashboard',
  },
});

@injectIntl
export class DashboardControl extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    dashboards: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    value: PropTypes.object,
  };

  static defaultProps = {
    onChange: () => {},
    dashboards: [],
    value: {},
  };

  render() {
    const {
      intl: { formatMessage },
      dashboards,
      onChange,
      value,
    } = this.props;

    const newDashboards = [...dashboards];

    if (newDashboards.length === 0) {
      newDashboards.push(value);
    }

    return (
      <div className={cx('dashboardControl')}>
        <h5 className={cx('dashboardControl-title')}>
          {formatMessage(messages.dashboardControlTitle)}
        </h5>
        <div className={cx('dashboardControl-list')}>
          {newDashboards.map((dashboard, index) => {
            const active = value.id ? value.id === dashboard.id : index === 0;
            return (
              <DashboardItem
                key={dashboard.name}
                active={active}
                dashboard={dashboard}
                onClick={() => onChange(dashboard)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
