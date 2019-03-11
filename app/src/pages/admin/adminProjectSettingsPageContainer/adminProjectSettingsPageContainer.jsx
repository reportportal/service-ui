import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { SETTINGS } from 'common/constants/projectSections';
import { SettingsPage } from 'pages/common/settingsPage';

export class AdminProjectSettingsPageContainer extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
  };

  createTabLink = (tabName) => ({
    type: PROJECT_DETAILS_PAGE,
    payload: { projectId: this.props.projectId, projectSection: SETTINGS, settingsTab: tabName },
  });

  render() {
    return <SettingsPage projectId={this.props.projectId} createTabLink={this.createTabLink} />;
  }
}
