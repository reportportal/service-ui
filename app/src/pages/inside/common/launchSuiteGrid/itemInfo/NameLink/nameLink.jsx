import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import {
  pagePropertiesSelector,
  payloadSelector,
  testItemIdsSelector,
  TEST_ITEM_PAGE,
} from 'controllers/pages';

const linkSelector = (state, ownProps) => {
  const query = pagePropertiesSelector(state);
  const payload = payloadSelector(state);
  const testItemIds = testItemIdsSelector(state);
  const newTestItemsParam = testItemIds ? `${testItemIds}/${ownProps.itemId}` : ownProps.itemId;
  return {
    type: TEST_ITEM_PAGE,
    payload: {
      ...payload,
      testItemIds: newTestItemsParam,
    },
    meta: {
      query: { ...query },
    },
  };
};

export const NameLink = connect((state, ownProps) => ({
  link: linkSelector(state, ownProps),
}))(({ className, page, link, itemId, children, ...rest }) => (
  <Link to={link} className={className} {...rest}>
    {children}
  </Link>
));
