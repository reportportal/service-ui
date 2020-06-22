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

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { MAX_PASSING_RATE_VALUE } from '../constants';
import styles from './componentHealthCheckColorScheme.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  minPassingRateValueMessage: {
    id: 'ComponentHealthCheckChartColorScheme.minPassingRateValueMessage',
    defaultMessage: 'less than {value}%',
  },
  maxPassingRateValueMessage: {
    id: 'ComponentHealthCheckChartColorScheme.maxPassingRateValueMessage',
    defaultMessage: '{value} - 100%',
  },
});

@injectIntl
export class ComponentHealthCheckColorScheme extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    passingRate: PropTypes.number,
  };

  static defaultProps = {
    passingRate: null,
  };

  render() {
    const { intl, passingRate } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('item')}>
          <div className={cx('scheme-wrap', 'scheme-wrap--failed')} />
          <span className={cx('scheme-message')}>
            {intl.formatMessage(messages.minPassingRateValueMessage, { value: passingRate - 1 })}
          </span>
        </div>
        <div className={cx('item')}>
          <div
            className={cx('scheme-wrap', 'scheme-wrap--passed', {
              'scheme-wrap--passed-max': passingRate === MAX_PASSING_RATE_VALUE,
            })}
          />
          <span className={cx('scheme-message')}>
            {passingRate === MAX_PASSING_RATE_VALUE
              ? '100%'
              : intl.formatMessage(messages.maxPassingRateValueMessage, { value: passingRate })}
          </span>
        </div>
      </div>
    );
  }
}
