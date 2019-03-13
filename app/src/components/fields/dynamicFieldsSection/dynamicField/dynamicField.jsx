import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import styles from './dynamicField.scss';

const cx = classNames.bind(styles);

export const DynamicField = ({
  field,
  customBlock,
  customFieldWrapper: FieldWrapper,
  children,
  ...rest
}) =>
  FieldWrapper ? (
    <FieldWrapper
      name={field.id}
      label={field.fieldName}
      required={field.required}
      disabled={field.disabled}
      customBlock={customBlock}
      {...rest}
    >
      {children}
    </FieldWrapper>
  ) : (
    <FormField
      name={field.id}
      label={field.fieldName}
      required={field.required}
      disabled={field.disabled}
      fieldWrapperClassName={cx('field-wrapper')}
      containerClassName={cx('form-field-item')}
      labelClassName={cx('form-group-label')}
      customBlock={customBlock}
      {...rest}
    >
      {children}
    </FormField>
  );

DynamicField.propTypes = {
  field: PropTypes.object,
  customBlock: PropTypes.object,
  customFieldWrapper: PropTypes.func,
  children: PropTypes.any,
};

DynamicField.defaultProps = {
  field: {},
  customBlock: null,
  customFieldWrapper: null,
  children: null,
};
