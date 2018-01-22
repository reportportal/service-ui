/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import classNames from 'classnames/bind';
import FieldWithIcon from 'components/fields/fieldWithIcon/fieldWithIcon';
import FieldErrorHint from 'components/fields/fieldErrorHint/fieldErrorHint';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { signal } from 'cerebral/tags';
import { form } from '@cerebral/forms';
import Input from 'components/inputs/input/input';
import BigButton from 'components/buttons/bigButton/bigButton';
import PropTypes from 'prop-types';
import EmailIcon from './img/email-icon.svg';
import styles from './forgotPasswordForm.scss';

const cx = classNames.bind(styles);

const ForgotPasswordForm = ({ submitForm, cancel, intl }) => {
  const { formatMessage } = intl;
  const placeholders = defineMessages({
    email: {
      id: 'ForgotPasswordForm.emailPlaceholder',
      defaultMessage: 'Enter email',
    },
  });
  const submitHandler = (e) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <form className={cx('forgot-password-form')} onSubmit={submitHandler}>
      <div className={cx('email-field')}>
        <FieldErrorHint formPath={'user.forgotPassForm'} fieldName={'email'} >
          <FieldWithIcon icon={EmailIcon}>
            <Input placeholder={formatMessage(placeholders.email)} />
          </FieldWithIcon>
        </FieldErrorHint>
      </div>
      <div className={cx('forgot-password-buttons-container')}>
        <div className={cx('forgot-password-button')}>
          <BigButton type={'button'} color={'gray-60'} onClick={() => cancel()}>
            <FormattedMessage id={'ForgotPasswordForm.cancel'} defaultMessage={'Cancel'} />
          </BigButton>
        </div>
        <div className={cx('forgot-password-button')}>
          <BigButton type={'submit'} color={'organish'}>
            <FormattedMessage id={'ForgotPasswordForm.sendEmail'} defaultMessage={'Send email'} />
          </BigButton>
        </div>
      </div>
    </form>
  );
};

ForgotPasswordForm.propTypes = {
  submitForm: PropTypes.func,
  cancel: PropTypes.func,
  intl: intlShape.isRequired,
};
ForgotPasswordForm.defaultProps = {
  submitForm: () => {},
  cancel: () => {},
};

export default Utils.connectToState({
  submitForm: signal`user.forgotPass`,
  cancel: signal`user.loginRoute`,
}, injectIntl(ForgotPasswordForm));
