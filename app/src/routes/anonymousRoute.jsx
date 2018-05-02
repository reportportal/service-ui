import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { isAuthorizedSelector } from 'controllers/auth';
import { activeProjectSelector } from 'controllers/user';

export const anonymousRoute = Component => connect(state => ({
  authorized: isAuthorizedSelector(state),
  activeProject: activeProjectSelector(state),
}))(({ authorized, activeProject, ...otherProps }) => (
  !authorized ? <Component {...otherProps} /> : <Redirect to={`/${activeProject}`} />
));
