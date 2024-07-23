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
import { injectIntl, defineMessages } from 'react-intl';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import track from 'react-tracking';
import { ADMIN_SERVER_SETTINGS_PAGE } from 'components/main/analytics/events';
import { ServerSettingsTabs } from './serverSettingsTabs';

const messages = defineMessages({
  pageTitle: {
    id: 'ServerSettingsPage.title',
    defaultMessage: 'Server settings',
  },
});

@injectIntl
@track({ page: ADMIN_SERVER_SETTINGS_PAGE })
export class ServerSettingsPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
  };

  getBreadcrumbs = () => [
    {
      title: this.props.intl.formatMessage(messages.pageTitle),
    },
  ];

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <ServerSettingsTabs />
        </PageSection>
      </PageLayout>
    );
  }
}
