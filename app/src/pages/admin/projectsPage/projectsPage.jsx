import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redirect } from 'redux-first-router';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import {
  PROJECTS_PAGE,
  PROJECT_DETAILS_PAGE,
  projectIdSelector,
  projectSectionSelector,
} from 'controllers/pages';
import { SETTINGS, MEMBERS, EVENTS } from 'common/constants/projectSections';
import { GENERAL } from 'common/constants/settingsTabs';
import { GhostButton } from 'components/buttons/ghostButton';
import AddProjectIcon from 'common/img/add-project-inline.svg';
import ProjectUsersIcon from 'common/img/project-users-inline.svg';
import ProjectSettingsIcon from 'common/img/project-settings-inline.svg';
import ProjectEventsIcon from 'common/img/project-events-inline.svg';
import { ProjectStatusPage } from '../projectStatusPage';
import { ProjectEventsPage } from '../projectEventsPage';
import { AdminProjectSettingsPageContainer } from '../adminProjectSettingsPageContainer';

import styles from './projectsPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  pageTitle: {
    id: 'ProjectsPage.title',
    defaultMessage: 'All projects',
  },
  addProject: {
    id: 'ProjectsPage.addProject',
    defaultMessage: 'Add New Project',
  },
  [`${SETTINGS}Title`]: {
    id: 'ProjectDetailsPageSettings.title',
    defaultMessage: 'Settings',
  },
  [`${MEMBERS}Title`]: {
    id: 'ProjectDetailsPageMembers.title',
    defaultMessage: 'Members',
  },
  [`${EVENTS}Title`]: {
    id: 'ProjectDetailsPageEvents.title',
    defaultMessage: 'Events',
  },
});

const HEADER_BUTTONS = [
  {
    key: MEMBERS,
    icon: ProjectUsersIcon,
  },
  {
    key: SETTINGS,
    icon: ProjectSettingsIcon,
  },
  {
    key: EVENTS,
    icon: ProjectEventsIcon,
  },
];

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    section: projectSectionSelector(state),
  }),
  {
    redirectToSection: (projectId, section) =>
      redirect({
        type: PROJECT_DETAILS_PAGE,
        payload: {
          projectId,
          projectSection: section,
          settingsTab: section === SETTINGS ? GENERAL : undefined,
        },
      }),
  },
)
@injectIntl
export class ProjectsPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    section: PropTypes.string,
    projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    redirectToSection: PropTypes.func.isRequired,
  };

  static defaultProps = {
    section: undefined,
    projectId: undefined,
  };

  onHeaderButtonClick = (section) => () => {
    this.props.redirectToSection(this.props.projectId, section);
  };

  getBreadcrumbs = () => {
    const {
      intl: { formatMessage },
      projectId,
      section,
    } = this.props;

    const breadcrumbs = [
      {
        title: formatMessage(messages.pageTitle),
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
        title: formatMessage(messages[`${section}Title`]),
      });
    }

    return breadcrumbs;
  };

  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
      projectId,
      section,
    } = this.props;

    if (!projectId) {
      return <GhostButton icon={AddProjectIcon}>{formatMessage(messages.addProject)}</GhostButton>;
    }

    return (
      <div className={cx('header-buttons')}>
        {HEADER_BUTTONS.map(({ key, icon }) => (
          <GhostButton
            key={key}
            disabled={section === key}
            icon={icon}
            onClick={this.onHeaderButtonClick(key)}
            title={formatMessage(messages[`${key}Title`])}
          >
            {formatMessage(messages[`${key}Title`])}
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
      case SETTINGS:
        return <AdminProjectSettingsPageContainer projectId={projectId} />;
      case MEMBERS:
        return <h1>Project Members</h1>;
      case EVENTS:
        return <ProjectEventsPage />;
      default:
        return <ProjectStatusPage projectId={projectId} />;
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
