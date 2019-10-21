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
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { PROJECT_SETTINGS_TAB_PAGE, projectIdSelector } from 'controllers/pages';
import { PageLayout, PageHeader } from 'layouts/pageLayout';
import { SettingsPage } from 'pages/common/settingsPage';

@connect((state) => ({
  projectId: projectIdSelector(state),
}))
export class ProjectSettingsPageContainer extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
  };

  breadcrumbs = [
    {
      title: <FormattedMessage id="SettingsPage.title" defaultMessage="Settings" />,
    },
  ];

  createTabLink = (tabName) => ({
    type: PROJECT_SETTINGS_TAB_PAGE,
    payload: { projectId: this.props.projectId, settingsTab: tabName },
  });

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.breadcrumbs} />
        <SettingsPage projectId={this.props.projectId} createTabLink={this.createTabLink} />
      </PageLayout>
    );
  }
}
