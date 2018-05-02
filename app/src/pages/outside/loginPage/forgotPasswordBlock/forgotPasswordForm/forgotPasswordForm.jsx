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

import { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { validate, fetch } from 'common/utils';
import EmailIcon from './img/email-icon-inline.svg';
import styles from './forgotPasswordForm.scss';

const cx = classNames.bind(styles);

const placeholders = defineMessages({
  email: {
    id: 'ForgotPasswordForm.emailPlaceholder',
    defaultMessage: 'Enter email',
  },
});

@withRouter
@reduxForm({
  form: 'forgotPassword',
  validate: ({ email }) => ({
    email: !validate.email(email) && 'emailHint',
  }),
})
@injectIntl
export class ForgotPasswordForm extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    intl: {},
  };

  submitForm = ({ email }) => {
    fetch('api/v1/user/password/restore', {
      method: 'post',
      data: {
        email,
      },
    }).then(() => this.props.history.push('/login'));
  };

  render() {
    const { intl, handleSubmit } = this.props;
    const { formatMessage } = intl;
    return (
      <form className={cx('forgot-password-form')} onSubmit={handleSubmit(this.submitForm)}>
        <div className={cx('email-field')}>
          <FieldProvider name="email">
            <FieldErrorHint>
              <InputOutside icon={EmailIcon} placeholder={formatMessage(placeholders.email)} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('forgot-password-buttons-container')}>
          <div className={cx('forgot-password-button')}>
            <Link to="/login" className={cx('button-link')}>
              <BigButton type={'button'} color={'gray-60'}>
                <FormattedMessage id={'ForgotPasswordForm.cancel'} defaultMessage={'Cancel'} />
              </BigButton>
            </Link>

          </div>
          <div className={cx('forgot-password-button')}>
            <BigButton type={'submit'} color={'organish'}>
              <FormattedMessage id={'ForgotPasswordForm.sendEmail'} defaultMessage={'Send email'} />
            </BigButton>
          </div>
        </div>
      </form>
    );
  }
}
