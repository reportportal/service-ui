import isEqual from 'fast-deep-equal';
import { mergeQuery } from 'common/utils/routingUtils';

export const updatePagePropertiesAction = (properties) => (dispatch, getState) => {
  const {
    location: { type, payload, query },
  } = getState();

  const newQuery = mergeQuery(query, properties);

  if (isEqual(query, newQuery)) {
    return;
  }

  const updatedAction = {
    type,
    payload,
    meta: { query: newQuery },
  };

  dispatch(updatedAction);
};
