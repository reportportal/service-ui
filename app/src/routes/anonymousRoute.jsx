import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'redux-first-router-link';
import { isAuthorizedSelector } from 'controllers/auth';
import { activeProjectSelector } from 'controllers/user';
import {PROJECT_PAGE} from 'controllers/pages';

export const anonymousRoute =
  Component => connect(
     state => ({
	  authorized: isAuthorizedSelector(state),
	  activeProject: activeProjectSelector(state),
	}), (dispatch, ownProps) => {
		return {
			redirect: () => dispatch({
				type:PROJECT_PAGE,
				payload: {projectId: ownProps.activeProject}})
		};
    }) (({ authorized, activeProject, redirect, ...otherProps }) => {
	  if (authorized)
		redirect();
	  else
		return <Component {...otherProps} />
	});
