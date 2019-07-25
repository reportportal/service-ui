import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { dynamicFieldShape } from '../dynamicFieldShape';
import styles from './dynamicField.scss';

const cx = classNames.bind(styles);

export const DynamicField = ({
  field,
  customBlock,
  customFieldWrapper: FieldWrapper,
  withValidation,
  children,
  ...rest
}) => {
  const fieldChildren = withValidation ? <FieldErrorHint>{children}</FieldErrorHint> : children;
  const fieldCommonProps = {
    name: field.id,
    label: field.fieldName,
    required: field.required,
    disabled: field.disabled,
    customBlock,
    ...rest,
  };

  return FieldWrapper ? (
    <FieldWrapper {...fieldCommonProps}>{fieldChildren}</FieldWrapper>
  ) : (
    <FormField
      {...fieldCommonProps}
      fieldWrapperClassName={cx('field-wrapper')}
      containerClassName={cx('form-field-item')}
      labelClassName={cx('form-group-label')}
    >
      {fieldChildren}
    </FormField>
  );
};

DynamicField.propTypes = {
  field: dynamicFieldShape,
  customBlock: PropTypes.object,
  customFieldWrapper: PropTypes.func,
  withValidation: PropTypes.bool,
  children: PropTypes.any,
};

DynamicField.defaultProps = {
  field: {},
  customBlock: null,
  customFieldWrapper: null,
  withValidation: false,
  children: null,
};
