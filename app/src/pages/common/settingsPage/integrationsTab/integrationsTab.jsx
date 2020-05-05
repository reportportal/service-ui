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
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { getIntegrationItemClickEvent } from 'components/main/analytics/events';
import {
  IntegrationInfoContainer,
  IntegrationSettingsContainer,
} from 'components/integrations/containers';
import { showDefaultErrorNotification } from 'controllers/notification';
import { availableGroupedPluginsSelector } from 'controllers/plugins';
import { PLUGIN_NAME_TITLES } from 'components/integrations';
import { SimpleBreadcrumbs } from 'components/main/simpleBreadcrumbs';
import { IntegrationsList } from './integrationsList';
import {
  INTEGRATION_SUBPAGE,
  INTEGRATION_SETTINGS_SUBPAGE,
  SUB_PAGES_SEQUENCE,
  DEFAULT_BREADCRUMB,
} from './constants';
import styles from './integrationsTab.scss';

const cx = classNames.bind(styles);

@track()
@connect(
  (state) => ({
    availablePlugins: availableGroupedPluginsSelector(state),
  }),
  {
    showDefaultErrorNotification,
  },
)
export class IntegrationsTab extends Component {
  static propTypes = {
    showDefaultErrorNotification: PropTypes.func.isRequired,
    availablePlugins: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  state = {
    subPage: DEFAULT_BREADCRUMB,
  };

  getBreadcrumbs = () => {
    const { subPage } = this.state;
    const breadcrumbs = [DEFAULT_BREADCRUMB];

    SUB_PAGES_SEQUENCE.some((pageType) => {
      const cachedPage = this.subPagesCache[pageType];
      const isLastPage = pageType === subPage.type;
      breadcrumbs.push(isLastPage ? subPage : cachedPage);

      return isLastPage;
    });
    return breadcrumbs;
  };

  getPageContent = () => {
    const { type, data, title } = this.state.subPage;

    switch (type) {
      case INTEGRATION_SUBPAGE:
        return (
          <IntegrationInfoContainer
            integrationType={data}
            onItemClick={(pageData, pageTitle) =>
              this.changeSubPage({
                type: INTEGRATION_SETTINGS_SUBPAGE,
                data: pageData,
                title: pageTitle,
              })
            }
          />
        );
      case INTEGRATION_SETTINGS_SUBPAGE:
        return (
          <IntegrationSettingsContainer
            data={data}
            title={title}
            goToPreviousPage={() => this.changeSubPage(this.subPagesCache[INTEGRATION_SUBPAGE])}
          />
        );
      default:
        return (
          <IntegrationsList
            onItemClick={(pageData) => {
              this.changeSubPage({
                type: INTEGRATION_SUBPAGE,
                data: pageData,
                title: PLUGIN_NAME_TITLES[pageData.name] || pageData.name,
              });
              this.props.tracking.trackEvent(getIntegrationItemClickEvent(pageData.name));
            }}
            availableIntegrations={this.props.availablePlugins}
          />
        );
    }
  };

  subPagesCache = {};

  changeSubPage = (subPage) => {
    this.subPagesCache[subPage.type] = subPage;
    this.setState({ subPage });
  };

  render() {
    const { subPage } = this.state;

    return (
      <div className={cx('integrations-tab')}>
        {subPage.type && (
          <SimpleBreadcrumbs descriptors={this.getBreadcrumbs()} onClickItem={this.changeSubPage} />
        )}
        {this.getPageContent()}
      </div>
    );
  }
}
