import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import {
  PROJECTS_PAGE,
  PROJECT_DETAILS_PAGE,
  projectIdSelector,
  projectSectionSelector,
} from 'controllers/pages';
import { GhostButton } from 'components/buttons/ghostButton';
import AddProjectIcon from './img/add-project-inline.svg';
import ProjectUsersIcon from './img/project-users-inline.svg';
import ProjectSettingsIcon from './img/project-settings-inline.svg';
import ProjectEventsIcon from './img/project-events-inline.svg';

import styles from './projectsPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  pageTitle: {
    id: 'ProjectsPage.title',
    defaultMessage: 'All projects',
  },
  settingsTitle: {
    id: 'ProjectDetailsPageSettings.title',
    defaultMessage: 'Settings',
  },
  membersTitle: {
    id: 'ProjectDetailsPageMembers.title',
    defaultMessage: 'Members',
  },
  eventsTitle: {
    id: 'ProjectDetailsPageEvents.title',
    defaultMessage: 'Events',
  },
});

const HEADER_BUTTONS = [
  {
    key: 'members',
    text: 'Members',
    icon: ProjectUsersIcon,
  },
  {
    key: 'settings',
    text: 'Settings',
    icon: ProjectSettingsIcon,
  },
  {
    key: 'events',
    text: 'Events',
    icon: ProjectEventsIcon,
  },
];

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    section: projectSectionSelector(state),
  }),
  (dispatch) => ({
    dispatchRedirectToSection: (projectId, section) => {
      dispatch(
        rfrRedirect({
          type: PROJECT_DETAILS_PAGE,
          payload: { projectId, projectSection: section },
        }),
      );
    },
  }),
)
@injectIntl
export class ProjectsPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    section: PropTypes.string,
    projectId: PropTypes.string,
    dispatchRedirectToSection: PropTypes.func.isRequired,
  };

  static defaultProps = {
    section: undefined,
    projectId: undefined,
  };

  onHeaderButtonClick = (section) => () => {
    this.props.dispatchRedirectToSection(this.props.projectId, section);
  };

  getBreadcrumbs = () => {
    const { intl, projectId, section } = this.props;
    const breadcrumbs = [
      {
        title: intl.formatMessage(messages.pageTitle),
        link: {
          type: PROJECTS_PAGE,
        },
      },
    ];

    if (projectId) {
      breadcrumbs.push({
        title: projectId,
        link: {
          type: PROJECT_DETAILS_PAGE,
          payload: { projectId, projectSection: null },
        },
      });
    }

    if (section) {
      breadcrumbs.push({
        title: intl.formatMessage(messages[`${section}Title`]),
      });
    }

    return breadcrumbs;
  };

  renderHeaderButtons = () => {
    const { projectId, section } = this.props;

    if (!projectId) {
      return <GhostButton icon={AddProjectIcon}>Add New Project</GhostButton>;
    }

    return (
      <div className={cx('header-buttons')}>
        {HEADER_BUTTONS.map(({ key, text, icon }) => (
          <GhostButton
            key={key}
            disabled={section === key}
            icon={icon}
            onClick={this.onHeaderButtonClick(key)}
          >
            {text}
          </GhostButton>
        ))}
      </div>
    );
  };

  renderSection = () => {
    const { projectId, section } = this.props;

    if (!projectId) {
      return <h1>Projects</h1>;
    }

    switch (section) {
      case 'settings':
        return <h1>Project Settings</h1>;
      case 'members':
        return <h1>Project Members</h1>;
      case 'events':
        return <h1>Project Events</h1>;
      default:
        return <h1>Project Details</h1>;
    }
  };

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()}>{this.renderHeaderButtons()}</PageHeader>
        <PageSection>{this.renderSection()}</PageSection>
      </PageLayout>
    );
  }
}
