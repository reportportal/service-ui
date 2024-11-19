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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { SectionHeader } from 'components/main/sectionHeader';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { FormField } from 'components/fields/formField';
import { ENABLED_KEY } from 'pages/admin/serverSettingsPage/common/constants';
import { ssoUsersOnlySelector, fetchAppInfoAction } from 'controllers/appInfo';
import formStyles from 'pages/admin/serverSettingsPage/common/formController/formController.scss';
import './ssoUsersForm.scss';

const formCx = classNames.bind(formStyles);

const localMessages = defineMessages({
  switcherLabel: {
    id: 'SsoUsersForm.switcherLabel',
    defaultMessage: 'SSO users only',
  },
  formHeader: {
    id: 'SsoUsersForm.formHeader',
    defaultMessage: 'Instance Invitations',
  },
});

function SsoUsersFormComponent({ initialize, enabled, fetchAppInfo }) {
  const { formatMessage } = useIntl();

  useEffect(() => {
    fetchAppInfo();
  }, [fetchAppInfo]);

  useEffect(() => {
    initialize({ [ENABLED_KEY]: enabled });
  }, [initialize, enabled]);

  const renderToggle = ({ input }) => (
    <InputBigSwitcher
      value={input.value}
      onChange={input.onChange}
      mobileDisabled
      onChangeEventInfo={ADMIN_SERVER_SETTINGS_PAGE_EVENTS.SSO_USERS_SWITCHER}
    />
  );

  const getCustomBlockText = () => {
    return enabled
      ? 'New users can be created via SSO only.'
      : 'Users can manually send invitations for other users. If enabled new users can be created via SSO only.';
  };

  return (
    <div className={formCx('form-controller')}>
      <div className={formCx('heading-wrapper')}>
        <SectionHeader text={formatMessage(localMessages.formHeader)} />
      </div>
      <div className={formCx('form')}>
        <FormField
          name={ENABLED_KEY}
          label={formatMessage(localMessages.switcherLabel)}
          labelClassName={formCx('label')}
          format={Boolean}
          parse={Boolean}
          customBlock={{
            wrapperClassName: 'custom-text-wrapper',
            node: (
              <span
                className={`custom-span-class ${
                  enabled ? 'enabled-description' : 'disabled-description'
                }`}
              >
                {getCustomBlockText()}
              </span>
            ),
          }}
        >
          <Field name={ENABLED_KEY} component={renderToggle} />
        </FormField>
      </div>
    </div>
  );
}

SsoUsersFormComponent.propTypes = {
  enabled: PropTypes.bool,
  initialize: PropTypes.func.isRequired,
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

const ReduxWrappedForm = reduxForm({
  form: 'SsoUsersForm',
  enableReinitialize: true,
})(SsoUsersFormComponent);

export const SsoUsersForm = connect(mapStateToProps, mapDispatchToProps)(ReduxWrappedForm);
