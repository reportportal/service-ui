/*
 * Copyright 2026 EPAM Systems
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

import { redirect } from 'redux-first-router';
import { userInfoSelector, activeProjectSelector, setActiveProjectAction } from 'controllers/user';
import { isAuthorizedSelector } from 'controllers/auth';
import {
  ORGANIZATION_USERS_PAGE,
  ORGANIZATIONS_PAGE,
  adminPageNames,
  userAssignedSelector,
  userRolesSelector,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
} from 'controllers/pages';
import { prepareActiveProjectAction } from 'controllers/project';
import {
  fetchOrganizationBySlugAction,
  activeOrganizationSelector,
} from 'controllers/organization';
import { getRedirectRoute, ROUTE_ACTION_TYPES } from 'routes/routesMap';
import { stringEqual } from 'common/utils/stringUtils';
import {
  canSeeOrganizationMembers,
  canSeeSidebarOptions,
  canSeeInstanceLevelPluginsPages,
} from 'common/utils/permissions';

/**
 * Organization/project route middleware: access check, sync of active org/project from URL, redirect on no access.
 * Must run before redux-first-router so route thunks see correct activeProjectKey/activeOrganization;
 * otherwise page thunks (e.g. fetchDashboards) would use the previous project and fire duplicate requests.
 */
export const organizationProjectRouteMiddleware = (store) => (next) => (action) => {
  if (!ROUTE_ACTION_TYPES.has(action.type)) return next(action);

  const { getState, dispatch } = store;
  const {
    organizationSlug: hashOrganizationSlug,
    projectSlug: hashProjectSlug,
    projectKey: hashProjectKey,
  } = action.payload || {};

  const authorized = isAuthorizedSelector(getState());
  const isAdminPage = action.type in adminPageNames;

  if (authorized && isAdminPage) {
    const hasInstanceLevelAccess =
      action.type === PLUGIN_UI_EXTENSION_ADMIN_PAGE
        ? canSeeInstanceLevelPluginsPages(userRolesSelector(getState()))
        : canSeeSidebarOptions(userRolesSelector(getState()));

    if (!hasInstanceLevelAccess) {
      dispatch(redirect({ type: ORGANIZATIONS_PAGE }));
      return;
    }
  }

  const isOrganizationPage = !!hashOrganizationSlug;
  const isOrganizationUsersPage = action.type === ORGANIZATION_USERS_PAGE;

  if (!authorized || !isOrganizationPage) return next(action);

  const { slug: organizationSlug } = activeOrganizationSelector(getState());
  const { projectSlug } = activeProjectSelector(getState());
  const user = userInfoSelector(getState());
  const {
    hasPermission,
    hasPermissionOrganization,
    assignedProjectKey,
    assignmentNotRequired,
    userRoles,
  } = userAssignedSelector(hashProjectSlug, hashOrganizationSlug)(getState());

  const isProjectPage = !!hashProjectSlug;

  const hasPermissionOrganizationUsers = canSeeOrganizationMembers(userRoles);

  // For project pages check project-level permission, for org pages — org-level
  const hasOrganizationPageAccess =
    hasPermissionOrganization && isOrganizationUsersPage
      ? hasPermissionOrganizationUsers
      : hasPermissionOrganization;

  const hasPageAccess = isProjectPage ? hasPermission : hasOrganizationPageAccess;

  // No access — redirect to a guaranteed accessible route
  if (!hasPageAccess) {
    dispatch(redirect(getRedirectRoute(user)));
    return;
  }

  const isChangedOrganization = !stringEqual(organizationSlug, hashOrganizationSlug);
  const isChangedProject = isChangedOrganization || !stringEqual(projectSlug, hashProjectSlug);
  const projectKey = assignedProjectKey || (assignmentNotRequired && hashProjectKey);

  // Organization changed — fetch its data (runs independently of project change)
  if (isChangedOrganization) {
    dispatch(fetchOrganizationBySlugAction(hashOrganizationSlug));
  }

  if (isProjectPage && isChangedProject) {
    // Project changed — update active project and fetch its data
    dispatch(
      setActiveProjectAction({
        organizationSlug: hashOrganizationSlug,
        projectSlug: hashProjectSlug,
      }),
    );
    dispatch(
      prepareActiveProjectAction({
        organizationSlug: hashOrganizationSlug,
        projectSlug: hashProjectSlug,
        projectKey,
        action,
      }),
    );

    return;
  }

  return next(action);
};
