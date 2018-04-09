import { pageNames, NO_PAGE } from './constants';

export const pageSelector = state => {
	return pageNames[state.location.type] || NO_PAGE;
}

export const pagePropertiesSelector = (
	{ location: { query } },
	mapping = undefined) => {

	if (!query) {
		return {};
	}

	if (!mapping) {
		return query;
	}

	const result = {};
	for (const key of mapping) {
		if (Object.hasOwnProperty(query, key)) {
			const propertyName = mapping[key];
			result[propertyName] = query[key];
		}
	}
	return result;
}
