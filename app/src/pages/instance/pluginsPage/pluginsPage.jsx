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
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { pluginsSelector } from 'controllers/plugins';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { PLUGINS_PAGE } from 'components/main/analytics/events';
import { PluginsTabs } from './pluginsTabs';

const messages = defineMessages({
  pageTitle: {
    id: 'PluginsPage.title',
    defaultMessage: 'Plugins',
  },
});

@connect((state) => ({
  plugins: pluginsSelector(state),
}))
@track({ page: PLUGINS_PAGE })
@injectIntl
export class PluginsPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    plugins: PropTypes.array.isRequired,
  };

  getFilterItems = () => [...new Set(this.props.plugins.map((item) => item.groupType))];

  breadcrumbs = [
    {
      title: this.props.intl.formatMessage(messages.pageTitle),
    },
  ];

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.breadcrumbs} />
        <PageSection>
          <PluginsTabs plugins={this.props.plugins} filterItems={this.getFilterItems()} />
        </PageSection>
      </PageLayout>
    );
  }
}
