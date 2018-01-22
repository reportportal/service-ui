import { cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { props, state } from 'cerebral/tags';
import { field } from '@cerebral/forms';
import { checkInvalidField } from 'common/utils';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './fieldErrorHint.scss';

const cx = classNames.bind(styles);

const FieldErrorHint = (
    { formPath, fieldName, formField,
      formShowErrors, isFocus, errorMessageId, errorMessage, hintType, children, intl },
  ) => {
  const classes = cx({
    'field-error-hint': true,
    show: checkInvalidField(formField, formShowErrors) && isFocus,
    'bottom-type': hintType === 'bottom',
  });
  const messages = defineMessages({
    loginHint: { id: 'RegistrationForm.loginHint', defaultMessage: 'Login should have size from \'1\' to \'128\' symbols, latin, numeric characters, hyphen, underscore, dot.' },
    nameHint: { id: 'RegistrationForm.nameHint', defaultMessage: 'Full name should have size from \'3\' to \'256\' symbols, latin, cyrillic, numeric characters, hyphen, underscore, dot, space.' },
    passwordHint: { id: 'RegistrationForm.passwordHint', defaultMessage: 'Password should have size from \'4\' to \'25\' symbols' },
    confirmPasswordHint: { id: 'RegistrationForm.confirmPasswordHint', defaultMessage: 'Passwords do not match' },
  });

  return (
    <div className={classes}>
      {children && cloneElement(children, { formPath, fieldName })}
      <div className={cx('hint')}>
        <div className={cx('hint-content')}>
          {errorMessageId ? intl.formatMessage(messages[errorMessageId]) : errorMessage}
        </div>
      </div>
    </div>
  );
};

FieldErrorHint.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  formField: PropTypes.object,
  formShowErrors: PropTypes.bool,
  isFocus: PropTypes.bool,
  errorMessageId: PropTypes.string,
  errorMessage: PropTypes.string,
  hintType: PropTypes.string,
  children: PropTypes.node,
  intl: intlShape.isRequired,
};
FieldErrorHint.defaultProps = {
  formPath: '',
  fieldName: '',
  formField: {},
  formShowErrors: false,
  isFocus: false,
  errorMessageId: '',
  errorMessage: '',
  hintType: 'bottom',
  children: null,
};

export default Utils.connectToState({
  formField: field(state`${props`formPath`}.${props`fieldName`}`),
  formShowErrors: state`${props`formPath`}.showErrors`,
  isFocus: state`${props`formPath`}.${props`fieldName`}.isFocus`,
  errorMessageId: state`${props`formPath`}.${props`fieldName`}.errorMessageId`,
  errorMessage: state`${props`formPath`}.${props`fieldName`}.errorMessage`,
}, injectIntl(FieldErrorHint));
