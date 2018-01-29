import { cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './fieldErrorHint.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loginHint: {
    id: 'RegistrationForm.loginHint',
    defaultMessage: 'Login should have size from \'1\' to \'128\' symbols, latin, numeric characters, hyphen, underscore, dot.',
  },
  nameHint: {
    id: 'RegistrationForm.nameHint',
    defaultMessage: 'Full name should have size from \'3\' to \'256\' symbols, latin, cyrillic, numeric characters, hyphen, underscore, dot, space.',
  },
  passwordHint: {
    id: 'RegistrationForm.passwordHint',
    defaultMessage: 'Password should have size from \'4\' to \'25\' symbols',
  },
  confirmPasswordHint: { id: 'RegistrationForm.confirmPasswordHint', defaultMessage: 'Passwords do not match' },
});

const ErrorHint = ({ hintType, children, intl, error, active, ...rest }) => {
  const classes = cx({
    'field-error-hint': true,
    show: error && active,
    'bottom-type': hintType === 'bottom',
  });

  return (
    <div className={classes}>
      {children && cloneElement(children, { error, active, ...rest })}
      <div className={cx('hint')}>
        <div className={cx('hint-content')}>
          {error && messages[error] ? intl.formatMessage(messages[error]) : error}
        </div>
      </div>
    </div>
  );
};

ErrorHint.propTypes = {
  hintType: PropTypes.string,
  children: PropTypes.node,
  intl: intlShape.isRequired,
  error: PropTypes.string,
  active: PropTypes.bool,
};
ErrorHint.defaultProps = {
  hintType: 'bottom',
  children: null,
  error: '',
  active: false,
};

export const FieldErrorHint = injectIntl(ErrorHint);
