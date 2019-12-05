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
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { statusPageWidgets, activityItem } from './statusPageWidgets';
import { StatusPageItem } from './statusPageItem';
import styles from './statusPageContent.scss';

const cx = classNames.bind(styles);

@injectIntl
export class StatusPageContent extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    interval: PropTypes.string,
  };

  static defaultProps = {
    interval: '',
  };

  state = {
    widgetsData: {},
    loading: true,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.interval !== this.props.interval ||
      prevProps.projectId !== this.props.projectId
    ) {
      this.fetchData();
    }
  }

  fetchData = () => {
    const { projectId, interval } = this.props;
    this.setState({
      loading: true,
    });
    const widgetsWithUrls = [...statusPageWidgets.filter((item) => item.getUrl), activityItem];

    Promise.all(widgetsWithUrls.map((item) => fetch(item.getUrl(projectId, interval))))
      .then((responses) => {
        const widgetsData = widgetsWithUrls.reduce(
          (acc, item, index) => ({
            ...acc,
            [item.id]: responses[index],
          }),
          {},
        );
        this.setState({
          widgetsData,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          widgetsData: {},
          loading: false,
        });
      });
  };

  renderWidget = (widgetData) => {
    const widget = this.state.widgetsData[widgetData.source];
    return (
      <StatusPageItem title={this.props.intl.formatMessage(widgetData.title)}>
        {this.state.loading ? (
          <div className={cx('status-page-spinner-wrapper')}>
            <SpinningPreloader />
          </div>
        ) : (
          widget && widgetData.component(widget, this.props.interval)
        )}
      </StatusPageItem>
    );
  };

  render() {
    return (
      <div className={cx('status-page-content')}>
        <div className={cx('status-items-block')}>
          {statusPageWidgets.map((item) => (
            <div key={item.id} className={cx('status-item-wrapper')}>
              {this.renderWidget(item)}
            </div>
          ))}
        </div>
        <div className={cx('activity-block')}>{this.renderWidget(activityItem)}</div>
      </div>
    );
  }
}
