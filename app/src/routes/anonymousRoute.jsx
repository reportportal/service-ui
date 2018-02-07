import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { isAuthorizedSelector, defaultProjectSelector } from 'controllers/auth';

export const anonymousRoute = Component => connect(state => ({
  authorized: isAuthorizedSelector(state),
  defaultProject: defaultProjectSelector(state),
}))(({ authorized, defaultProject, ...otherProps }) => (
  !authorized ? <Component {...otherProps} /> : <Redirect to={`/${defaultProject}`} />
));
