import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { InvestigatedTrendChart } from 'components/widgets/singleLevelWidgets/charts/investigatedTrendChart';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { PERIOD_VALUES, PERIOD_VALUES_LENGTH } from 'common/constants/statusPeriodValues';
import { getWeekRange } from 'common/utils/getWeekRange';
import styles from './launchStatistics.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataMessage: {
    id: 'LaunchStatistics.noDataMessage',
    defaultMessage: 'No launches were performed',
  },
});

@injectIntl
export class LaunchStatistics extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    interval: PropTypes.string,
  };

  static defaultProps = {
    interval: PERIOD_VALUES.THREE_MONTHS,
  };

  state = {
    isContainerRefReady: false,
  };

  componentDidMount() {
    if (this.containerRef.current) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ isContainerRefReady: true });
    }
  }

  containerRef = React.createRef();

  prepareData = (rawData, interval) => {
    const minListLength = PERIOD_VALUES_LENGTH[interval];
    const data = Object.keys(rawData).map((key) => {
      const {
        values: { automationBug, toInvestigate, systemIssue, productBug },
      } = rawData[key][0];
      const total = +automationBug + +toInvestigate + +systemIssue + +productBug;

      return {
        date: key,
        name: interval === PERIOD_VALUES.ONE_MONTH ? key : getWeekRange(key),
        values: {
          automationBug: (automationBug / total * 100).toFixed(2),
          productBug: (productBug / total * 100).toFixed(2),
          systemIssue: (systemIssue / total * 100).toFixed(2),
          toInvestigate: (toInvestigate / total * 100).toFixed(2),
        },
      };
    });

    while (data.length < minListLength) {
      data.unshift({
        name: '',
        values: {
          automationBug: 0,
          productBug: 0,
          systemIssue: 0,
          toInvestigate: 0,
        },
      });
    }

    return { content: data };
  };

  render() {
    const { data, interval, intl } = this.props;
    const { isContainerRefReady } = this.state;
    const isDataEmpty = !Object.keys(data).length;

    return (
      <div ref={this.containerRef} className={cx('launch-statistics')}>
        {isContainerRefReady && !isDataEmpty ? (
          <InvestigatedTrendChart
            widget={this.prepareData(data, interval)}
            interval={interval}
            container={this.containerRef.current}
            onStatusPageMode
          />
        ) : (
          <div className={cx('no-data-wrapper')}>
            <NoDataAvailable message={intl.formatMessage(messages.noDataMessage)} />
          </div>
        )}
      </div>
    );
  }
}
