/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import styles from './issuesChartWrapper.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataMessage: {
    id: 'IssuesChartWrapper.noDataMessage',
    defaultMessage: 'No launches were performed',
  },
});

@injectIntl
export class IssuesChartWrapper extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    interval: PropTypes.string,
    targetFieldKey: PropTypes.string,
  };

  static defaultProps = {
    interval: PERIOD_VALUES.THREE_MONTHS,
    targetFieldKey: '',
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

  prepareData = (rawData, interval, targetFieldKey) => {
    const minListLength = PERIOD_VALUES_LENGTH[interval];

    const data = Object.keys(rawData).map((key) => {
      const currentItemValues = rawData[key][0].values;
      const { automationBug, toInvestigate, systemIssue, productBug } = currentItemValues;
      const total = +automationBug + +toInvestigate + +systemIssue + +productBug;

      return {
        date: key,
        name: interval === PERIOD_VALUES.ONE_MONTH ? key : getWeekRange(key),
        values: {
          [targetFieldKey]: ((currentItemValues[targetFieldKey] / total) * 100).toFixed(2),
          toInvestigate: ((toInvestigate / total) * 100).toFixed(2),
        },
      };
    });

    if (data.length < minListLength) {
      this.prefillDataGap(data, minListLength, interval, targetFieldKey);
    }

    return { content: { result: data } };
  };

  prefillDataGap = (data, minListLength, interval, targetFieldKey) => {
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
          [targetFieldKey]: 0,
          toInvestigate: 0,
        },
      });
    }
  };

  containerRef = React.createRef();

  render() {
    const {
      intl: { formatMessage },
      data,
      interval,
      targetFieldKey,
    } = this.props;
    const { isContainerRefReady } = this.state;
    const isDataEmpty = !Object.keys(data).length;

    return (
      <div ref={this.containerRef} className={cx('issues-chart-wrapper')}>
        {isContainerRefReady && !isDataEmpty ? (
          <IssuesStatusPageChart
            widget={this.prepareData(data, interval, targetFieldKey)}
            interval={interval}
            container={this.containerRef.current}
          />
        ) : (
          <div className={cx('no-data-wrapper')}>
            <NoDataAvailable message={formatMessage(messages.noDataMessage)} />
          </div>
        )}
      </div>
    );
  }
}
