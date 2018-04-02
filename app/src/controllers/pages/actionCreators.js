import { redirect } from 'redux-first-router';

export const updatePagePropertiesAction = properties => (dispatch, getState) => {
	const { location: { type, payload, meta } } = getState();
	
	const updatedAction = {
		type,
		payload,
		meta: { ...meta,  query: { ...meta.query, ...properties } }
	};

	dispatch(redirect(updatedAction));
};
