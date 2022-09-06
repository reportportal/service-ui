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
import { Button } from 'componentLibrary/button';
import { PLUGIN_NAME_TITLES } from 'components/integrations';
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import BackIcon from './img/back-inline.svg';
import styles from './integrationHeader.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const IntegrationHeader = (props) => {
  const { formatMessage } = useIntl();
  const {
    goBackHandler,
    data: { name, details = {} },
    data,
    onAddProjectIntegration,
    onResetProjectIntegration,
    isAbleToClick,
    availableProjectIntegrations,
    withButton,
  } = props;

  return (
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
        {withButton && (
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
        )}
      </div>
    </div>
  );
};

IntegrationHeader.propTypes = {
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
  onAddProjectIntegration: PropTypes.func,
  onResetProjectIntegration: PropTypes.func,
  isAbleToClick: PropTypes.bool,
  availableProjectIntegrations: PropTypes.array,
  withButton: PropTypes.bool,
};

IntegrationHeader.defaultProps = {
  goBackHandler: () => {},
  onAddProjectIntegration: () => {},
  onResetProjectIntegration: () => {},
  withButton: false,
  isAbleToClick: false,
  availableProjectIntegrations: [],
};
