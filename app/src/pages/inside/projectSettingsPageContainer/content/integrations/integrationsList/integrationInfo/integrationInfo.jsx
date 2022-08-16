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

import React from 'react';
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
import {
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
} from 'controllers/plugins';
import { querySelector, updatePagePropertiesAction } from 'controllers/pages';
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
  const { formatMessage } = useIntl();
  const isAdmin = useSelector(isAdminSelector);
  const userProjectRole = useSelector(activeProjectRoleSelector);
  const globalIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const projectIntegrations = useSelector(namedProjectIntegrationsSelector);
  const isAbleToClick = canUpdateSettings(isAdmin, userProjectRole);
  const { id } = useSelector(querySelector);
  const dispatch = useDispatch();
  const {
    goBackHandler,
    data: { name, details = {} },
    data,
  } = props;

  const availableGlobalIntegrations = globalIntegrations[data.name] || [];
  const availableProjectIntegrations = projectIntegrations[data.name] || [];

  const onArrowClick = (integrationID) => {
    dispatch(
      updatePagePropertiesAction({
        id: integrationID,
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
                typeOfIntegration={availableProjectIntegrations}
                onArrowClick={onArrowClick}
              />
            )}

            <AvailableIntegrations
              header={formatMessage(messages.globalIntegrationTitle)}
              text={formatMessage(messages.globalIntegrationText)}
              typeOfIntegration={availableGlobalIntegrations}
              onArrowClick={onArrowClick}
              isGlobal={Boolean(availableProjectIntegrations.length)}
            />
          </>
        ) : (
          <EmptyStatePage
            title={formatMessage(messages.noGlobalIntegrationsMessage)}
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
            <Button disabled={!isAbleToClick}>
              {formatMessage(messages.noGlobalIntegrationsButtonAdd)}
            </Button>
            {availableProjectIntegrations.length > 0 && isAbleToClick && (
              <Button variant="ghost">
                {formatMessage(messages.resetToGlobalIntegrationsButton)}
              </Button>
            )}
          </div>
        </div>
      </div>
      {!id ? integrationContent() : <h1>Configuration Page with unique id {id}</h1>}
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
};

IntegrationInfo.defaultProps = {
  goBackHandler: () => {},
};
