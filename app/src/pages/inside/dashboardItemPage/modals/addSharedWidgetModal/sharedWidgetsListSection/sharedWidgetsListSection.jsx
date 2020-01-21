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
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { URLS } from 'common/urls';
import { fetch, debounce } from 'common/utils';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { WidgetsList } from './widgetsList';
import { SharedWidgetsSearch } from './sharedWidgetsSearch';
import styles from './sharedWidgetsListSection.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  widgetsListHeader: {
    id: 'SharedWidgetsListSection.widgetsListHeader',
    defaultMessage: 'Select shared widget',
  },
});

@injectIntl
@track()
export class SharedWidgetsListSection extends Component {
  static propTypes = {
    intl: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    currentDashboard: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    selectedWidget: PropTypes.object,
    onSelectWidget: PropTypes.func,
    scrollWidgetsEvents: PropTypes.object,
  };

  static defaultProps = {
    intl: {},
    selectedWidget: null,
    onSelectWidget: () => {},
    scrollWidgetsEvents: null,
  };

  state = {
    page: 1,
    size: 10,
    searchValue: false,
    loading: true,
    widgets: [],
    pagination: {},
  };

  componentDidMount() {
    this.handleSearchValueChange();
  }

  markAlreadyAddedWidgets = (widgets) => {
    const dashboardWidgets = this.props.currentDashboard.widgets || [];

    return widgets.map((item) => {
      const currentInDashboardWidgetsIndex = dashboardWidgets.findIndex(
        (dashboardWidget) => dashboardWidget.widgetId === item.id,
      );
      return currentInDashboardWidgetsIndex === -1
        ? item
        : {
            ...item,
            alreadyAdded: true,
          };
    });
  };

  fetchWidgetsConcatAction = ({ params, concat }) => {
    const url = params.term
      ? URLS.sharedWidgetSearch(this.props.projectId, params)
      : URLS.sharedWidget(this.props.projectId, params);

    this.setState({
      loading: true,
    });

    fetch(url)
      .then(({ content, page }) => {
        const widgets = concat ? this.state.widgets.concat(content) : content;
        this.setState({
          loading: false,
          widgets: this.markAlreadyAddedWidgets(widgets),
          pagination: page,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  fetchWidgets = ({ page, size, searchValue }) => {
    const { size: stateSize, page: statePage } = this.state;
    const params = {
      [PAGE_KEY]: page || statePage,
      [SIZE_KEY]: size || stateSize,
    };
    const concat = page > 1;

    if (searchValue) {
      params.term = searchValue;
    }

    this.fetchWidgetsConcatAction({ params, concat });
    this.setState({ page: page + 1, searchValue });
  };

  handleWidgetsListLoad = () => {
    const {
      page,
      searchValue,
      widgets,
      loading,
      pagination: { totalElements, totalPages },
    } = this.state;

    if ((widgets.length >= totalElements && page >= totalPages) || loading) {
      return;
    }

    this.props.tracking.trackEvent(this.props.scrollWidgetsEvents);
    this.fetchWidgets({ page, searchValue });
  };

  handleSearchValueChange = debounce(
    (searchValue = '') => this.fetchWidgets({ page: 1, searchValue }),
    300,
  );

  render() {
    const {
      intl: { formatMessage },
      selectedWidget,
      onSelectWidget,
      scrollWidgetsEvents,
    } = this.props;
    const { searchValue, widgets, loading } = this.state;

    return (
      <div className={cx('shared-widgets-list-section')}>
        <h1 className={cx('widgets-list-title')}>{formatMessage(messages.widgetsListHeader)}</h1>
        <SharedWidgetsSearch value={searchValue} onFilterChange={this.handleSearchValueChange} />
        <WidgetsList
          widgets={widgets}
          activeId={selectedWidget ? selectedWidget.id : ''}
          onChange={onSelectWidget}
          loading={loading}
          onLazyLoad={this.handleWidgetsListLoad}
          noItemsMessage={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
          scrollWidgetsEvents={scrollWidgetsEvents}
        />
      </div>
    );
  }
}
