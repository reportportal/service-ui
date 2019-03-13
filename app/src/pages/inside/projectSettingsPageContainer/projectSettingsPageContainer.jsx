import React, { Component } from 'react';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { PROJECT_SETTINGS_TAB_PAGE, projectIdSelector } from 'controllers/pages';
import { SETTINGS_PAGE } from 'components/main/analytics/events';
import { PageLayout, PageHeader } from 'layouts/pageLayout';
import { SettingsPage } from 'pages/common/settingsPage';

@connect((state) => ({
  projectId: projectIdSelector(state),
}))
@track({ page: SETTINGS_PAGE })
export class ProjectSettingsPageContainer extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
  };

  getBreadcrumbs = () => [
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
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <SettingsPage projectId={this.props.projectId} createTabLink={this.createTabLink} />
      </PageLayout>
    );
  }
}
