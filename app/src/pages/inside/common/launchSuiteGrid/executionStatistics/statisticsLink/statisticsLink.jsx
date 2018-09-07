import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { statisticsLinkSelector } from 'controllers/testItem';

export const StatisticsLink = connect((state, ownProps) => ({
  link: statisticsLinkSelector(state, ownProps),
}))(({ link, itemId, statistics, children, ...rest }) => (
  <Link to={link} {...rest}>
    {children}
  </Link>
));
