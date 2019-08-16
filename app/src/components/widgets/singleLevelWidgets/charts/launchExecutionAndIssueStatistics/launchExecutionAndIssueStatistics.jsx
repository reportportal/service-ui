import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { LaunchExecutionChart } from './launchExecutionChart';
import { IssueStatisticsChart } from './issueStatisticsChart';
import styles from './launchExecutionAndIssueStatistics.scss';

const cx = classNames.bind(styles);
const launchNameBlockHeight = 40;

const localMessages = defineMessages({
  launchNameText: {
    id: 'LaunchExecutionAndIssueStatistics.launchNameText',
    defaultMessage: 'Launch name:',
  },
});

export const LaunchExecutionAndIssueStatistics = injectIntl((props) => {
  const {
    widget: {
      content: { result = [] },
    },
    onStatusPageMode,
  } = props;
  const { name, number } = result[0];
  const launchName = number ? `${name} #${number}` : name;

  return (
    <div className={cx('launch-execution-and-issues-chart')}>
      {!onStatusPageMode && (
        <div className={cx('launch-name-block')}>
          <span className={cx('launch-name-text')}>
            {`${props.intl.formatMessage(localMessages.launchNameText)} `}
          </span>
          <span className={cx('launch-name')}>{`${launchName}`}</span>
        </div>
      )}
      <div className={cx('widgets-wrapper')}>
        <LaunchExecutionChart {...props} launchNameBlockHeight={launchNameBlockHeight} />
        <IssueStatisticsChart {...props} launchNameBlockHeight={launchNameBlockHeight} />
      </div>
    </div>
  );
});

LaunchExecutionAndIssueStatistics.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  uncheckedLegendItems: PropTypes.array,
  onChangeLegend: PropTypes.func,
  onStatusPageMode: PropTypes.bool,
};

LaunchExecutionAndIssueStatistics.defaultProps = {
  isPreview: false,
  height: 0,
  observer: {},
  uncheckedLegendItems: [],
  onChangeLegend: () => {},
  onStatusPageMode: false,
};
