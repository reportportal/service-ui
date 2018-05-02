import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { isAuthorizedSelector } from 'controllers/auth';

export const authorizedRoute = Component => connect(state => ({
  authorized: isAuthorizedSelector(state),
}))(({ authorized, ...otherProps }) => (
  authorized ? <Component {...otherProps} /> : <Redirect to="/login" />
));
