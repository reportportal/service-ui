import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { ModalContainer } from 'components/main/modal';
import { EmptyLayout } from 'layouts/emptyLayout';
import { AppLayout } from 'layouts/appLayout';
import { AdminLayout } from 'layouts/adminLayout';

import { ProfilePage } from 'pages/inside/profilePage';
import { ApiPage } from 'pages/inside/apiPage';
import { DashboardPage } from 'pages/inside/dashboardPage';
import { LaunchesPage } from 'pages/inside/launchesPage';
import { FiltersPage } from 'pages/inside/filtersPage';
import { DebugPage } from 'pages/inside/debugPage';
import { MembersPage } from 'pages/inside/membersPage';
import { SettingsPage } from 'pages/inside/settingsPage';
import { SandboxPage } from 'pages/inside/sandboxPage';
import { LoginPage } from 'pages/outside/loginPage';
import { RegistrationPage } from 'pages/outside/registrationPage';
import { LocalizationSwitcher } from 'components/main/localizationSwitcher';
import { authorizedRoute } from './authorizedRoute';
import { anonymousRoute } from './anonymousRoute';

const LoginRoute = anonymousRoute(() => (
  <EmptyLayout>
    <LocalizationSwitcher />
    <LoginPage />
  </EmptyLayout>
));

const RegistrationRoute = anonymousRoute(() => (
  <EmptyLayout>
    <LocalizationSwitcher />
    <RegistrationPage />
  </EmptyLayout>
));

const AppRoute = authorizedRoute(() => (
  <AppLayout>
    <LocalizationSwitcher />
    <Switch>
      <Route path="/user-profile" component={ProfilePage} />
      <Route path="/api" component={ApiPage} />
      <Route exact path="/:projectId" component={DashboardPage} />
      <Route path="/:projectId/dashboard" component={DashboardPage} />
      <Route path="/:projectId/launches" component={LaunchesPage} />
      <Route path="/:projectId/filters" component={FiltersPage} />
      <Route path="/:projectId/userdebug" component={DebugPage} />
      <Route path="/:projectId/members" component={MembersPage} />
      <Route path="/:projectId/settings" component={SettingsPage} />
      <Route path="/:projectId/sandbox" component={SandboxPage} />
    </Switch>
  </AppLayout>
));

const AdminRoute = authorizedRoute(() => (
  <AdminLayout>
    <LocalizationSwitcher />
    <h1>Admin</h1>
    <Link to="/default_project/dashboard">Back</Link>
  </AdminLayout>
));

const RootRoute = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <Switch>
      <Route exact path="/" component={LoginRoute} />
      <Route path="/login" component={LoginRoute} />
      <Route path="/registration" component={RegistrationRoute} />
      <Route path="/administrate" component={AdminRoute} />
      <AppRoute />
    </Switch>
    <ModalContainer />
  </div>
);

export default RootRoute;
