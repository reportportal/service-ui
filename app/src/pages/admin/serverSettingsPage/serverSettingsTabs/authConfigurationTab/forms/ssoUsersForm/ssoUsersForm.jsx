/*
 * Copyright 2024 EPAM Systems
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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { SectionHeader } from 'components/main/sectionHeader';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ssoUsersOnlySelector, fetchAppInfoAction } from 'controllers/appInfo';
import formStyles from 'pages/admin/serverSettingsPage/common/formController/formController.scss';
import styles from './ssoUsersForm.scss';

const formCx = classNames.bind(formStyles);
const cx = classNames.bind(styles);

const messages = defineMessages({
  switcherLabel: {
    id: 'SsoUsersForm.switcherLabel',
    defaultMessage: 'SSO users only',
  },
  formHeader: {
    id: 'SsoUsersForm.formHeader',
    defaultMessage: 'Instance Invitations',
  },
  ssoOnlyDescription: {
    id: 'SsoUsersForm.ssoOnlyDescription',
    defaultMessage: 'New users can be created via SSO only.',
  },
  manualInvitesDescription: {
    id: 'SsoUsersForm.manualInvitesDescription',
    defaultMessage:
      'Users can manually send invitations for other users. If enabled new users can be created via SSO only.',
  },
});

const SsoUsersFormComponent = ({ enabled: enabledFromStore, fetchAppInfo }) => {
  const { formatMessage } = useIntl();
  const [enabled, setEnabled] = useState(enabledFromStore);
  const inputId = 'ssoUsersToggle';

  useEffect(() => {
    fetchAppInfo();
  }, [fetchAppInfo]);

  useEffect(() => {
    setEnabled(enabledFromStore);
  }, [enabledFromStore]);

  const getDescription = () =>
    formatMessage(enabled ? messages.ssoOnlyDescription : messages.manualInvitesDescription);

  const handleToggle = (value) => {
    setEnabled(value);
  };

  return (
    <div className={formCx('form-controller')}>
      <div className={formCx('heading-wrapper')}>
        <SectionHeader text={formatMessage(messages.formHeader)} />
      </div>
      <div className={formCx('form')}>
        <div className={cx('form-group')}>
          <label htmlFor={inputId} className={cx('form-group-label')}>
            {formatMessage(messages.switcherLabel)}
          </label>
          <div className={cx('form-group-content')}>
            <div className={cx('input-container')}>
              <InputBigSwitcher
                id={inputId}
                value={enabled}
                onChange={handleToggle}
                mobileDisabled
                onChangeEventInfo={ADMIN_SERVER_SETTINGS_PAGE_EVENTS.SSO_USERS_SWITCHER}
              />
              <div className={cx('description')} aria-live="polite">
                {getDescription()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SsoUsersFormComponent.propTypes = {
  enabled: PropTypes.bool,
  fetchAppInfo: PropTypes.func.isRequired,
};

SsoUsersFormComponent.defaultProps = {
  enabled: false,
};

const mapStateToProps = (state) => ({
  enabled: ssoUsersOnlySelector(state),
});

const mapDispatchToProps = {
  fetchAppInfo: fetchAppInfoAction,
};

export const SsoUsersForm = connect(mapStateToProps, mapDispatchToProps)(SsoUsersFormComponent);
