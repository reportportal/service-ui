import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { NOT_FOUND } from 'redux-first-router';
import { ModalContainer } from 'components/main/modal';
import { pageNames } from 'controllers/pages/constants';
import { pageSelector } from 'controllers/pages';
import { LocalizationSwitcher } from 'components/main/localizationSwitcher';
import { ScreenLock } from 'components/main/screenLock';
import { Notifications } from 'components/main/notification';

import { AdminLayout } from 'layouts/adminLayout';
import { AppLayout } from 'layouts/appLayout';
import { EmptyLayout } from 'layouts/emptyLayout';

import { AdministratePage } from 'pages/admin/administratePage';
import { ProjectsPage } from 'pages/admin/projectsPage';
import { ApiPage } from 'pages/inside/apiPage';
import { DashboardPage } from 'pages/inside/dashboardPage';
import { DashboardItemPage } from 'pages/inside/dashboardItemPage';
import { DebugPage } from 'pages/inside/debugPage';
import { FiltersPage } from 'pages/inside/filtersPage';
import { LaunchesPage } from 'pages/inside/launchesPage';
import { MembersPage } from 'pages/inside/membersPage';
import { ProfilePage } from 'pages/inside/profilePage';
import { SandboxPage } from 'pages/inside/sandboxPage';
import { SettingsPage } from 'pages/inside/settingsPage';
import { LoginPage } from 'pages/outside/loginPage';
import { NotFoundPage } from 'pages/outside/notFoundPage';
import { RegistrationPage } from 'pages/outside/registrationPage';

import { authorizedRoute } from './authorizedRoute';
import { anonymousRoute } from './anonymousRoute';

import styles from './pageSwitcher.css';

const pageRendering = {
  [NOT_FOUND]: { component: NotFoundPage, layout: EmptyLayout },

  LOGIN_PAGE: { component: LoginPage, layout: EmptyLayout, anonymousAccess: true },
  REGISTRATION_PAGE: { component: RegistrationPage, layout: EmptyLayout, anonymousAccess: true },
  USER_PROFILE_PAGE: { component: ProfilePage, layout: AppLayout },
  API_PAGE: { component: ApiPage, layout: AppLayout },
  PROJECT_DASHBOARD_PAGE: { component: DashboardPage, layout: AppLayout },
  PROJECT_DASHBOARD_ITEM_PAGE: { component: DashboardItemPage, layout: AppLayout },
  PROJECT_FILTERS_PAGE: { component: FiltersPage, layout: AppLayout },
  PROJECT_LAUNCHES_PAGE: { component: LaunchesPage, layout: AppLayout },
  PROJECT_MEMBERS_PAGE: { component: MembersPage, layout: AppLayout },
  PROJECT_SANDBOX_PAGE: { component: SandboxPage, layout: AppLayout },
  PROJECT_SETTINGS_PAGE: { component: SettingsPage, layout: AppLayout },
  PROJECT_USERDEBUG_PAGE: { component: DebugPage, layout: AppLayout },
  ADMINISTRATE_PAGE: { component: AdministratePage, layout: EmptyLayout },
  PROJECTS_PAGE: { component: ProjectsPage, layout: AdminLayout },
};

Object.keys(pageNames).forEach((page) => {
  if (!pageRendering[page]) {
    throw new Error(`Rendering for '$page' was not defined.`);
  }
});

const withAccess = (Inner, anonymousAccess) => {
  if (anonymousAccess) {
    return anonymousRoute(Inner);
  }
  return authorizedRoute(Inner);
};

class PageSwitcher extends React.PureComponent {
  static propTypes = { page: PropTypes.string };
  static defaultProps = { page: undefined };

  render() {
    const { page } = this.props;

    if (!page) return null;

    const { component: PageComponent, layout: Layout, anonymousAccess } = pageRendering[page];

    if (!PageComponent) throw new Error(`Page $page does not exist`);
    if (!Layout) throw new Error(`Page $page is missing layout`);

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
      anonymousAccess,
    );

    return <FullPage />;
  }
}

export default connect((state) => ({ page: pageSelector(state) }))(PageSwitcher);
