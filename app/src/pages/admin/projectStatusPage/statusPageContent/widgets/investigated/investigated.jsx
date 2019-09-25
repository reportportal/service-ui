import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { InvestigatedTrendChart } from 'components/widgets/singleLevelWidgets/charts/investigatedTrendChart';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { PERIOD_VALUES, PERIOD_VALUES_LENGTH } from 'common/constants/statusPeriodValues';
import { getWeekRange } from 'common/utils/getWeekRange';
import styles from './investigated.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataMessage: {
    id: 'LastLaunch.noDataMessage',
    defaultMessage: 'No launches were performed',
  },
});

@injectIntl
export class Investigated extends Component {
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
        values: { investigated, toInvestigate },
      } = rawData[key][0];

      return {
        date: key,
        name: interval === PERIOD_VALUES.ONE_MONTH ? key : getWeekRange(key),
        values: {
          investigated,
          toInvestigate,
        },
      };
    });

    while (data.length < minListLength) {
      data.unshift({
        name: '',
        values: {
          investigated: 0,
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
      <div ref={this.containerRef} className={cx('investigated')}>
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
