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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { fetch, connectRouter } from 'common/utils';
import { URLS } from 'common/urls';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { LOGIN_PAGE } from 'controllers/pages';
import { isAuthorizedSelector } from 'controllers/auth';
import { ChangePasswordForm } from './changePasswordForm';

import styles from './changePasswordBlock.scss';

const cx = classNames.bind(styles);

@connectRouter(({ reset }) => ({ reset }))
@connect(
  (state) => ({
    authorized: isAuthorizedSelector(state),
  }),
  (dispatch) => ({
    redirectToLoginPage: () => dispatch(rfrRedirect({ type: LOGIN_PAGE })),
  }),
)
export class ChangePasswordBlock extends PureComponent {
  static propTypes = {
    reset: PropTypes.string,
    redirectToLoginPage: PropTypes.func.isRequired,
  };
  static defaultProps = {
    reset: '',
  };
  state = {
    loading: true,
    valid: true,
  };
  componentDidMount() {
    fetch(URLS.userPasswordResetToken(this.props.reset), {
      method: 'get',
    }).then((response) => {
      this.setState({ valid: response.is, loading: false });
    });
  }
  render() {
    if (!this.state.loading && !this.state.valid) {
      this.props.redirectToLoginPage();
    }

    // eslint-disable-next-line no-nested-ternary
    return this.state.loading ? (
      <SpinningPreloader />
    ) : (
      <div className={cx('change-password-block')}>
        <span className={cx('change-password-msg')}>
          <span className={cx('big')}>
            <FormattedMessage
              id={'ChangePasswordBlock.changePass'}
              defaultMessage={'Change password'}
            />
          </span>
          <br />
          <FormattedMessage
            id={'ChangePasswordBlock.enterEmail'}
            defaultMessage={'enter new password and confirm it'}
          />
        </span>
        <ChangePasswordForm />
      </div>
    );
  }
}
