import React from 'react';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { isAuthorizedSelector } from 'controllers/auth';
import { userAccountRoleSelector, activeProjectSelector } from 'controllers/user';
import { PROJECT_DASHBOARD_PAGE } from 'controllers/pages';

export const adminRoute = (Component) =>
  connect(
    (state) => ({
      authorized: isAuthorizedSelector(state),
      accountRole: userAccountRoleSelector(state),
      projectId: activeProjectSelector(state),
    }),
    (dispatch) => ({
      redirect: (projectId) =>
        dispatch(rfrRedirect({ type: PROJECT_DASHBOARD_PAGE, payload: { projectId } })),
    }),
  )(({ authorized, accountRole, projectId, redirect, ...otherProps }) => {
    if (authorized && accountRole === ADMINISTRATOR) {
      return <Component {...otherProps} />;
    }
    redirect(projectId);
    return null;
  });
