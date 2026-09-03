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

import classNames from 'classnames/bind';
import { docsReferences, referenceDictionary } from 'common/utils';
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import Link from 'redux-first-router-link';
import { Button } from '@reportportal/ui-kit';
import { LOGIN_PAGE } from 'controllers/pages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import { PageSectionContainer } from '../common/pageSectionContainer';
import { OutsideLoginFooter } from '../common/outsideLoginFooter';
import { LoginPageSection } from '../loginPage/loginPageSection';
import { SocialSection } from '../loginPage/socialSection';
import { ReportPortalIcon } from '../loginPage/reportPortalIcon/ReportPortalIcon';
import loginPageStyles from '../loginPage/loginPage.scss';
import { RegistrationForm } from './registrationForm';
import type { RegistrationFormValues } from './registrationForm/registrationForm';
import styles from './registrationPage.scss';

const loginCx = classNames.bind(loginPageStyles);
const cx = classNames.bind(styles);

const messages = defineMessages({
  registration: {
    id: 'RegistrationPage.registration',
    defaultMessage: 'Create your account',
  },
  tokenExpired: {
    id: 'RegistrationPage.tokenExpired',
    defaultMessage: 'This invitation has expired or already used.',
  },
  tokenNotProvided: {
    id: 'RegistrationPage.tokenNotProvided',
    defaultMessage: 'Invitation token was not provided in URL parameters.',
  },
  login: {
    id: 'RegistrationPage.login',
    defaultMessage: 'Log in',
  },
  readMore: {
    id: 'RegistrationPage.readMore',
    defaultMessage: 'Read more',
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
  const isRegistrationFormVisible = tokenProvided && tokenActive;

  return (
    <div className={loginCx('login-page')}>
      <div className={loginCx('login-page-content')}>
        <div className={loginCx('login-form-side')}>
          <div
            className={`${loginCx('logo')} ${cx('registrationLogo', {
              registrationLogoError: !isRegistrationFormVisible,
            })}`}
          >
            <a
              href={referenceDictionary.rpLanding}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ReportPortal landing page"
            >
              <ReportPortalIcon />
            </a>
          </div>
          <LoginPageSection>
            <div className={cx('registration-scroll-area')}>
              {isRegistrationFormVisible ? (
                <PageSectionContainer
                  header={messages.registration}
                  leftAligned
                  compactHeaderSpacing
                >
                  <RegistrationForm
                    email={email}
                    submitForm={onRegistrationSubmit}
                    loading={loading}
                    initialData={initialData}
                    submitButtonTitle={submitButtonTitle}
                  />
                </PageSectionContainer>
              ) : (
                <PageSectionContainer
                  header={COMMON_LOCALE_KEYS.OOPS}
                  hint={tokenProvided ? messages.tokenExpired : messages.tokenNotProvided}
                  leftAligned
                >
                  <TokenErrorActions />
                </PageSectionContainer>
              )}
            </div>
            <div className={cx('registration-footer')}>
              <OutsideLoginFooter />
            </div>
          </LoginPageSection>
        </div>
        <LoginPageSection social>
          <SocialSection />
        </LoginPageSection>
      </div>
    </div>
  );
};

const TokenErrorActions = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  return (
    <div className={cx('fail-actions')}>
      <Link to={{ type: LOGIN_PAGE }} className={cx('button-link')}>
        <Button variant="ghost" className={cx('action-button')}>
          {formatMessage(messages.login)}
        </Button>
      </Link>
      <a
        className={cx('read-more-link')}
        href={docsReferences.userManagement}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(LOGIN_PAGE_EVENTS.CLICK_ON_READ_MORE)}
      >
        {formatMessage(messages.readMore)}
      </a>
    </div>
  );
};
