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
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { Button } from '@reportportal/ui-kit';
import { PLUGIN_NAME_TITLES } from 'components/integrations';
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { createExternalLink } from 'common/utils';
import { PROJECT_SETTINGS_INTEGRATION } from 'analyticsEvents/projectSettingsPageEvents';
import { FormattedDescription } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { useTracking } from 'react-tracking';
import styles from './integrationHeader.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const IntegrationHeader = (props) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const {
    data: { name, details = {} },
    data,
    onAddProjectIntegration,
    onResetProjectIntegration,
    isAbleToClick,
    availableProjectIntegrations,
    withButton,
    breadcrumbs,
  } = props;

  const { documentationLink = '' } = details;
  const analyticsData = withButton ? 'integrations' : 'no_integrations';

  const handleDocumentationClick = () => {
    trackEvent(PROJECT_SETTINGS_INTEGRATION.clickDocumentationLink(analyticsData, name));
  };

  const integrationDescription = PLUGIN_DESCRIPTIONS_MAP[name] ? (
    <>
      {PLUGIN_DESCRIPTIONS_MAP[name]}{' '}
      <FormattedDescription
        content={formatMessage(messages.linkToDocumentation, {
          a: (link) => createExternalLink(link, documentationLink, 'documentationLink'),
        })}
        event={PROJECT_SETTINGS_INTEGRATION.clickDocumentationLink(analyticsData, name)}
      />
    </>
  ) : (
    <>
      {details.description && Parser(details.description)} Link to{' '}
      <a
        onClick={handleDocumentationClick}
        target="_blank"
        rel="noreferrer noopener"
        href={documentationLink}
        data-automation-id="documentationLink"
      >
        Documentation
      </a>
    </>
  );

  return (
    <div className={cx('container')}>
      <div className={cx('back-to')}>
        <Breadcrumbs descriptors={breadcrumbs} />
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
            <p className={cx('integration-description')}>{integrationDescription}</p>
          </div>
        </div>
        {withButton && (
          <div className={cx('buttons-section')}>
            <Button
              disabled={!isAbleToClick}
              onClick={onAddProjectIntegration}
              data-automation-id="addProjectIntegrationButton"
            >
              {formatMessage(messages.noGlobalIntegrationsButtonAdd)}
            </Button>
            {availableProjectIntegrations.length > 0 && isAbleToClick && (
              <Button
                onClick={onResetProjectIntegration}
                variant="ghost"
                data-automation-id="resetToGlobalIntegrationsButton"
              >
                {formatMessage(messages.projectIntegrationReset)}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
IntegrationHeader.propTypes = {
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
  onAddProjectIntegration: PropTypes.func,
  onResetProjectIntegration: PropTypes.func,
  isAbleToClick: PropTypes.bool,
  availableProjectIntegrations: PropTypes.array,
  withButton: PropTypes.bool,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.object.isRequired,
      onClick: PropTypes.func,
    }),
  ),
};
IntegrationHeader.defaultProps = {
  onAddProjectIntegration: () => {},
  onResetProjectIntegration: () => {},
  withButton: false,
  isAbleToClick: false,
  availableProjectIntegrations: [],
  breadcrumbs: [],
};
