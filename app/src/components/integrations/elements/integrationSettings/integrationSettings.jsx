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
import { useTracking } from 'react-tracking';
import { BubblesLoader } from '@reportportal/ui-kit';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { LDAP } from 'common/constants/pluginNames';
import { omit } from 'common/utils/omit';
import {
  urlOrganizationAndProjectSelector,
  querySelector,
  PROJECT_SETTINGS_TAB_PAGE,
  userRolesSelector,
} from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import { canUpdateSettings } from 'common/utils/permissions';
import {
  removeIntegrationAction,
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
} from 'controllers/plugins';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { redirect } from 'redux-first-router';
import { INTEGRATION_FORM } from './integrationForm/constants';
import { ConnectionSection } from './connectionSection';
import { IntegrationForm } from './integrationForm';
import styles from './integrationSettings.scss';

const cx = classNames.bind(styles);

export function IntegrationSettings(props) {
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(!props.data.isNew && !props.preventTestConnection);
  const globalIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const projectIntegrations = useSelector(namedProjectIntegrationsSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const projectKey = useSelector(projectKeySelector);
  const userRoles = useSelector(userRolesSelector);
  const isEditable = canUpdateSettings(userRoles);
  const query = useSelector(querySelector);
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

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
    if ('id' in props.data && !props.preventTestConnection) {
      setLoading(true);
      const { isGlobal } = props;
      const fetchConnection = isGlobal
        ? fetch(URLS.testGlobalIntegrationConnection(props.data.id))
        : fetch(URLS.testIntegrationConnection(projectKey, props.data.id));

      fetchConnection
        .then(() => {
          setConnected(true);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setConnected(false);
        });
    }
  }, [props.data, projectKey, props.preventTestConnection]);

  useEffect(() => {
    const hasId = groupedIntegrations.some((value) => value.id === +query.id);
    if (!hasId && Object.keys(query).length > 0) {
      dispatch(redirect(namedSubPage));
    }
  }, [query, groupedIntegrations, dispatch, namedSubPage]);

  useEffect(() => {
    if (query.id || props.data) {
      testIntegrationConnection();
    }
  }, [query.id, props.data, testIntegrationConnection]);

  const removeIntegration = () => {
    const {
      data: { id, integrationType },
      isGlobal,
      goToPreviousPage,
    } = props;

    trackEvent(PLUGINS_PAGE_EVENTS.clickDeleteBtnRemoveIntegration(integrationType.name));
    dispatch(removeIntegrationAction(id, isGlobal, goToPreviousPage));
  };

  const {
    data,
    onUpdate,
    formFieldsComponent,
    editAuthConfig,
    isEmptyConfiguration,
    formKey,
    isGlobal,
  } = props;
  const pluginName = data.integrationType?.name;
  const isLdap = pluginName === LDAP;

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
            isEditable={isEditable}
          />
          {!isLdap && (
            <IntegrationForm
              form={formKey}
              data={data}
              connected={connected}
              pluginName={pluginName}
              isGlobal={isGlobal}
              onSubmit={onUpdate}
              formFieldsComponent={formFieldsComponent}
              isEmptyConfiguration={isEmptyConfiguration}
              isEditable={isEditable}
            />
          )}
        </>
      )}
    </div>
  );
}
IntegrationSettings.propTypes = {
  data: PropTypes.object.isRequired,
  formFieldsComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  editAuthConfig: PropTypes.object,
  preventTestConnection: PropTypes.bool,
  isEmptyConfiguration: PropTypes.bool,
  isGlobal: PropTypes.bool,
  formKey: PropTypes.string,
};
IntegrationSettings.defaultProps = {
  editAuthConfig: null,
  preventTestConnection: false,
  isEmptyConfiguration: false,
  isGlobal: false,
  formKey: INTEGRATION_FORM,
};
