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
import FieldBottomConstraints from 'components/fields/fieldBottomConstraints/fieldBottomConstraints';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import InputPassword from 'components/inputs/inputPassword/inputPassword';
import BigButton from 'components/buttons/bigButton/bigButton';
import PropTypes from 'prop-types';
import PasswordIcon from './img/password-icon.svg';
import styles from './changePasswordForm.scss';

const cx = classNames.bind(styles);

const ChangePasswordForm = ({ submitForm, intl }) => {
  const { formatMessage } = intl;
  const placeholders = defineMessages({
    newPassword: {
      id: 'ChangePasswordForm.newPasswordPlaceholder',
      defaultMessage: 'New password',
    },
    confirmNewPassword: {
      id: 'ChangePasswordForm.newPasswordConfirmPlaceholder',
      defaultMessage: 'Confirm new password',
    },
  });
  const submitHandler = (e) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <form className={cx('change-password-form')} onSubmit={submitHandler}>
      <div className={cx('new-password-field')}>
        <FieldBottomConstraints formPath={'user.changePassForm'} fieldName={'newPassword'} text={<FormattedMessage id={'ChangePasswordForm.passwordConstraints'} defaultMessage={'4-25 symbols'} />}>
          <FieldErrorHint>
            <FieldWithIcon icon={PasswordIcon}>
              <InputPassword maxLength={'25'} placeholder={formatMessage(placeholders.newPassword)} />
            </FieldWithIcon>
          </FieldErrorHint>
        </FieldBottomConstraints>
      </div>
      <div className={cx('confirm-new-password-field')}>
        <FieldErrorHint formPath={'user.changePassForm'} fieldName={'confirmNewPassword'} >
          <FieldWithIcon icon={PasswordIcon}>
            <InputPassword maxLength={'25'} placeholder={formatMessage(placeholders.confirmNewPassword)} />
          </FieldWithIcon>
        </FieldErrorHint>
      </div>
      <div className={cx('change-password-button')}>
        <BigButton type={'submit'} color={'organish'}>
          <FormattedMessage id={'ChangePasswordForm.changePassword'} defaultMessage={'Change password'} />
        </BigButton>
      </div>
    </form>
  );
};

ChangePasswordForm.propTypes = {
  submitForm: PropTypes.func,
  intl: intlShape.isRequired,
};
ChangePasswordForm.defaultProps = {
  submitForm: () => {},
};

export default injectIntl(ChangePasswordForm);
