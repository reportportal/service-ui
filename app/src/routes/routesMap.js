import { redirect } from 'redux-first-router'
import { userInfoSelector, activeProjectSelector, setActiveProjectAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import { LOGIN_PAGE } from 'controllers/pages'

const routeThunk = (dispatch, getState) => {
	const { type, payload } = getState().location;

	const hashProject = payload.projectId;
	const userProjects = userInfoSelector(store.getState()).assigned_projects;
	if (userProjects
		&& Object.prototype.hasOwnProperty.call(userProjects, hashProject)
		&& hashProject !== activeProjectSelector(store.getState())) {

		dispatch(setActiveProjectAction(hashProject));
		dispatch(fetchProjectAction(hashProject));
	}
	dispatch({ type, payload });
};

const route = options => {
	return { ...options, thunk: routeThunk };
};

const projectRoute = path => {
	return {
		path: path,
		thunk: routeThunk
	};
}

const redirectRoute = (path, createNewAction) => {
	return {
		path: path,
		thunk: dispatch => {
			dispatch(redirect(createNewAction()));
		}
	}
};

export default {
	HOME_PAGE: {
		path: '/',
		thunk: dispatch => {
			dispatch(redirect({type:LOGIN_PAGE}));
		}
	},
	LOGIN_PAGE: '/login',
	REGISTRATION_PAGE: '/registration',
	ADMINISTRATE_PAGE: '/administrate',
	USER_PROFILE_PAGE: '/user-profile',
	API_PAGE: "/api",
	PROJECT_PAGE: redirectRoute("/:projectId", payload => { PROJECT_DASHBOARD_PAGE, payload }),
	PROJECT_DASHBOARD_PAGE: projectRoute("/:projectId/dashboard"),
	PROJECT_LAUNCHES_PAGE: projectRoute("/:projectId/launches"),
	PROJECT_FILTERS_PAGE: projectRoute("/:projectId/filters"),
	PROJECT_USERDEBUG_PAGE: projectRoute("/:projectId/userdebug"),
	PROJECT_MEMBERS_PAGE: projectRoute("/:projectId/members"),
	PROJECT_SETTINGS_PAGE: projectRoute("/:projectId/settings"),
	PROJECT_SANDBOX_PAGE: projectRoute("/:projectId/sandbox")
};
