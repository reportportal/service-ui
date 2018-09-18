import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { Input } from 'components/inputs/input';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FIELD_TYPES_MAP, STRING_FIELDS, DATE_FORMAT } from './constants';
import { FieldItem } from './fieldItem';
import styles from './dynamicFieldsBlock.scss';

const cx = classNames.bind(styles);

@injectIntl
export class DynamicFieldsBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    fields: PropTypes.array,
    onFieldCheck: PropTypes.func,
    withFormValidation: PropTypes.bool,
    customClasses: PropTypes.shape({
      labelClassName: PropTypes.string,
      fieldClassName: PropTypes.string,
      dateFieldClassName: PropTypes.string,
    }),
    mobileDisabled: PropTypes.bool,
  };

  static defaultProps = {
    fields: [],
    customClasses: {
      labelClassName: '',
      fieldClassName: '',
      dateFieldClassName: '',
    },
    onFieldCheck: null,
    withFormValidation: false,
    mobileDisabled: false,
  };

  getInputOptions = (values) =>
    ((values[0] && values) || []).map((item) => ({ value: item.valueId, label: item.valueName }));

  switchFieldType = (field) => {
    const { onFieldCheck, customClasses, mobileDisabled } = this.props;
    switch (field.fieldType) {
      case FIELD_TYPES_MAP.stringFields[field.fieldType]:
        return (
          <FieldItem
            name={field.id}
            type={field.fieldType === STRING_FIELDS.number ? 'number' : 'text'}
            labelClassName={customClasses.labelClassName}
            fieldClassName={customClasses.fieldClassName}
            onFieldCheck={onFieldCheck}
            checked={field.checked}
            label={field.fieldName}
            required={field.required}
            format={this.formatInputValue}
            parse={
              field.definedValues && field.definedValues.length
                ? this.parseDropdownValue
                : this.parseInputValue
            }
            disabled={field.fieldType === STRING_FIELDS.issuetype || null}
          >
            {(field.definedValues &&
              field.definedValues.length && (
                <InputDropdown
                  mobileDisabled={mobileDisabled}
                  options={this.getInputOptions(field.definedValues)}
                />
              )) || <Input mobileDisabled={mobileDisabled} />}
          </FieldItem>
        );
      case FIELD_TYPES_MAP.selectFields[field.fieldType]:
        return (
          <FieldItem
            name={field.id}
            labelClassName={customClasses.labelClassName}
            fieldClassName={customClasses.fieldClassName}
            onFieldCheck={onFieldCheck}
            checked={field.checked}
            label={field.fieldName}
            required={field.required}
            format={this.formatInputValue}
            parse={this.parseDropdownValue}
          >
            <InputDropdown
              mobileDisabled={mobileDisabled}
              options={this.getInputOptions(field.definedValues)}
            />
          </FieldItem>
        );
      case FIELD_TYPES_MAP.dateFields[field.fieldType]:
        return (
          <FieldItem
            name={field.id}
            labelClassName={customClasses.labelClassName}
            fieldClassName={customClasses.fieldClassName}
            onFieldCheck={onFieldCheck}
            checked={field.checked}
            label={field.fieldName}
            required={field.required}
            format={this.formatInputValue}
            parse={this.parseDateValue}
          >
            <DatePicker
              className={cx('date-input', customClasses.dateFieldClassName, {
                'with-checkbox': onFieldCheck,
              })}
              fixedHeight
              dateFormat={DATE_FORMAT}
            />
          </FieldItem>
        );
      case FIELD_TYPES_MAP.arrayFields[field.fieldType]:
        return (
          <FieldItem
            name={field.id}
            labelClassName={customClasses.labelClassName}
            fieldClassName={customClasses.fieldClassName}
            onFieldCheck={onFieldCheck}
            checked={field.checked}
            label={field.fieldName}
            required={field.required}
            format={field.definedValues.length ? this.formatTags : this.formatInputValue}
            parse={field.definedValues.length ? this.parseTags : this.parseInputValue}
          >
            {(field.definedValues.length && (
              <InputTagsSearch
                mobileDisabled={mobileDisabled}
                removeSelected
                multi
                options={this.getInputOptions(field.definedValues)}
              />
            )) || <Input mobileDisabled={mobileDisabled} />}
          </FieldItem>
        );
      default:
        break;
    }
    return <div />;
  };

  parseDateValue = (value) => value && [moment(value).format(DATE_FORMAT)];

  formatInputValue = (value) => value && value[0];

  parseInputValue = (value) => [value || ''];

  parseDropdownValue = (value) => value && [value];

  formatTags = (tags, name) => {
    const field = this.props.fields.find((item) => item.id === name);
    const values = [];
    tags &&
      tags.forEach((item) => {
        values.push(field.definedValues.find((defValue) => defValue.valueName === item));
      });
    return this.getInputOptions(values);
  };

  parseTags = (options) => (options && options.map((option) => option.label)) || undefined;

  createFields = () => {
    const { fields } = this.props;

    return ((fields && fields) || []).map((field) => {
      const FieldComponent = this.switchFieldType(field);

      return <Fragment key={field.id}>{FieldComponent}</Fragment>;
    });
  };

  render() {
    return <div className={cx('dynamic-fields-block')}>{this.createFields()}</div>;
  }
}
