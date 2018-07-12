import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { nameLinkSelector } from 'controllers/testItem';

export const NameLink = connect((state, ownProps) => ({
  link: nameLinkSelector(state, ownProps),
}))(({ className, page, link, itemId, children, ...rest }) => (
  <Link to={link} className={className} {...rest}>
    {children}
  </Link>
));
