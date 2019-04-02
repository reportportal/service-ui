import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { NOT_FOUND } from 'redux-first-router';
import { ModalContainer } from 'components/main/modal';
import { pageNames } from 'controllers/pages/constants';
import {
  pageSelector,
  TEST_ITEM_PAGE,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  LAUNCHES_PAGE,
  HISTORY_PAGE,
  PROJECT_DETAILS_PAGE,
} from 'controllers/pages';
import { LocalizationSwitcher } from 'components/main/localizationSwitcher';
import { ScreenLock } from 'components/main/screenLock';
import { Notifications } from 'components/main/notification';

import { AdminLayout } from 'layouts/adminLayout';
import { AppLayout } from 'layouts/appLayout';
import { EmptyLayout } from 'layouts/emptyLayout';

import { ProjectsPage } from 'pages/admin/projectsPage';
import { AllUsersPage } from 'pages/admin/allUsersPage';
import { ServerSettingsPage } from 'pages/admin/serverSettingsPage';
import { PluginsPage } from 'pages/admin/pluginsPage';

import { ApiPage } from 'pages/inside/apiPage';
import { DashboardPage } from 'pages/inside/dashboardPage';
import { DashboardItemPage } from 'pages/inside/dashboardItemPage';
import { FiltersPage } from 'pages/inside/filtersPage';
import { LaunchesPage } from 'pages/inside/launchesPage';
import { ProfilePage } from 'pages/inside/profilePage';
import { SandboxPage } from 'pages/inside/sandboxPage';
import { ProjectSettingsPageContainer } from 'pages/inside/projectSettingsPageContainer';
import { ProjectMembersPageContainer } from 'pages/inside/projectMembersPageContainer';
import { HistoryPage } from 'pages/inside/historyPage';
import { LoginPage } from 'pages/outside/loginPage';
import { NotFoundPage } from 'pages/outside/notFoundPage';
import { RegistrationPage } from 'pages/outside/registrationPage';
import { TestItemPage } from 'pages/inside/testItemPage';
import { LogsPage } from 'pages/inside/logsPage/index';

import { ANONYMOUS_ACCESS, ADMIN_ACCESS } from './constants';
import { authorizedRoute } from './authorizedRoute';
import { anonymousRoute } from './anonymousRoute';
import { adminRoute } from './adminRoute';

import styles from './pageSwitcher.css';

const pageRendering = {
  [NOT_FOUND]: { component: NotFoundPage, layout: EmptyLayout },

  LOGIN_PAGE: { component: LoginPage, layout: EmptyLayout, access: ANONYMOUS_ACCESS },
  REGISTRATION_PAGE: { component: RegistrationPage, layout: EmptyLayout, access: ANONYMOUS_ACCESS },
  USER_PROFILE_PAGE: { component: ProfilePage, layout: AppLayout },
  API_PAGE: { component: ApiPage, layout: AppLayout },
  PROJECT_DASHBOARD_PAGE: { component: DashboardPage, layout: AppLayout },
  PROJECT_DASHBOARD_ITEM_PAGE: { component: DashboardItemPage, layout: AppLayout },
  PROJECT_FILTERS_PAGE: { component: FiltersPage, layout: AppLayout },
  [LAUNCHES_PAGE]: { component: LaunchesPage, layout: AppLayout },
  PROJECT_LAUNCHES_PAGE: { component: LaunchesPage, layout: AppLayout },
  PROJECT_MEMBERS_PAGE: { component: ProjectMembersPageContainer, layout: AppLayout },
  PROJECT_SANDBOX_PAGE: { component: SandboxPage, layout: AppLayout },
  PROJECT_SETTINGS_PAGE: { component: ProjectSettingsPageContainer, layout: AppLayout },
  PROJECT_SETTINGS_TAB_PAGE: { component: ProjectSettingsPageContainer, layout: AppLayout },
  PROJECT_USERDEBUG_PAGE: { component: LaunchesPage, layout: AppLayout },
  PROJECT_USERDEBUG_TEST_ITEM_PAGE: { component: TestItemPage, layout: AppLayout },
  ADMINISTRATE_PAGE: { component: ProjectsPage, layout: AdminLayout, access: ADMIN_ACCESS },
  PROJECTS_PAGE: { component: ProjectsPage, layout: AdminLayout, access: ADMIN_ACCESS },
  [PROJECT_DETAILS_PAGE]: { component: ProjectsPage, layout: AdminLayout, access: ADMIN_ACCESS },
  ALL_USERS_PAGE: { component: AllUsersPage, layout: AdminLayout, access: ADMIN_ACCESS },
  SERVER_SETTINGS_PAGE: {
    component: ServerSettingsPage,
    layout: AdminLayout,
    access: ADMIN_ACCESS,
  },
  SERVER_SETTINGS_TAB_PAGE: {
    component: ServerSettingsPage,
    layout: AdminLayout,
    access: ADMIN_ACCESS,
  },
  PLUGINS_PAGE: { component: PluginsPage, layout: AdminLayout, access: ADMIN_ACCESS },
  [TEST_ITEM_PAGE]: { component: TestItemPage, layout: AppLayout },
  [PROJECT_LOG_PAGE]: { component: LogsPage, layout: AppLayout },
  [PROJECT_USERDEBUG_LOG_PAGE]: { component: LogsPage, layout: AppLayout },
  [HISTORY_PAGE]: { component: HistoryPage, layout: AppLayout },
};

Object.keys(pageNames).forEach((page) => {
  if (!pageRendering[page]) {
    throw new Error(`Rendering for ${page} was not defined.`);
  }
});

const withAccess = (Inner, access) => {
  switch (access) {
    case ANONYMOUS_ACCESS:
      return anonymousRoute(Inner);
    case ADMIN_ACCESS:
      return adminRoute(Inner);
    default:
      return authorizedRoute(Inner);
  }
};

class PageSwitcher extends React.PureComponent {
  static propTypes = { page: PropTypes.string };
  static defaultProps = { page: undefined };

  render() {
    const { page } = this.props;

    if (!page) return null;

    const { component: PageComponent, layout: Layout, access } = pageRendering[page];

    if (!PageComponent) throw new Error(`Page ${page} does not exist`);
    if (!Layout) throw new Error(`Page ${page} is missing layout`);

    const FullPage = withAccess(
      () => (
        <div className={styles.pageSwitcher}>
          <Layout>
            <LocalizationSwitcher />
            <PageComponent />
          </Layout>
          <ModalContainer />
          <Notifications />
          <ScreenLock />
        </div>
      ),
      access,
    );

    return <FullPage />;
  }
}

export default connect((state) => ({ page: pageSelector(state) }))(PageSwitcher);
