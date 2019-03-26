import React from 'react';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { isAuthorizedSelector } from 'controllers/auth';
import { LOGIN_PAGE } from 'controllers/pages';

export const authorizedRoute = (Component) =>
  connect(
    (state) => ({
      authorized: isAuthorizedSelector(state),
    }),
    (dispatch) => ({
      redirect: () => dispatch(rfrRedirect({ type: LOGIN_PAGE })),
    }),
  )(({ authorized, redirect, ...otherProps }) => {
    if (authorized) {
      return <Component {...otherProps} />;
    }
    redirect();
    return null;
  });
