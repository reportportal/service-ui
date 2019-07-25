import { UPDATE_PAGE_PROPERTIES } from './constants';

export const updatePagePropertiesAction = (properties) => ({
  type: UPDATE_PAGE_PROPERTIES,
  payload: properties,
});
