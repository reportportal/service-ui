import { pageNames, NO_PAGE } from './constants';

export const pageSelector = state => {
	return pageNames[state.location.type] || NO_PAGE;
}

export const pagePropertiesSelector = (
	{ location: { meta } },
	mapping = undefined) => {

	if (!meta || !meta.query) {
		return {};
	}

	if (!mapping) {
		return meta.query;
	}

	const result = {};
	for (const key of mapping) {
		if (Object.hasOwnProperty(meta.query, key)) {
			const propertyName = mapping[key];
			result[propertyName] = meta.query[key];
		}
	}
	return result;
}
