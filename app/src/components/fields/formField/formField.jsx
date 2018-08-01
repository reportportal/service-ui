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
    inputWrapperClassName: PropTypes.string,
    descriptionClassName: PropTypes.string,
    label: PropTypes.string,
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    onChange: PropTypes.func,
    normalize: PropTypes.func,
    format: PropTypes.func,
    parse: PropTypes.func,
    name: PropTypes.string,
    children: PropTypes.any,
  };

  static defaultProps = {
    containerClassName: '',
    labelClassName: '',
    inputWrapperClassName: '',
    descriptionClassName: '',
    label: '',
    description: '',
    onChange: () => {},
    normalize: (value) => value,
    format: (value) => value,
    parse: (value) => value,
    name: null,
    children: null,
  };

  render() {
    const {
      containerClassName,
      labelClassName,
      inputWrapperClassName,
      descriptionClassName,
      label,
      description,
      children,
      ...rest
    } = this.props;

    return (
      <div className={cx('form-field', containerClassName)}>
        <span className={cx('form-group-label', labelClassName)}>{label}</span>
        <div className={cx('input-wrapper', inputWrapperClassName)}>
          <FieldProvider {...rest}>{children}</FieldProvider>
        </div>
        <div className={cx('form-group-description', descriptionClassName)}>
          <p>{description}</p>
        </div>
      </div>
    );
  }
}
