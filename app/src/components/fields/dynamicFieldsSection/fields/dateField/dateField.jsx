import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { DynamicField } from '../../dynamicField';
import styles from './dateField.scss';

const cx = classNames.bind(styles);

export const DATE_FORMAT = 'YYYY-MM-DD';

export class DateField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    customBlock: PropTypes.object,
  };

  static defaultProps = {
    customBlock: {},
  };

  parseDateValue = (value) => value && moment(value).format(DATE_FORMAT);

  render() {
    const { field, customBlock } = this.props;
    return (
      <DynamicField field={field} customBlock={customBlock} parse={this.parseDateValue}>
        <DatePicker
          className={cx('date-input', { 'with-custom-block': customBlock })}
          fixedHeight
          dateFormat={DATE_FORMAT}
        />
      </DynamicField>
    );
  }
}
