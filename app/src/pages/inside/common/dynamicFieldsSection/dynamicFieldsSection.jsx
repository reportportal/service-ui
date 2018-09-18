import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { TEXT_TYPE, ARRAY_TYPE, DROPDOWN_TYPE, DATE_TYPE } from 'common/constants/fieldTypes';
import { TextField, DropdownField, DateField, ArrayField } from './fields';
import styles from './dynamicFieldsSection.scss';

const cx = classNames.bind(styles);

@injectIntl
export class DynamicFieldsSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    fields: PropTypes.array,
    customBlock: PropTypes.func,
  };

  static defaultProps = {
    fields: [],
    customBlock: null,
  };

  fieldsMap = {
    [TEXT_TYPE]: TextField,
    [DROPDOWN_TYPE]: DropdownField,
    [DATE_TYPE]: DateField,
    [ARRAY_TYPE]: ArrayField,
  };

  createFields = () => {
    const { fields = [], customBlock } = this.props;

    return fields.map((field) => {
      const FieldComponent = this.fieldsMap[field.type];

      return <FieldComponent key={field.id} field={field} customBlock={customBlock} />;
    });
  };

  render() {
    return <div className={cx('dynamic-fields-section')}>{this.createFields()}</div>;
  }
}
