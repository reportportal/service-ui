import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { defectLinkSelector } from 'controllers/testItem';

export const DefectLink = connect((state, ownProps) => ({
  link: defectLinkSelector(state, ownProps),
}))(({ itemId, link, children, defects, ...rest }) => (
  <Link to={link} {...rest}>
    {children}
  </Link>
));
