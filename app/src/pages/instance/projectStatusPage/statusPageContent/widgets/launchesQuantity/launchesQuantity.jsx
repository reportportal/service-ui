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
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { InvestigatedTrendChart } from 'components/widgets/singleLevelWidgets/charts/investigatedTrendChart';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { PERIOD_VALUES, PERIOD_VALUES_LENGTH } from 'common/constants/statusPeriodValues';
import styles from './launchesQuantity.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataMessage: {
    id: 'LaunchesQuantity.noDataMessage',
    defaultMessage: 'No launches were performed',
  },
});

@injectIntl
export class LaunchesQuantity extends Component {
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
      const { values = {} } = rawData[key][0] || {};
      const { count = 0, start, end } = values;
      const dateRange = end ? `${start} - ${end}` : start;

      return {
        name: dateRange,
        values: {
          launchesQuantity: +count,
        },
      };
    });

    while (data.length < minListLength) {
      data.unshift({
        name: '',
        values: {
          launchesQuantity: 0,
        },
      });
    }

    return {
      content: {
        result: data,
      },
    };
  };

  render() {
    const { data, interval, intl } = this.props;
    const { isContainerRefReady } = this.state;
    const isDataEmpty = !Object.keys(data).length;

    return (
      <div ref={this.containerRef} className={cx('launches-quantity')}>
        {isContainerRefReady && !isDataEmpty ? (
          <InvestigatedTrendChart
            widget={this.prepareData(data, interval)}
            interval={interval}
            container={this.containerRef.current}
            onStatusPageMode
            integerValueType
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
