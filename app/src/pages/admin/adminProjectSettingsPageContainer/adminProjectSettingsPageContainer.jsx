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
import { PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { SETTINGS } from 'common/constants/projectSections';
import { SettingsPage } from 'pages/common/settingsPage';

export class AdminProjectSettingsPageContainer extends Component {
  static propTypes = {
    projectKey: PropTypes.string.isRequired,
    organizationSlug: PropTypes.string.isRequired,
  };

  createTabLink = (tabName) => {
    const { projectKey, organizationSlug } = this.props;

    return {
      type: PROJECT_DETAILS_PAGE,
      payload: {
        projectKey,
        projectSection: SETTINGS,
        settingsTab: tabName,
        organizationSlug,
      },
    };
  };
  render() {
    return <SettingsPage createTabLink={this.createTabLink} />;
  }
}