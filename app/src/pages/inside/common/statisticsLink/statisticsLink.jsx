import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { statisticsLinkSelector } from 'controllers/testItem';

export const StatisticsLink = connect((state) => ({
  getStatisticsLink: statisticsLinkSelector(state),
}))((props) => {
  const { getStatisticsLink, itemId, statistics, children, ownLinkParams, ...rest } = props;
  const link = getStatisticsLink(props);
  return (
    <Link to={link} {...rest}>
      {children}
    </Link>
  );
});
