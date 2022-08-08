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
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { PLUGIN_NAME_TITLES } from 'components/integrations/constants';
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import styles from './integrationsListItem.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  version: {
    id: 'InfoSection.version',
    defaultMessage: 'version',
  },
});

export const IntegrationsListItem = (props) => {
  const { formatMessage } = useIntl();
  const {
    integrationType: { name, details = {} },
    integrationType,
    onItemClick,
  } = props;

  const itemClickHandler = () => {
    onItemClick(integrationType);
  };
  return (
    <div className={cx('integrations-list-item')} onClick={itemClickHandler}>
      <PluginIcon className={cx('integration-image')} pluginData={integrationType} alt={name} />
      <div className={cx('integration-info-block')}>
        <div className={cx('integration-data-block')}>
          <span className={cx('integration-name')}>{PLUGIN_NAME_TITLES[name] || name}</span>
          <span className={cx('integration-version')}>
            {details.version && `${formatMessage(messages.version)} ${details.version}`}
          </span>
        </div>

        <p className={cx('integration-description')}>
          {PLUGIN_DESCRIPTIONS_MAP[name] || (details.description && Parser(details.description))}
        </p>
      </div>
    </div>
  );
};

IntegrationsListItem.propTypes = {
  integrationType: PropTypes.object.isRequired,
  onItemClick: PropTypes.func,
};
