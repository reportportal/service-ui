import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import classNames from 'classnames/bind';
import styles from './fieldItem.scss';

const cx = classNames.bind(styles);

export class FieldItem extends Component {
  static propTypes = {
    label: PropTypes.string,
    labelClassName: PropTypes.string,
    fieldClassName: PropTypes.string,
    checked: PropTypes.bool,
    onFieldCheck: PropTypes.func,
    required: PropTypes.bool,
    withoutForm: PropTypes.bool,
    children: PropTypes.node,
  };

  static defaultProps = {
    label: '',
    labelClassName: '',
    fieldClassName: '',
    checked: false,
    onFieldCheck: null,
    required: false,
    withoutForm: false,
    children: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: props.required,
    };
  }

  render() {
    const {
      label,
      labelClassName,
      fieldClassName,
      children,
      required,
      checked,
      onFieldCheck,
      withoutForm,
      name,
      ...rest
    } = this.props;

    return (
      <div className={cx('issue-form-item')}>
        {label && (
          <span className={cx('form-group-label', labelClassName, { required })}>{label}</span>
        )}
        <div className={cx('field-wrapper', fieldClassName, { 'with-checkbox': onFieldCheck })}>
          {withoutForm ? (
            children
          ) : (
            <FieldProvider name={name} {...rest}>
              <FieldErrorHint>{children}</FieldErrorHint>
            </FieldProvider>
          )}
          {onFieldCheck && (
            <div className={cx('checkbox-wrapper')}>
              <InputCheckbox
                disabled={required}
                value={checked}
                onChange={() => onFieldCheck(name)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}
