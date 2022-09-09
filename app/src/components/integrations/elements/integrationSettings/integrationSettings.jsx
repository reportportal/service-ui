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

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectIdSelector, querySelector, updatePagePropertiesAction } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import {
  removeIntegrationAction,
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
} from 'controllers/plugins';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { INTEGRATION_FORM } from './integrationForm/constants';
import { ConnectionSection } from './connectionSection';
import { IntegrationForm } from './integrationForm';
import styles from './integrationSettings.scss';

const cx = classNames.bind(styles);

export const IntegrationSettings = (props) => {
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(!props.data.isNew && !props.preventTestConnection);
  const globalIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const projectIntegrations = useSelector(namedProjectIntegrationsSelector);
  const projectId = useSelector(projectIdSelector);
  const activeProject = useSelector(activeProjectSelector);
  const query = useSelector(querySelector);
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const availableGlobalIntegrations = globalIntegrations[query.subPage] || [];
  const availableProjectIntegrations = projectIntegrations[query.subPage] || [];
  const groupedIntegrations = [...availableGlobalIntegrations, ...availableProjectIntegrations];

  const testIntegrationConnection = () => {
    setLoading(true);
    if ('id' in props.data) {
      fetch(URLS.testIntegrationConnection(projectId || activeProject, props.data.id))
        .then(() => {
          setConnected(true);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setConnected(false);
        });
    }
  };
  useEffect(() => {
    const hasId = groupedIntegrations.some((value) => value.id === +query.id);
    if (!hasId) {
      dispatch(
        updatePagePropertiesAction({
          id: null,
        }),
      );
    }
  }, [query.id, groupedIntegrations]);

  useEffect(() => {
    if (query.id || props.data) {
      testIntegrationConnection();
    }
  }, [query.id, props.data]);

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

  return (
    <div className={cx('integration-settings')}>
      {loading ? (
        <BubblesPreloader customClassName={cx('center')} />
      ) : (
        <>
          <ConnectionSection
            blocked={data.blocked}
            connected={connected}
            testConnection={testIntegrationConnection}
            onRemoveIntegration={removeIntegration}
            editAuthConfig={editAuthConfig}
            pluginName={props.data.integrationType?.name}
            data={data}
            isGlobal={isGlobal}
          />
          <IntegrationForm
            form={formKey}
            data={data}
            connected={connected}
            pluginName={pluginName}
            isGlobal={isGlobal}
            onSubmit={onUpdate}
            formFieldsComponent={formFieldsComponent}
            isEmptyConfiguration={isEmptyConfiguration}
          />
        </>
      )}
    </div>
  );
};

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
