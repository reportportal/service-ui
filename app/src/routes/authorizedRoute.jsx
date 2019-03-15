import React from 'react';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import {
  isAuthorizedSelector,
  isAdminAccessSelector,
  resetAdminAccessAction,
} from 'controllers/auth';
import { LOGIN_PAGE } from 'controllers/pages';

export const authorizedRoute = (Component) =>
  connect(
    (state) => ({
      authorized: isAuthorizedSelector(state),
      isAdminAccess: isAdminAccessSelector(state),
    }),
    (dispatch) => ({
      redirect: () => dispatch(rfrRedirect({ type: LOGIN_PAGE })),
      resetAdminAccess: () => dispatch(resetAdminAccessAction()),
    }),
  )(({ authorized, isAdminAccess, redirect, resetAdminAccess, ...otherProps }) => {
    if (authorized) {
      isAdminAccess && resetAdminAccess();
      return <Component {...otherProps} />;
    }
    redirect();
    return null;
  });
