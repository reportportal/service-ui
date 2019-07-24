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
    customBlock: PropTypes.shape({
      wrapperClassName: PropTypes.string,
      node: PropTypes.element,
    }),
    label: PropTypes.string,
    onChange: PropTypes.func,
    normalize: PropTypes.func,
    format: PropTypes.func,
    parse: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.any,
    required: PropTypes.bool,
    withoutProvider: PropTypes.bool,
  };

  static defaultProps = {
    containerClassName: '',
    labelClassName: '',
    fieldWrapperClassName: '',
    customBlock: null,
    label: '',
    onChange: () => {},
    normalize: (value) => value,
    format: (value) => value,
    parse: (value) => value,
    disabled: false,
    children: null,
    required: false,
    withoutProvider: false,
  };

  render() {
    const {
      containerClassName,
      labelClassName,
      fieldWrapperClassName,
      customBlock,
      label,
      children,
      required,
      withoutProvider,
      ...rest
    } = this.props;
    return (
      <div className={cx('form-field', containerClassName)}>
        <span className={cx('form-group-label', labelClassName, { required })}>{label}</span>
        <div className={cx('field-wrapper', fieldWrapperClassName)}>
          {withoutProvider ? children : <FieldProvider {...rest}>{children}</FieldProvider>}
        </div>
        {customBlock && (
          <div className={cx('custom-block', customBlock.wrapperClassName)}>{customBlock.node}</div>
        )}
      </div>
    );
  }
}
