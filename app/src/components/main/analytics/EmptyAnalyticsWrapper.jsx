import PropTypes from 'prop-types';
import track from 'react-tracking';

function AnalyticsWrapper({ children }) {
  return children;
}
AnalyticsWrapper.propTypes = {
  children: PropTypes.node,
};
AnalyticsWrapper.defaultProps = {
  children: null,
};

export const EmptyAnalyticsWrapper = track()(AnalyticsWrapper);
