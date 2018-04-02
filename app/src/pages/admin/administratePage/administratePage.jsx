import React from 'react';

export const AdministratePage = () => (
    <h1>Admin</h1>
    <Link to={{
		type: PROJECT_DASHBOARD_PAGE,
		payload: {projectId: 'default_project'}}}>
		Back
	</Link>
);
