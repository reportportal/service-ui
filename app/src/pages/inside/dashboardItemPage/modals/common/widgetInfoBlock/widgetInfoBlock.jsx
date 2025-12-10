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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import { activeDashboardIdSelector } from 'controllers/pages';
import { fetch, debounce } from 'common/utils';
import { URLS } from 'common/urls';
import EmptyWidgetPreview from 'pages/inside/dashboardItemPage/modals/common/img/wdgt-undefined-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';
import { LinkComponent } from 'pages/inside/common/LinkComponent';
import { injectIntl } from 'react-intl';
import { WIDGETS_STATIC_PREVIEWS } from '../widgets';
import { WidgetPreview } from '../widgetPreview';
import styles from './widgetInfoBlock.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  dashboardId: activeDashboardIdSelector(state),
}))
@injectIntl
export class WidgetInfoBlock extends PureComponent {
  static propTypes = {
    projectKey: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object,
    activeWidget: PropTypes.object,
    customCondition: PropTypes.bool,
    dashboardId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    widgetSettings: {},
    activeWidget: {},
    customCondition: true,
  };

  state = {
    loading: false,
    widgetData: null,
  };

  componentDidUpdate(prevProps) {
    const { filterIds = [], contentParameters = { widgetOptions: {} } } = this.props.widgetSettings;

    if (prevProps.activeWidget.id !== this.props.activeWidget.id) {
      this.resetPrevWidgetData();
      return;
    }

    const prevData = {
      filterIds: prevProps.widgetSettings.filterIds,
      contentParameters: prevProps.widgetSettings.contentParameters,
    };

    const newData = {
      filterIds,
      contentParameters,
    };

    if (
      this.props.customCondition &&
      !isEqual(prevData, newData) &&
      (filterIds.length || contentParameters.widgetOptions?.launchNameFilter) &&
      !WIDGETS_STATIC_PREVIEWS[this.props.activeWidget.id]
    ) {
      this.fetchWidget(this.props.widgetSettings);
    }
  }

  getDefaultPreview = () =>
    this.props.activeWidget.id ? this.props.activeWidget.preview : Parser(EmptyWidgetPreview);

  resetPrevWidgetData = () =>
    this.setState({
      widgetData: null,
    });

  fetchWidget = debounce((widgetSettings) => {
    this.setState({
      loading: true,
      widgetData: null,
    });
    fetch(URLS.widgetPreview(this.props.projectKey), {
      method: 'post',
      data: widgetSettings,
    })
      .then((widget) => {
        this.setState({
          loading: false,
          widgetData: {
            content: widget,
            ...widgetSettings,
          },
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          widgetData: null,
        });
      });
  }, 300);

  render() {
    const {
      activeWidget,
      intl: { formatMessage },
      dashboardId,
    } = this.props;
    const { loading, widgetData } = this.state;

    return (
      <div className={cx('edit-widget-info-section')}>
        {activeWidget.id && (
          <div className={cx('widget-info-block')}>
            <div className={cx('widget-title')}>{activeWidget.title}</div>
            <div className={cx('widget-description')}>{activeWidget.description}</div>
            {activeWidget.documentationLink && (
              <LinkComponent
                to={activeWidget.documentationLink}
                icon={ExternalLinkIcon}
                event={activeWidget?.documentationClickEventInfo(dashboardId)}
              >
                <span className={cx('link')}>
                  {formatMessage(COMMON_LOCALE_KEYS.documentation)}
                </span>
              </LinkComponent>
            )}
          </div>
        )}
        <WidgetPreview
          defaultPreview={this.getDefaultPreview()}
          loading={loading}
          widgetType={activeWidget.id}
          data={widgetData}
        />
      </div>
    );
  }
}
