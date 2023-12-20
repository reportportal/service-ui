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
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { ADMIN_PROJECTS_PAGE_EVENTS, ADMIN_PROJECTS_PAGE } from 'components/main/analytics/events';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import {
  PROJECTS_PAGE,
  PROJECT_DETAILS_PAGE,
  projectSectionSelector,
  urlProjectKeySelector,
} from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { MEMBERS, MONITORING } from 'common/constants/projectSections';
import { GhostButton } from 'components/buttons/ghostButton';
import AddProjectIcon from 'common/img/add-project-inline.svg';
import ProjectUsersIcon from 'common/img/project-users-inline.svg';
import ProjectMonitoringIcon from 'common/img/project-monitoring-inline.svg';
import { MembersPage } from 'pages/common/membersPage';
import {
  addProjectAction,
  navigateToProjectSectionAction,
} from 'controllers/administrate/projects';
import { projectOrganizationSlugSelector } from 'controllers/project';
import { ProjectStatusPage } from '../projectStatusPage';
import { ProjectEventsPage } from '../projectEventsPage';
import { Projects } from './projects';
import { messages } from './messages';
import styles from './projectsPage.scss';

const cx = classNames.bind(styles);

const HEADER_BUTTONS = [
  {
    key: MONITORING,
    icon: ProjectMonitoringIcon,
  },
  {
    key: MEMBERS,
    icon: ProjectUsersIcon,
  },
];

@connect(
  (state) => ({
    projectKey: urlProjectKeySelector(state),
    section: projectSectionSelector(state),
    organizationSlug: projectOrganizationSlugSelector(state),
  }),
  {
    addProject: addProjectAction,
    showModal: showModalAction,
    navigateToSection: navigateToProjectSectionAction,
  },
)
@injectIntl
@track({ page: ADMIN_PROJECTS_PAGE })
export class ProjectsPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    navigateToSection: PropTypes.func.isRequired,
    addProject: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    section: PropTypes.string,
    organizationSlug: PropTypes.string.isRequired,
    projectKey: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    section: undefined,
  };

  onHeaderButtonClick = (section) => () => {
    this.props.tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.HEADER_BUTTON_CLICK(section));
    this.props.navigateToSection(
      {
        organizationSlug: this.props.organizationSlug,
        projectKey: this.props.projectKey,
      },
      section,
    );
  };

  getBreadcrumbs = () => {
    const {
      intl: { formatMessage },
      section,
      organizationSlug,
      projectKey,
    } = this.props;

    const breadcrumbs = [
      {
        title: formatMessage(messages.pageTitle),
        link: {
          type: PROJECTS_PAGE,
        },
      },
    ];

    if (projectKey) {
      breadcrumbs.push({
        title: `${projectKey}`,
        link: {
          type: PROJECT_DETAILS_PAGE,
          payload: { projectKey, projectSection: null, organizationSlug },
        },
      });
    }

    if (section) {
      breadcrumbs.push({
        title: formatMessage(messages[section]),
      });
    }

    return breadcrumbs;
  };

  showAddProjectModal = () => {
    this.props.tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.ADD_PROJECT_BTN);
    this.props.showModal({
      id: 'addProjectModal',
      data: {
        onSubmit: (values) =>
          this.props.addProject(values.projectName, this.props.organizationSlug),
        eventsInfo: {
          addBtn: ADMIN_PROJECTS_PAGE_EVENTS.ADD_BTN_ADD_PROJECT_MODAL,
          closeIcon: ADMIN_PROJECTS_PAGE_EVENTS.CLOSE_ICON_ADD_PROJECT_MODAL,
          cancelBtn: ADMIN_PROJECTS_PAGE_EVENTS.CANCEL_BTN_ADD_PROJECT_MODAL,
        },
      },
    });
  };

  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
      projectKey,
      section,
    } = this.props;

    if (!projectKey) {
      return (
        <div className={cx('mobile-hide')}>
          <GhostButton icon={AddProjectIcon} onClick={this.showAddProjectModal}>
            {formatMessage(messages.addProject)}
          </GhostButton>
        </div>
      );
    }

    return (
      <div className={cx('header-buttons', 'mobile-hide')}>
        {HEADER_BUTTONS.map(({ key, icon }) => (
          <GhostButton
            key={key}
            disabled={section === key}
            icon={icon}
            onClick={this.onHeaderButtonClick(key)}
            title={formatMessage(messages[`${key}HeaderButton`])}
          >
            {formatMessage(messages[`${key}HeaderButton`])}
          </GhostButton>
        ))}
      </div>
    );
  };

  renderSection = () => {
    const { projectKey, section } = this.props;

    if (!projectKey) {
      return <Projects />;
    }

    switch (section) {
      case MEMBERS:
        return <MembersPage />;
      case MONITORING:
        return <ProjectEventsPage />;
      default:
        return <ProjectStatusPage projectKey={projectKey} />;
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
