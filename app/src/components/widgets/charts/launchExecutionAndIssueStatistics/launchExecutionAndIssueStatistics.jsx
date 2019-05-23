import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { LaunchExecutionChart } from './launchExecutionChart';
import { IssueStatisticsChart } from './issueStatisticsChart';
import styles from './launchExecutionAndIssueStatistics.scss';

const cx = classNames.bind(styles);

export const LaunchExecutionAndIssueStatistics = (props) => (
  <div className={cx('launch-execution-and-issues-chart')}>
    <LaunchExecutionChart {...props} />
    <IssueStatisticsChart {...props} />
  </div>
);

LaunchExecutionAndIssueStatistics.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  uncheckedLegendItems: PropTypes.array,
  onChangeLegend: PropTypes.func,
  isOnStatusPageMode: PropTypes.bool,
};

LaunchExecutionAndIssueStatistics.defaultProps = {
  isPreview: false,
  height: 0,
  observer: {
    subscribe: () => {},
    unsubscribe: () => {},
  },
  uncheckedLegendItems: [],
  onChangeLegend: () => {},
  isOnStatusPageMode: false,
};
