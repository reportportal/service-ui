/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { referenceDictionary } from 'common/utils';
import { defineMessages, FormattedMessage } from 'react-intl';
import { BlockHeader } from '../common/pageBlockContainer/blockHeader';
import { RegistrationPageSection } from './registrationPageSection';
import { RegistrationFailBlock } from './registrationFailBlock';
import { RegistrationForm } from './registrationForm';
import styles from './registrationPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  welcome: {
    id: 'RegistrationPage.welcome',
    defaultMessage: 'Welcome,',
  },
  registration: {
    id: 'RegistrationPage.registration',
    defaultMessage: 'complete the registration form',
  },
});

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
          {tokenProvided && tokenActive && (
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
              <BlockHeader header={messages.welcome} hint={messages.registration} />
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
