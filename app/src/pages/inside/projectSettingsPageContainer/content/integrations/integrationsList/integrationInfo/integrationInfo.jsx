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

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import { Button } from 'componentLibrary/button';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import { JIRA, RALLY, EMAIL, SAUCE_LABS } from 'common/constants/pluginNames';
import { isAdminSelector, activeProjectRoleSelector } from 'controllers/user';
import { canUpdateSettings } from 'common/utils/permissions';

import { PLUGIN_NAME_TITLES } from 'components/integrations';
import { showModalAction, hideModalAction } from 'controllers/modal';
import {
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
  addIntegrationAction,
  updateIntegrationAction,
  removeIntegrationAction,
  removeProjectIntegrationsByTypeAction,
} from 'controllers/plugins';

import { updatePagePropertiesAction } from 'controllers/pages';
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';
import { AvailableIntegrations } from './availableIntegrations';
import { JIRA_CLOUD, AZURE_DEVOPS } from './constats';
import styles from './integrationInfo.scss';
import BackIcon from './img/back-inline.svg';
import { messages } from './messages';

const cx = classNames.bind(styles);

const documentationList = {
  [JIRA]: 'https://reportportal.io/docs/Jira-Server-Integration%3Eproject-jira-server-integration',
  [RALLY]: 'https://reportportal.io/docs/Rally-Integration%3Eproject-rally-integration',
  [EMAIL]: 'https://reportportal.io/docs/E-mail-server-integration',
  [SAUCE_LABS]: 'https://reportportal.io/docs/Sauce-Labs-integration',
  [JIRA_CLOUD]:
    'https://reportportal.io/docs/Jira-Cloud-Integration%3Eproject-jira-cloud-integration',
  [AZURE_DEVOPS]: 'https://reportportal.io/docs/Azure-DevOps-BTS',
};
export const IntegrationInfo = (props) => {
  const [integrationInfo, setIntegrationInfo] = useState({});
  const [updatedParameters, setUpdatedParameters] = useState({});
  const { formatMessage } = useIntl();
  const isAdmin = useSelector(isAdminSelector);
  const userProjectRole = useSelector(activeProjectRoleSelector);
  const globalIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const projectIntegrations = useSelector(namedProjectIntegrationsSelector);
  const isAbleToClick = canUpdateSettings(isAdmin, userProjectRole);
  const dispatch = useDispatch();
  const {
    goBackHandler,
    data: { name, details = {} },
    data,
    integrationId,
  } = props;

  const availableGlobalIntegrations = globalIntegrations[data.name] || [];
  const availableProjectIntegrations = projectIntegrations[data.name] || [];

  useEffect(() => {
    const integration = availableProjectIntegrations.find((value) => value.id === +integrationId);
    if (integration) {
      setIntegrationInfo(integration);
    }
  }, []);

  const openIntegration = (integration) => {
    const { id } = integration;
    dispatch(
      updatePagePropertiesAction({
        id,
      }),
    );
    setIntegrationInfo(integration);
  };

  const addProjectIntegration = (formData, metaData) => {
    const newData = {
      enabled: true,
      integrationParameters: formData,
      name: formData.integrationName || PLUGIN_NAME_TITLES[name],
    };

    dispatch(addIntegrationAction(newData, false, name, openIntegration, metaData));
  };

  const onAddProjectIntegration = () => {
    const pluginDetails = { ...details };
    dispatch(
      showModalAction({
        id: 'createProjectIntegrationModal',
        data: {
          modalTitle: formatMessage(messages.projectIntegrationCreate),
          hasGlobalIntegration: Boolean(
            availableGlobalIntegrations.length && availableProjectIntegrations.length === 0,
          ),
          instanceType: name,
          onConfirm: addProjectIntegration,
          customProps: {
            pluginDetails,
          },
        },
      }),
    );
  };
  const onUpdate = (formData, onConfirm, metaData) => {
    const newData = {
      enabled: true,
      integrationParameters: formData,
    };

    if (formData.integrationName) {
      newData.name = formData.integrationName;
    }

    dispatch(
      updateIntegrationAction(
        newData,
        false,
        integrationInfo.id,
        integrationInfo.name,
        (normalizedData) => {
          setUpdatedParameters(normalizedData);
          onConfirm();
        },
        metaData,
      ),
    );
  };

  const getConfirmationFunc = (newData, metaData) => {
    onUpdate(
      newData,
      () => {
        dispatch(hideModalAction());
      },
      metaData,
    );
  };

  const updatedData = {
    ...integrationInfo,
    name: updatedParameters.name || integrationInfo.name,
    integrationParameters: {
      ...integrationInfo.integrationParameters,
      ...updatedParameters.integrationParameters,
    },
  };

  const editAuthorizationClickHandler = () => {
    const { integrationParameters, integrationType } = updatedData;
    dispatch(
      showModalAction({
        id: 'createProjectIntegrationModal',
        data: {
          modalTitle: formatMessage(messages.projectIntegrationEdit),
          onConfirm: getConfirmationFunc,
          instanceType: integrationType.name,
          customProps: {
            initialData: {
              ...integrationParameters,
              integrationName: updatedData.name,
            },
            editAuthMode: true,
          },
        },
      }),
    );
  };

  const removeIntegration = () => {
    dispatch(removeIntegrationAction(integrationInfo.id, false, goBackHandler));
  };

  const resetProjectIntegrations = () => dispatch(removeProjectIntegrationsByTypeAction(name));

  const onDeleteProjectIntegration = () => {
    dispatch(
      showModalAction({
        id: 'deleteProjectIntegrationModal',
        data: {
          onConfirm: removeIntegration,
          modalTitle: `${formatMessage(messages.projectIntegrationDelete)} ${integrationInfo.name}`,
          description: `${formatMessage(messages.projectIntegrationDeleteDescription)} ${
            integrationInfo.name
          }?`,
        },
      }),
    );
  };

  const onResetProjectIntegration = () => {
    dispatch(
      showModalAction({
        id: 'deleteProjectIntegrationModal',
        data: {
          onConfirm: resetProjectIntegrations,
          modalTitle: formatMessage(messages.projectIntegrationReset),
          description: formatMessage(messages.projectIntegrationResetDescription),
          isReset: true,
        },
      }),
    );
  };

  const integrationContent = () => {
    return (
      <>
        {availableGlobalIntegrations.length > 0 || availableProjectIntegrations.length > 0 ? (
          <>
            {availableProjectIntegrations.length > 0 && (
              <AvailableIntegrations
                header={formatMessage(messages.projectIntegrationTitle)}
                text={formatMessage(messages.projectIntegrationText)}
                integrations={availableProjectIntegrations}
                openIntegration={openIntegration}
              />
            )}

            <AvailableIntegrations
              header={formatMessage(messages.globalIntegrationTitle)}
              text={formatMessage(messages.globalIntegrationText)}
              integrations={availableGlobalIntegrations}
              openIntegration={openIntegration}
              hasProjectIntegration={Boolean(availableProjectIntegrations.length)}
            />
          </>
        ) : (
          <EmptyStatePage
            title={formatMessage(messages.noGlobalIntegrationsMessage)}
            handleButton={onAddProjectIntegration}
            description={formatMessage(messages.noGlobalIntegrationsDescription)}
            buttonName={formatMessage(messages.noGlobalIntegrationsButtonAdd)}
            disableButton={!isAbleToClick}
            documentationLink={documentationList[name]}
          />
        )}
      </>
    );
  };

  return (
    <>
      <div className={cx('container')}>
        <div className={cx('back-to')}>
          <i className={cx('back-icon')}>{Parser(BackIcon)}</i>
          <Button onClick={goBackHandler} variant="text">
            {formatMessage(messages.backToIntegration)}
          </Button>
        </div>
        <div className={cx('header')}>
          <div className={cx('integration-block')}>
            <PluginIcon className={cx('integration-image')} pluginData={data} alt={name} />
            <div className={cx('integration-info-block')}>
              <div className={cx('integration-data-block')}>
                <span className={cx('integration-name')}>{PLUGIN_NAME_TITLES[name] || name}</span>
                <span className={cx('integration-version')}>
                  {details.version && `${formatMessage(messages.version)} ${details.version}`}
                </span>
              </div>

              <p className={cx('integration-description')}>
                {PLUGIN_DESCRIPTIONS_MAP[name] ||
                  (details.description && Parser(details.description))}
              </p>
            </div>
          </div>
          <div className={cx('buttons-section')}>
            <Button disabled={!isAbleToClick} onClick={onAddProjectIntegration}>
              {formatMessage(messages.noGlobalIntegrationsButtonAdd)}
            </Button>
            {availableProjectIntegrations.length > 0 && isAbleToClick && (
              <Button onClick={onResetProjectIntegration} variant="ghost">
                {formatMessage(messages.resetToGlobalIntegrationsButton)}
              </Button>
            )}
          </div>
        </div>
      </div>
      {!integrationId ? (
        integrationContent()
      ) : (
        <>
          <h1>Configuration Page with unique id = {integrationId}</h1>
          <div className={cx('buttons-setting')}>
            <Button onClick={editAuthorizationClickHandler}>Edit</Button>
            <Button onClick={onDeleteProjectIntegration}>Delete</Button>
          </div>
        </>
      )}
    </>
  );
};

IntegrationInfo.propTypes = {
  goBackHandler: PropTypes.func,
  data: PropTypes.shape({
    creationDate: PropTypes.number,
    enabled: PropTypes.bool,
    groupType: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.number,
    details: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      version: PropTypes.string,
      resources: PropTypes.string,
    }),
  }).isRequired,
  integrationId: PropTypes.string,
};

IntegrationInfo.defaultProps = {
  goBackHandler: () => {},
  integrationId: '',
};
