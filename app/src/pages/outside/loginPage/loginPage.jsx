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
import PropTypes from 'prop-types';
import { referenceDictionary } from 'common/utils';
import { withRouter } from 'react-router-dom';
import styles from './loginPage.scss';
import { LoginPageSection } from './loginPageSection';
import { SocialSection } from './socialSection';
import { LoginBlock } from './loginBlock';
import { ForgotPasswordBlock } from './forgotPasswordBlock';
import { ChangePasswordBlock } from './changePasswordBlock';
import { ServiceVersionsBlock } from './serviceVersionsBlock';

const cx = classNames.bind(styles);

@withRouter
export class LoginPage extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      hash: PropTypes.string,
      pathname: PropTypes.string,
      query: PropTypes.object,
      search: PropTypes.string,
    }).isRequired,
  };
  render() {
    let currentBlock = <LoginBlock />;
    if (this.props.location.query.forgotPass) {
      currentBlock = <ForgotPasswordBlock />;
    }
    if (this.props.location.query.reset) {
      currentBlock = <ChangePasswordBlock />;
    }
    return (
      <div className={cx('login-page')}>
        <div className={cx('login-page-content')}>
          <div className={cx('background')} />
          <a href={referenceDictionary.rpLanding} target="_blank">
            <div className={cx('logo')} />
          </a>
          <LoginPageSection left>
            <SocialSection />
          </LoginPageSection>
          <LoginPageSection>
            {currentBlock}
            <ServiceVersionsBlock />
          </LoginPageSection>
        </div>
      </div>
    );
  }
}
