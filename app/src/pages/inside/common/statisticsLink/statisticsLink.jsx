import { connect } from 'react-redux';
import Link, { NavLink } from 'redux-first-router-link';
import { statisticsLinkSelector } from 'controllers/testItem';

export const StatisticsLink = connect((state, ownProps) => ({
  link: statisticsLinkSelector(state, ownProps),
}))(
  ({ link, itemId, statistics, children, ownLinkParams = {}, ...rest }) =>
    ownLinkParams.isOtherPage ? (
      <NavLink to={link} {...rest}>
        {children}
      </NavLink>
    ) : (
      <Link to={link} {...rest}>
        {children}
      </Link>
    ),
);
