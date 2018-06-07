import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { FieldProvider } from 'components/fields/fieldProvider';
import styles from './formField.scss';

const cx = classNames.bind(styles);

export class FormField extends PureComponent {
  static propTypes = {
    containerClasses: PropTypes.string,
    labelClasses: PropTypes.string,
    inputWrapperClasses: PropTypes.string,
    descriptionClasses: PropTypes.string,
    label: PropTypes.string,
    description: PropTypes.string,
    onChange: PropTypes.func,
    normalize: PropTypes.func,
    formatValue: PropTypes.func,
    parseValue: PropTypes.func,
    fieldName: PropTypes.string,
    children: PropTypes.any,
  };

  static defaultProps = {
    containerClasses: '',
    labelClasses: '',
    inputWrapperClasses: '',
    descriptionClasses: '',
    label: '',
    description: '',
    onChange: () => {},
    normalize: (value) => value,
    formatValue: (value) => value,
    parseValue: (value) => value,
    fieldName: null,
    children: null,
  };

  render() {
    const {
      containerClasses,
      labelClasses,
      inputWrapperClasses,
      descriptionClasses,
      label,
      description,
      onChange,
      normalize,
      formatValue,
      parseValue,
      fieldName,
      children,
    } = this.props;

    return (
      <div className={cx('form-group-container', `${containerClasses}`)}>
        <span className={cx('form-group-column', 'form-group-label', `${labelClasses}`)}>
          {label}
        </span>
        <div className={cx('form-group-column', `${inputWrapperClasses}`)}>
          <FieldProvider
            name={fieldName}
            normalize={normalize}
            format={formatValue}
            parse={parseValue}
            onChange={onChange}
          >
            {children}
          </FieldProvider>
        </div>
        <div className={cx('form-group-column', 'form-group-description', `${descriptionClasses}`)}>
          <div className={cx('form-group-help-block')}>
            <p>{Parser(description)}</p>
          </div>
        </div>
      </div>
    );
  }
}
