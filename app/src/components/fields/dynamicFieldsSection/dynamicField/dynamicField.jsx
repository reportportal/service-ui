import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import styles from './dynamicField.scss';

const cx = classNames.bind(styles);

export class DynamicField extends Component {
  static propTypes = {
    field: PropTypes.object,
    customBlock: PropTypes.func,
    children: PropTypes.any,
  };

  static defaultProps = {
    field: {},
    customBlock: null,
    children: null,
  };

  getCustomBlockConfig = (field) => {
    if (field.description) {
      return { node: <p>{field.description}</p> };
    }

    if (this.props.customBlock) {
      return this.props.customBlock(field);
    }

    return null;
  };

  render() {
    const { field, customBlock, children, ...rest } = this.props;

    return (
      <FormField
        name={field.id}
        label={field.label}
        required={field.required}
        fieldWrapperClassName={cx('field-wrapper', { 'with-custom-block': customBlock })}
        containerClassName={cx('form-field-item')}
        labelClassName={cx('form-group-label')}
        customBlock={this.getCustomBlockConfig(customBlock)}
        {...rest}
      >
        {children}
      </FormField>
    );
  }
}
