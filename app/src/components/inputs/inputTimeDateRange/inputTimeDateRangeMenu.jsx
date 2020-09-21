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
import DatePicker from 'react-datepicker';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import 'react-datepicker/dist/react-datepicker.css';
import { TIME_INTERVAL, DATE_FORMAT, TIME_FORMAT } from 'common/constants/timeDateFormat';
import isEqual from 'fast-deep-equal';
import styles from './inputTimeDateRange.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  customRange: {
    id: 'InputTimeDateRange.customRange',
    defaultMessage: 'Custom range',
  },
  from: {
    id: 'InputTimeDateRange.from',
    defaultMessage: 'From',
  },
  to: {
    id: 'InputTimeDateRange.to',
    defaultMessage: 'To',
  },
  time: {
    id: 'InputTimeDateRange.time',
    defaultMessage: 'Time',
  },
  dynamicUpdate: {
    id: 'InputTimeDateRange.dynamicUpdate',
    defaultMessage: 'Dynamic update',
  },
  dynamicUpdateHint: {
    id: 'InputTimeDateRange.dynamicUpdateHint',
    defaultMessage: 'Your time range will be updated every day',
  },
});

@injectIntl
export class InputTimeDateRangeMenu extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    opened: PropTypes.bool.isRequired,
    defaultDisplayStartDate: PropTypes.number,
    defaultDisplayEndDate: PropTypes.number,
    onClickPreset: PropTypes.func,
    handleChangeFrom: PropTypes.func,
    handleChangeTo: PropTypes.func,
    handleChangeDynamic: PropTypes.func,
    presets: PropTypes.array,
    value: PropTypes.object,
    withoutDynamic: PropTypes.bool,
    withoutTimeSelect: PropTypes.bool,
    component: PropTypes.element,
    popperClassName: PropTypes.string,
  };

  static defaultProps = {
    presets: [],
    value: {},
    onClickPreset: () => {},
    handleChangeFrom: () => {},
    handleChangeTo: () => {},
    handleChangeDynamic: () => {},
    defaultDisplayStartDate: null,
    defaultDisplayEndDate: null,
    withoutDynamic: false,
    withoutTimeSelect: false,
    component: null,
    popperClassName: undefined,
  };

  render() {
    const {
      intl,
      presets,
      value,
      withoutDynamic,
      withoutTimeSelect,
      popperClassName,
      opened,
      onClickPreset,
      handleChangeFrom,
      handleChangeTo,
      handleChangeDynamic,
      defaultDisplayStartDate,
      defaultDisplayEndDate,
      component,
    } = this.props;
    const displayStartDate = moment((value && value.start) || defaultDisplayStartDate);
    const displayEndDate = moment((value && value.end) || defaultDisplayEndDate);

    return (
      <div className={cx('menu', { visible: opened })}>
        <div className={cx('presets')}>
          {presets.map((preset, key) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={key}
              className={cx('preset', {
                active: isEqual(preset.getValue(), value),
              })}
              onClick={() => {
                onClickPreset(preset);
              }}
            >
              {preset.label}
            </div>
          ))}
        </div>
        <div className={cx('custom')}>
          <span className={cx('custom-label')}>{intl.formatMessage(messages.customRange)}</span>
          <div className={cx('from')}>
            <span className={cx('from-label')}>{intl.formatMessage(messages.from)}</span>
            <DatePicker
              className={cx('from-input')}
              fixedHeight
              selectsStart
              popperClassName={popperClassName}
              selected={displayStartDate}
              startDate={displayStartDate}
              endDate={displayEndDate}
              onChange={handleChangeFrom}
              showTimeSelect={!withoutTimeSelect}
              timeFormat={TIME_FORMAT}
              timeIntervals={TIME_INTERVAL}
              dateFormat={DATE_FORMAT}
              timeCaption={intl.formatMessage(messages.time)}
              popperModifiers={{
                preventOverflow: {
                  enabled: true,
                  escapeWithReference: false,
                  boundariesElement: 'viewport',
                },
              }}
            />
          </div>
          <div className={cx('to')}>
            <span className={cx('to-label')}>{intl.formatMessage(messages.to)}</span>
            <DatePicker
              className={cx('to-input')}
              fixedHeight
              selectsEnd
              popperClassName={popperClassName}
              selected={displayEndDate}
              startDate={displayStartDate}
              endDate={displayEndDate}
              onChange={handleChangeTo}
              showTimeSelect={!withoutTimeSelect}
              timeFormat={TIME_FORMAT}
              timeIntervals={TIME_INTERVAL}
              dateFormat={DATE_FORMAT}
              timeCaption={intl.formatMessage(messages.time)}
              popperModifiers={{
                preventOverflow: {
                  enabled: true,
                  escapeWithReference: false,
                  boundariesElement: 'viewport',
                },
              }}
            />
          </div>
        </div>
        {!withoutDynamic && (
          <div className={cx('dynamic-update')}>
            <InputCheckbox value={value.dynamic} onChange={handleChangeDynamic}>
              {intl.formatMessage(messages.dynamicUpdate)}
            </InputCheckbox>
            {value.dynamic && (
              <span className={cx('dynamic-update-hint')}>
                {intl.formatMessage(messages.dynamicUpdateHint)}
              </span>
            )}
          </div>
        )}
        {component}
      </div>
    );
  }
}
