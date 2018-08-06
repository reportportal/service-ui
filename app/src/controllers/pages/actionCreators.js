import { redirect } from 'redux-first-router';
import { extractNamespacedQuery, createNamespacedQuery } from 'common/utils/routingUtils';

export const updatePagePropertiesAction = (properties, namespace) => (dispatch, getState) => {
  const {
    location: { type, payload, query },
  } = getState();

  const namespacedQuery = namespace ? extractNamespacedQuery(query || {}, namespace) : query;
  const updatedNamespacedQuery = createNamespacedQuery(
    {
      ...namespacedQuery,
      ...properties,
    },
    namespace,
  );

  const updatedAction = {
    type,
    payload,
    meta: { query: { ...query, ...updatedNamespacedQuery } },
  };

  dispatch(redirect(updatedAction));
};
