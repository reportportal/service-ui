import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { IssuesStatusPageChart } from 'components/widgets/singleLevelWidgets/charts/issuesStatusPageChart';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { PERIOD_VALUES, PERIOD_VALUES_LENGTH } from 'common/constants/statusPeriodValues';
import { DATE_FORMAT_TOOLTIP } from 'common/constants/timeDateFormat';
import { getWeekRange } from 'common/utils/getWeekRange';
import styles from './autoBugs.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataMessage: {
    id: 'AutoBugs.noDataMessage',
    defaultMessage: 'No launches were performed',
  },
});

@injectIntl
export class AutoBugs extends Component {
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
          toInvestigate: (toInvestigate / total * 100).toFixed(2),
        },
      };
    });

    if (data.length < minListLength) {
      this.prefillDataGap(data, minListLength, interval);
    }

    return { content: data };
  };

  prefillDataGap = (data, minListLength, interval) => {
    // prefill date in before last element
    const lastElementDate = data[0].date;
    let lastEmptyElementDate;

    switch (interval) {
      case PERIOD_VALUES.THREE_MONTHS:
      case PERIOD_VALUES.SIX_MONTHS:
        lastEmptyElementDate = getWeekRange(
          moment(lastElementDate)
            .subtract(1, 'week')
            .format(),
        );
        break;
      case PERIOD_VALUES.ONE_MONTH:
        lastEmptyElementDate = moment(lastElementDate)
          .subtract(1, 'day')
          .format(DATE_FORMAT_TOOLTIP);
        break;
      default:
        return;
    }

    while (data.length < minListLength) {
      data.unshift({
        name: lastEmptyElementDate,
        values: {
          automationBug: 0,
          toInvestigate: 0,
        },
      });
    }
  };

  render() {
    const { data, interval, intl } = this.props;
    const { isContainerRefReady } = this.state;
    const isDataEmpty = !Object.keys(data).length;

    return (
      <div ref={this.containerRef} className={cx('auto-bugs')}>
        {isContainerRefReady && !isDataEmpty ? (
          <IssuesStatusPageChart
            widget={this.prepareData(data, interval)}
            interval={interval}
            container={this.containerRef.current}
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
