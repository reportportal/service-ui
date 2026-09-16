/*
 * Copyright 2022 EPAM Systems
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

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { BubblesLoader } from '@reportportal/ui-kit';
import { LDAP } from 'common/constants/pluginNames';
import { omit } from 'common/utils/omit';
import {
  urlOrganizationAndProjectSelector,
  querySelector,
  PROJECT_SETTINGS_TAB_PAGE,
} from 'controllers/pages';
import { projectInfoIdSelector, projectKeySelector } from 'controllers/project';
import { activeOrganizationIdSelector } from 'controllers/organization';
import {
  removeIntegrationAction,
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
} from 'controllers/plugins';
import { getTestIntegrationConnection } from 'controllers/plugins/utils';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { redirect } from 'redux-first-router';
import { INTEGRATION_FORM } from './integrationForm/constants';
import { ConnectionSection } from './connectionSection';
import { IntegrationForm } from './integrationForm';
import styles from './integrationSettings.scss';
import { useUserPermissions } from 'hooks/useUserPermissions';

const cx = classNames.bind(styles);

const messages = defineMessages({
  configurationTitle: {
    id: 'IntegrationForm.configurationTitle',
    defaultMessage: 'Configuration',
  },
  // Not an empty state and not a call to action: there is no form behind either. The sentence
  // exists so the heading has something under it, because a heading alone reads as a fault too.
  nothingToConfigure: {
    id: 'IntegrationSettings.nothingToConfigure',
    defaultMessage: 'This plugin has no settings to configure.',
  },
});

export const IntegrationSettings = (props) => {
  const {
    data,
    onUpdate,
    formFieldsComponent,
    editAuthConfig,
    isEmptyConfiguration,
    formKey,
    isGlobal,
    goToPreviousPage,
    isOrganizational = false,
    preventTestConnection = false,
    hideInlineForm = false,
  } = props;
  const pluginName = data.integrationType?.name;
  const { formatMessage } = useIntl();

  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(!data.isNew && !preventTestConnection);
  const globalIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const projectIntegrations = useSelector(namedProjectIntegrationsSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const projectId = useSelector(projectInfoIdSelector);
  const projectKey = useSelector(projectKeySelector);
  const organizationId = useSelector(activeOrganizationIdSelector);
  const { canUpdateSettings } = useUserPermissions();
  const query = useSelector(querySelector);
  const dispatch = useDispatch();

  const groupedIntegrations = useMemo(() => {
    const availableGlobalIntegrations = globalIntegrations[query.subPage] || [];
    const availableProjectIntegrations = projectIntegrations[query.subPage] || [];

    return [...availableGlobalIntegrations, ...availableProjectIntegrations];
  }, [globalIntegrations, projectIntegrations, query.subPage]);

  const namedSubPage = useMemo(
    () => ({
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: { organizationSlug, projectSlug, settingsTab: INTEGRATIONS },
      meta: {
        query: omit(query, ['id']),
      },
    }),
    [organizationSlug, projectSlug, query],
  );

  const testIntegrationConnection = useCallback(() => {
    if ('id' in data && !preventTestConnection && pluginName) {
      setLoading(true);

      const fetchConnection = getTestIntegrationConnection({
        pluginName,
        isGlobal,
        isOrganizational,
        context: { projectId, projectKey, organizationId },
      });

      fetchConnection(data.id)
        .then(() => {
          setConnected(true);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setConnected(false);
        });
    }
  }, [
    data,
    preventTestConnection,
    isGlobal,
    isOrganizational,
    pluginName,
    projectKey,
    projectId,
    organizationId,
  ]);

  useEffect(() => {
    const hasId = groupedIntegrations.some((value) => value.id === +query.id);
    if (!hasId && Object.keys(query).length > 0) {
      dispatch(redirect(namedSubPage));
    }
  }, [query, groupedIntegrations, dispatch, namedSubPage]);

  useEffect(() => {
    if (query.id || data) {
      testIntegrationConnection();
    }
  }, [query.id, data, testIntegrationConnection]);

  const removeIntegration = () => {
    dispatch(removeIntegrationAction(data.id, isGlobal, goToPreviousPage));
  };

  const isLdap = pluginName === LDAP;
  const shouldHideInlineForm = isLdap || hideInlineForm;

  return (
    <div className={cx('integration-settings')}>
      {loading ? (
        <BubblesLoader className={cx('center')} />
      ) : (
        <>
          <ConnectionSection
            blocked={data.blocked}
            connected={connected}
            testConnection={testIntegrationConnection}
            onRemoveIntegration={removeIntegration}
            editAuthConfig={editAuthConfig}
            pluginName={pluginName}
            data={data}
            isGlobal={isGlobal}
            isEditable={canUpdateSettings}
          />
          {!shouldHideInlineForm && formFieldsComponent && (
            <IntegrationForm
              form={formKey}
              data={data}
              connected={connected}
              pluginName={pluginName}
              isGlobal={isGlobal}
              onSubmit={onUpdate}
              formFieldsComponent={formFieldsComponent}
              isEmptyConfiguration={isEmptyConfiguration}
              isEditable={canUpdateSettings}
            />
          )}
          {/* The third configuration model: a plugin that exposes no settings at all — Telegram
              posts launch results to a chat and holds nothing instance-level. The heading stays and
              says so, because a block that is simply absent reads as one that failed to load.
              `hideInlineForm` is the other reason there is no form here and is not this case: there
              the configuration lives somewhere else, so claiming there is none would be wrong. */}
          {!shouldHideInlineForm && !formFieldsComponent && (
            <div className={cx('no-configuration')} data-automation-id="noConfigurationBlock">
              <h3 className={cx('no-configuration-header')}>
                {formatMessage(messages.configurationTitle)}
              </h3>
              <p className={cx('no-configuration-info')}>
                {formatMessage(messages.nothingToConfigure)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
IntegrationSettings.propTypes = {
  data: PropTypes.object.isRequired,
  formFieldsComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  editAuthConfig: PropTypes.object,
  preventTestConnection: PropTypes.bool,
  isEmptyConfiguration: PropTypes.bool,
  isGlobal: PropTypes.bool,
  isOrganizational: PropTypes.bool,
  formKey: PropTypes.string,
  hideInlineForm: PropTypes.bool,
};
IntegrationSettings.defaultProps = {
  formFieldsComponent: null,
  editAuthConfig: null,
  preventTestConnection: false,
  isEmptyConfiguration: false,
  isGlobal: false,
  isOrganizational: false,
  formKey: INTEGRATION_FORM,
  hideInlineForm: false,
};
