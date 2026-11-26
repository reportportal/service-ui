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
import { messages } from './messages';
import styles from './statusPageContent.scss';

const cx = classNames.bind(styles);

const getWidgetsWithUrls = () => [...statusPageWidgets.filter((item) => item.getUrl), activityItem];

const getLoadingSources = () =>
  getWidgetsWithUrls().reduce((acc, { id }) => ({ ...acc, [id]: true }), {});

@injectIntl
export class StatusPageContent extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    interval: PropTypes.string,
    projectKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    interval: '',
  };

  state = {
    widgetsData: {},
    failedSources: {},
    loadingSources: getLoadingSources(),
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.interval !== this.props.interval ||
      prevProps.projectKey !== this.props.projectKey
    ) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.latestRequestId += 1;
  }

  latestRequestId = 0;

  fetchData = () => {
    const { projectKey, interval } = this.props;
    this.latestRequestId += 1;
    const requestId = this.latestRequestId;
    this.setState({
      loadingSources: getLoadingSources(),
    });

    // Each source is shown as soon as its own request settles.
    const settleSource = (id, data, failed) => {
      // A newer interval/project (or unmount) superseded this request.
      if (requestId !== this.latestRequestId) {
        return;
      }
      this.setState(({ widgetsData, failedSources, loadingSources }) => ({
        widgetsData: failed ? widgetsData : { ...widgetsData, [id]: data },
        failedSources: { ...failedSources, [id]: failed },
        loadingSources: { ...loadingSources, [id]: false },
      }));
    };

    return Promise.all(
      getWidgetsWithUrls().map(({ id, getUrl }) =>
        fetch(getUrl(projectKey, interval)).then(
          (data) => settleSource(id, data, false),
          () => settleSource(id, undefined, true),
        ),
      ),
    );
  };

  renderWidgetContent = (widgetData) => {
    const { widgetsData, failedSources, loadingSources } = this.state;
    if (loadingSources[widgetData.source]) {
      return (
        <div className={cx('status-page-spinner-wrapper')}>
          <SpinningPreloader />
        </div>
      );
    }
    if (failedSources[widgetData.source]) {
      return (
        <div className={cx('status-page-error')}>
          {this.props.intl.formatMessage(messages.loadError)}
        </div>
      );
    }
    const widget = widgetsData[widgetData.source];
    return widget && widgetData.component(widget, this.props.interval);
  };

  renderWidget = (widgetData) => (
    <StatusPageItem title={this.props.intl.formatMessage(widgetData.title)}>
      {this.renderWidgetContent(widgetData)}
    </StatusPageItem>
  );

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
