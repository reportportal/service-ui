import React from 'react';
import Link from 'redux-first-router-link';

export const AdministratePage = () => (
    <h1>Admin</h1>
    <Link to={{type: PROJECT_DASHBOARD_PAGE, payload: {projectId: 'default_project'}}}>
		Back
	</Link>
);
