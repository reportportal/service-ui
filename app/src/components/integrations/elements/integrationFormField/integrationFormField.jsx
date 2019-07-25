import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import styles from './integrationFormField.scss';

const cx = classNames.bind(styles);

export const IntegrationFormField = ({ lineAlign, children, ...rest }) => (
  <FormField
    containerClassName={cx('form-field-container', { 'line-align': lineAlign })}
    fieldWrapperClassName={cx('form-field-wrapper')}
    labelClassName={cx('label')}
    {...rest}
  >
    {children}
  </FormField>
);

IntegrationFormField.propTypes = {
  children: PropTypes.node.isRequired,
  lineAlign: PropTypes.bool,
};

IntegrationFormField.defaultProps = {
  lineAlign: false,
};
