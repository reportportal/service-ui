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

import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { referenceDictionary } from 'common/utils';
import { EPAM, SAAS } from 'controllers/appInfo/constants';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { showModalAction } from 'controllers/modal';
import 'layouts/common/appSidebar/helpAndService/modals/versionsOfConnectedServicesModal/versionsOfConnectedServicesModal';
import styles from './outsideLoginFooter.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  serviceVersion: {
    id: 'ServiceVersionsBlock.serviceVersion',
    defaultMessage: 'Service Version',
  },
});

export const OutsideLoginFooter = () => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const instanceType = useSelector(instanceTypeSelector);
  const [latestServiceVersions, setLatestServiceVersions] = useState({});

  const showPrivacyPolicy = instanceType === EPAM || instanceType === SAAS;

  useEffect(() => {
    fetch('https://status.reportportal.io/versions')
      .then((res) => res.json())
      .then((latestVersions) => setLatestServiceVersions(latestVersions))
      .catch(() => {});
  }, []);

  const openServiceVersionsModal = () => {
    dispatch(
      showModalAction({
        id: 'versionsOfConnectedServicesModal',
        data: {
          latestServiceVersions,
        },
      }),
    );
  };

  return (
    <div className={cx('outside-login-footer')}>
      <button type="button" className={cx('footer-link', 'service-version-link')} onClick={openServiceVersionsModal}>
        {formatMessage(messages.serviceVersion)}
      </button>
      {showPrivacyPolicy && (
        <a
          href={referenceDictionary.rpEpamPolicy}
          target="_blank"
          rel="noopener noreferrer"
          className={cx('footer-link')}
        >
          <FormattedMessage id="PolicyBlock.privacyPolicy" defaultMessage="Privacy Policy" />
        </a>
      )}
    </div>
  );
};
