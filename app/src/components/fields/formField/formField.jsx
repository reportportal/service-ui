import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FieldProvider } from 'components/fields/fieldProvider';
import styles from './formField.scss';

const cx = classNames.bind(styles);

export class FormField extends PureComponent {
  static propTypes = {
    containerClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    fieldWrapperClassName: PropTypes.string,
    descriptionClassName: PropTypes.string,
    label: PropTypes.string,
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    onChange: PropTypes.func,
    normalize: PropTypes.func,
    format: PropTypes.func,
    parse: PropTypes.func,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.any,
    required: PropTypes.bool,
  };

  static defaultProps = {
    containerClassName: '',
    labelClassName: '',
    fieldWrapperClassName: '',
    descriptionClassName: '',
    label: '',
    description: '',
    onChange: () => {},
    normalize: (value) => value,
    format: (value) => value,
    parse: (value) => value,
    name: null,
    children: null,
    disabled: false,
    required: false,
  };

  render() {
    const {
      containerClassName,
      labelClassName,
      fieldWrapperClassName,
      descriptionClassName,
      label,
      description,
      children,
      required,
      ...rest
    } = this.props;
    return (
      <div className={cx('form-field', containerClassName)}>
        <span className={cx('form-group-label', labelClassName, { required })}>{label}</span>
        <div className={cx('field-wrapper', fieldWrapperClassName)}>
          <FieldProvider {...rest}>{children}</FieldProvider>
        </div>
        {description && (
          <div className={cx('form-group-description', descriptionClassName)}>
            <p>{description}</p>
          </div>
        )}
      </div>
    );
  }
}
