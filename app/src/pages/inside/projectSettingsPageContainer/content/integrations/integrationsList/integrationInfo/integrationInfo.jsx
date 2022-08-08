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
import { useSelector } from 'react-redux';
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
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';
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
  const isAbleToClick = canUpdateSettings(isAdmin, userProjectRole);
  const {
    goBackHandler,
    data: { name, details = {} },
    data,
  } = props;
  return (
    <>
      <div className={cx('container')}>
        <div className={cx('back-to')}>
          <i className={cx('back-icon')}>{Parser(BackIcon)}</i>
          <Button onClick={goBackHandler} variant="text">
            {formatMessage(messages.backToIntegration)}
          </Button>
        </div>
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
      </div>
      <EmptyStatePage
        title={formatMessage(messages.noGlobalIntegrationsMessage)}
        description={formatMessage(messages.noGlobalIntegrationsDescription)}
        buttonName={formatMessage(messages.noGlobalIntegrationsButtonAdd)}
        disableButton={!isAbleToClick}
        documentationLink={documentationList[name]}
      />
    </>
  );
};

IntegrationInfo.propTypes = {
  goBackHandler: PropTypes.func,
  data: PropTypes.object,
};
