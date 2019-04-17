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
import PropTypes from 'prop-types';
import { referenceDictionary } from 'common/utils';
import { FormattedMessage } from 'react-intl';
import { RegistrationPageSection } from './registrationPageSection';
import { RegistrationFailBlock } from './registrationFailBlock';
import { RegistrationForm } from './registrationForm';
import styles from './registrationPage.scss';

const cx = classNames.bind(styles);

export const RegistrationPage = ({ tokenActive, tokenProvided, email, onRegistrationSubmit }) => {
  const backgroundClasses = {
    background: true,
    failed: !tokenProvided || !tokenActive,
  };

  return (
    <div className={cx('registration-page')}>
      <div className={cx('registration-page-content')}>
        <div className={cx(backgroundClasses)} />
        <a href={referenceDictionary.rpLanding} target="_blank">
          <div className={cx('logo')} />
        </a>
        <RegistrationPageSection left>
          {tokenProvided &&
            tokenActive && (
              <div className={cx('couple-minutes')}>
                <FormattedMessage
                  id={'RegistrationPage.coupleMinutes'}
                  defaultMessage={'It should only take a couple of minutes to get started'}
                />
              </div>
            )}
        </RegistrationPageSection>
        <RegistrationPageSection failed={!tokenActive || !tokenProvided}>
          {tokenProvided && tokenActive ? (
            <div>
              <span className={cx('welcome-msg')}>
                <span className={cx('big')}>
                  <FormattedMessage id={'RegistrationPage.welcome'} defaultMessage={'Welcome,'} />
                </span>
                <br />
                <FormattedMessage
                  id={'RegistrationPage.registration'}
                  defaultMessage={'complete the registration form'}
                />
              </span>
              <RegistrationForm email={email} submitForm={onRegistrationSubmit} />
            </div>
          ) : (
            <TokenErrorSection tokenProvided={tokenProvided} />
          )}
        </RegistrationPageSection>
      </div>
    </div>
  );
};

RegistrationPage.propTypes = {
  tokenActive: PropTypes.bool,
  tokenProvided: PropTypes.bool,
  email: PropTypes.string,
  onRegistrationSubmit: PropTypes.func,
};
RegistrationPage.defaultProps = {
  tokenActive: false,
  tokenProvided: false,
  email: '',
  onRegistrationSubmit: () => {},
};

const TokenErrorSection = ({ tokenProvided }) => (
  <RegistrationFailBlock>
    <span className={cx('fail-msg')}>
      <span className={cx('big')}>
        <FormattedMessage id={'RegistrationPage.oops'} defaultMessage={'Oops,'} />
      </span>
      <br />
      {tokenProvided ? (
        <FormattedMessage
          id={'RegistrationPage.tokenExpired'}
          defaultMessage={'this invitation has expired or already used'}
        />
      ) : (
        <FormattedMessage
          id={'RegistrationPage.tokenNotProvided'}
          defaultMessage={'invitation token was not provided in URL parameters'}
        />
      )}
    </span>
    <div className={cx('visit-rp')}>
      <FormattedMessage id={'RegistrationPage.visit'} defaultMessage={'Visit '} />
      <a className={cx('backlink')} href={referenceDictionary.rpLanding}>
        ReportPortal.io
      </a>
    </div>
  </RegistrationFailBlock>
);

TokenErrorSection.propTypes = {
  tokenProvided: PropTypes.bool,
};
TokenErrorSection.defaultProps = {
  tokenProvided: false,
};
