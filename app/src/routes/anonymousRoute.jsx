import React from 'react';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { isAuthorizedSelector } from 'controllers/auth';
import { activeProjectSelector } from 'controllers/user';
import { PROJECT_PAGE } from 'controllers/pages';

export const anonymousRoute = (Component) =>
  connect(
    (state) => ({
      authorized: isAuthorizedSelector(state),
      activeProject: activeProjectSelector(state),
    }),
    (dispatch, ownProps) => ({
      redirect: () =>
        dispatch(
          rfrRedirect({
            type: PROJECT_PAGE,
            payload: {
              projectId: ownProps.activeProject,
            },
          }),
        ),
    }),
  )(({ authorized, activeProject, redirect, ...otherProps }) => {
    if (authorized) {
      redirect();
      return null;
    }

    return <Component {...otherProps} />;
  });
