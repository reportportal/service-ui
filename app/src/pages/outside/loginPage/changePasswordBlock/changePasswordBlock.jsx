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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { withRouter, Redirect } from 'react-router-dom';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ChangePasswordForm } from './changePasswordForm';
import styles from './changePasswordBlock.scss';

const cx = classNames.bind(styles);

@withRouter
export class ChangePasswordBlock extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      hash: PropTypes.string,
      pathname: PropTypes.string,
      query: PropTypes.object,
      search: PropTypes.string,
    }).isRequired,
  };
  state = {
    loading: true,
    valid: true,
  };
  componentDidMount() {
    fetch(URLS.userPasswordResetToken(this.props.location.query.reset), {
      method: 'get',
    }).then((response) => {
      this.setState({ valid: response.is, loading: false });
    });
  }
  render() {
    // eslint-disable-next-line no-nested-ternary
    return this.state.loading ? (
      <SpinningPreloader />
    ) : this.state.valid ? (
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
    ) : (
      <Redirect to={'/login'} />
    );
  }
}
