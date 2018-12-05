import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import 'react-datepicker/dist/react-datepicker.css';
import {
  TIME_INTERVAL,
  DATE_FORMAT,
  TIME_FORMAT,
  TIME_DATE_FORMAT,
} from 'common/constants/timeDateFormat';
import styles from './inputTimeDateRange.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  customRange: {
    id: 'InputTimeDateRange.customRange',
    defaultMessage: 'Custom Range',
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
export class InputTimeDateRange extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    presets: PropTypes.array,
    value: PropTypes.object,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    withoutDynamic: PropTypes.bool,
  };

  static defaultProps = {
    presets: [],
    value: {},
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    withoutDynamic: false,
  };

  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  onClickValueBlock = (e) => {
    this.setState({ opened: !this.state.opened });
    e.stopPropagation();
    this.state.opened ? this.props.onBlur() : this.props.onFocus();
  };
  onClickPreset = (value) => {
    this.setState({ opened: false });
    this.props.onChange(value);
  };

  onClickConditionItem = (condition) => {
    if (condition.value !== this.props.value.condition) {
      this.setState({ opened: false });
      this.props.onChange({ value: this.props.value.value, condition: condition.value });
    }
  };

  setRef = (node) => {
    this.node = node;
  };

  handleClickOutside = (e) => {
    if (!this.node.contains(e.target)) {
      this.setState({ opened: false });
      this.props.onBlur();
    }
  };

  handleChangeFrom = (m) => {
    this.props.onChange({
      start: moment(m).valueOf(),
      end: this.props.value.end,
      dynamic: this.props.value.dynamic,
    });
  };

  handleChangeTo = (m) => {
    this.props.onChange({
      start: this.props.value.start,
      end: moment(m).valueOf(),
      dynamic: this.props.value.dynamic,
    });
  };

  handleChangeDynamic = (e) => {
    this.props.onChange({
      start: this.props.value.start,
      end: this.props.value.end,
      dynamic: e.target.checked,
    });
  };

  render() {
    const { intl, presets, value, withoutDynamic } = this.props;

    return (
      <div className={cx('input-time-date-range')} ref={this.setRef}>
        <input
          readOnly
          value={`${moment(value.start).format(TIME_DATE_FORMAT)} - ${moment(value.end).format(
            TIME_DATE_FORMAT,
          )}`}
          className={cx('current-value')}
          onClick={this.onClickValueBlock}
        />
        <div className={cx('menu', { visible: this.state.opened })}>
          <div className={cx('presets')}>
            {presets.map((preset, key) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={key}
                className={cx('preset', {
                  active:
                    value.start === preset.value.start &&
                    value.end === preset.value.end &&
                    value.dynamic === preset.value.dynamic,
                })}
                onClick={() => {
                  this.onClickPreset(preset.value);
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
                selected={moment(value.start)}
                startDate={moment(value.start)}
                endDate={moment(value.end)}
                onChange={this.handleChangeFrom}
                showTimeSelect
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
                selected={moment(value.end)}
                startDate={moment(value.start)}
                endDate={moment(value.end)}
                onChange={this.handleChangeTo}
                showTimeSelect
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
              <InputCheckbox value={value.dynamic} onChange={this.handleChangeDynamic}>
                {intl.formatMessage(messages.dynamicUpdate)}
              </InputCheckbox>
              {value.dynamic && (
                <span className={cx('dynamic-update-hint')}>
                  {intl.formatMessage(messages.dynamicUpdateHint)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
