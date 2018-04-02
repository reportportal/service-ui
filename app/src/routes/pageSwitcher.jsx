import React from 'react';
import { connect } from 'react-redux';
import { ModalContainer } from 'components/main/modal';
import pageNames from 'controllers/pages/constants';
import { pageSelector } from 'controllers/pages';
import { authorizedRoute } from './authorizedRoute';
import { anonymousRoute } from './anonymousRoute';

import styles from './pageSwitcher.css';

const pageRendering = {
	LOGIN_PAGE: { module: 'pages/outside/loginPage', name: 'LoginPage', layout: 'Empty', anonymousAccess: true },
	REGISTRATION_PAGE: { module: 'pages/outside/registrationPage', name: 'RegistrationPage', layout: 'Empty', anonymousAccess: true},

	USER_PROFILE_PAGE: { module: 'pages/inside/profilePage', name: 'ProfilePage', layout: 'App' },
	API_PAGE: { module: 'pages/inside/apiPage', name: 'ApiPage', layout: 'App' },
	PROJECT_DASHBOARD_PAGE: { module: 'pages/inside/dashboardPage', name: 'DashboardPage', layout: 'App' },
	PROJECT_FILTERS_PAGE: { module: 'pages/inside/filtersPage', name: 'FiltersPage', layout: 'App' },
	PROJECT_LAUNCHES_PAGE: { module: 'pages/inside/launchesPage', name: 'LaunchesPage', layout: 'App' },
	PROJECT_MEMBERS_PAGE: { module: 'pages/inside/membersPage', name: 'MembersPage', layout: 'App' },
	PROJECT_SANDBOX_PAGE: { module: 'pages/inside/sandboxPage', name: 'SandboxPage', layout: 'App' },
	PROJECT_SETTINGS_PAGE: { module: 'pages/inside/settingsPage', name: 'SettingsPage', layout: 'App' },
	PROJECT_USERDEBUG_PAGE: { module: 'pages/inside/debugPage', name: 'DebugPage', layout: 'App' },

	ADMINISTRATE_PAGE: { module: 'pages/admin/administratePage', name: 'AdministratePage', layout: 'Empty' },
	PROJECTS_PAGE: { module: 'pages/admin/projectsPage', name: 'ProjectsPage', layout: 'Admin' }
};

for (const page in pageNames) {
	if (!pageRendering[page]) {
		throw new Error(`Rendering for '$page' was not defined.`);
	}
}

const PageSwitcher = ({ page }) => {
	const { module, name, layout, anonymousAccess } = pageRendering[page];
	if (!module)
		throw new Error(`Page $page does not exist`);

	if (!layout)
		throw new Error(`Page $page is missing layout`);

	let PageComponent = require('./' + module)[name];
	console.log('**DEBUG '+PageComponent);
	if (anonymousAccess) {
		PageComponent = anonymousRoute(PageComponent);
	} else {
		PageComponent = authorizedRoute(PageComponent);
	}

	/*
	const layoutName = layout + 'Layout';
	const layoutDir = layout.toLowerCase() + 'Layout';
	const Layout = require(`./layouts/${layoutDir}`)[layoutName];
	*/

	const Layout = require('layouts/emptyLayout/emptyLayout').EmptyLayout;

	return <div className={styles.pageSwitcher}>
		<Layout>
			<LocalizationSwitcher />
    		<PageComponent />
		</Layout>
    	<ModalContainer />
	</div>;
}

export default connect(state => ({ page: pageSelector(state) }))(PageSwitcher);
