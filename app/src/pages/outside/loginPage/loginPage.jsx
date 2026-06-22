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

import { useEffect, useRef } from 'react';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { referenceDictionary } from 'common/utils';
import { pagePropertiesSelector } from 'controllers/pages';
import { showDefaultErrorNotification } from 'controllers/notification';
import { uiExtensionLoginPageSelector } from 'controllers/plugins/uiExtensions';
import { ExtensionLoader } from 'components/extensionLoader';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import styles from './loginPage.scss';
import { LoginPageSection } from './loginPageSection';
import { SocialSection } from './socialSection';
import { LoginBlock } from './pageBlocks/loginBlock';
import { ForgotPasswordBlock } from './pageBlocks/forgotPasswordBlock';
import { ChangePasswordBlock } from './pageBlocks/changePasswordBlock';
import { MultipleAuthBlock } from './pageBlocks/multipleAuthBlock';
import { OutsideLoginFooter } from '../common/outsideLoginFooter';
import { ReportPortalIcon } from './reportPortalIcon/ReportPortalIcon';
const cx = classNames.bind(styles);


const shownErrors = new Set();

const getCurrentBlock = ({ forgotPass, reset, multipleAuth, registration, extensions }) => {
  if (registration && extensions?.length) {
    return extensions.map((extension) => (
      <ExtensionLoader key={extension.name} extension={extension} withPreloader />
    ));
  }
  if (multipleAuth) return <MultipleAuthBlock multipleAuthKey={multipleAuth} />;
  if (reset) return <ChangePasswordBlock />;
  if (forgotPass) return <ForgotPasswordBlock />;
  return <LoginBlock />;
};

export const LoginPage = () => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const { forgotPass, reset, errorAuth, multipleAuth, registration } =
    useSelector(pagePropertiesSelector) ?? {};
  const extensions = useSelector(uiExtensionLoginPageSelector);

  const prevErrorRef = useRef(null);

  useEffect(() => {
    const showErrorIfNeeded = (error) => {
      if (error && !shownErrors.has(error)) {
        shownErrors.add(error);
        dispatch(showDefaultErrorNotification({ message: error }));
        setTimeout(() => shownErrors.delete(error), 5000);
      }
    };

    if (errorAuth !== prevErrorRef.current) {
      prevErrorRef.current = errorAuth;
      showErrorIfNeeded(errorAuth);
    }
  }, [dispatch, errorAuth]);

  const currentBlock = getCurrentBlock({ forgotPass, reset, multipleAuth, registration, extensions });

  return (
    <div className={cx('login-page')}>
      <div className={cx('login-page-content')}>
        <div className={cx('login-form-side')}>
        <div className={cx('logo')}>
        <a
          href={referenceDictionary.rpLanding}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent(LOGIN_PAGE_EVENTS.CLICK_ON_RPP_LOGO)}
        >
          <ReportPortalIcon />
        </a>
        </div>
        <LoginPageSection>
          {currentBlock}
          {!registration && !forgotPass && !reset && <OutsideLoginFooter />}
        </LoginPageSection>
        </div>
        <LoginPageSection social>
          <SocialSection />
        </LoginPageSection>
      </div>
    </div>
  );
};
