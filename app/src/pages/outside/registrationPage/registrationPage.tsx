/*
 * Copyright 2026 EPAM Systems
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

import { ComponentType } from 'react';
import { createClassnames } from 'common/utils/createClassnames';
import { referenceDictionary } from 'common/utils';
import { FormattedMessage, defineMessages, type MessageDescriptor } from 'react-intl';
import Link from 'redux-first-router-link';
import { LOGIN_PAGE } from 'controllers/pages';
import { BlockHeader as BlockHeaderBase } from '../common/pageBlockContainer/blockHeader';
import { RegistrationPageSection } from './registrationPageSection';
import { RegistrationFailBlock } from './registrationFailBlock';
import { RegistrationForm } from './registrationForm';
import type { RegistrationFormValues } from './registrationForm/registrationForm';
import styles from './registrationPage.scss';

const cx = createClassnames(styles);

// TODO: remove it when BlockHeader will be converted to TS and will accept MessageDescriptor as header and hint props
const BlockHeader = BlockHeaderBase as ComponentType<{
  header?: MessageDescriptor;
  hint?: MessageDescriptor;
  hintParams?: Record<string, unknown>;
}>;

const messages = defineMessages({
  welcome: {
    id: 'RegistrationPage.welcome',
    defaultMessage: 'Welcome,',
  },
  registration: {
    id: 'RegistrationPage.registration',
    defaultMessage: 'create your account',
  },
});

interface RegistrationPageProps {
  tokenActive?: boolean;
  tokenProvided?: boolean;
  email?: string;
  onRegistrationSubmit?: (values: RegistrationFormValues) => Promise<unknown>;
  loading?: boolean;
  initialData?: Record<string, string | undefined>;
  submitButtonTitle?: string;
}

export const RegistrationPage = ({
  tokenActive = false,
  tokenProvided = false,
  email = '',
  onRegistrationSubmit = () => Promise.resolve(),
  loading = false,
  initialData = {},
  submitButtonTitle = '',
}: RegistrationPageProps) => {
  const backgroundClasses = {
    background: true,
    failed: !tokenProvided || !tokenActive,
  };

  return (
    <div className={cx('registration-page')}>
      <div className={cx('registration-page-content')}>
        <div className={cx(backgroundClasses)} />
        <a href={referenceDictionary.rpLanding} target="_blank" rel="noopener noreferrer" aria-label="ReportPortal landing page">
          <div className={cx('logo')} />
        </a>
        <RegistrationPageSection left>
          {tokenProvided && tokenActive && (
            <div className={cx('couple-minutes')}>
              <FormattedMessage
                id={'RegistrationPage.coupleMinutes'}
                defaultMessage={'It only takes a couple of minutes to get started'}
              />
            </div>
          )}
        </RegistrationPageSection>
        <RegistrationPageSection failed={!tokenActive || !tokenProvided}>
          {tokenProvided && tokenActive ? (
            <div className={cx('main-content')}>
              <BlockHeader header={messages.welcome} hint={messages.registration} />
              <RegistrationForm
                email={email}
                submitForm={onRegistrationSubmit}
                loading={loading}
                initialData={initialData}
                submitButtonTitle={submitButtonTitle}
              />
            </div>
          ) : (
            <TokenErrorSection tokenProvided={tokenProvided} />
          )}
        </RegistrationPageSection>
      </div>
    </div>
  );
};

interface TokenErrorSectionProps {
  tokenProvided?: boolean;
}

const TokenErrorSection = ({ tokenProvided = false }: TokenErrorSectionProps) => (
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
      <br />
      <FormattedMessage id={'RegistrationPage.or'} defaultMessage={'or '} />
      <Link to={{ type: LOGIN_PAGE }} className={cx('backlink')}>
        <FormattedMessage id={'RegistrationPage.login'} defaultMessage={'Log In'} />
      </Link>
      <FormattedMessage id={'RegistrationPage.again'} defaultMessage={' again'} />
    </div>
  </RegistrationFailBlock>
);
