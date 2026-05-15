/*
 * Copyright 2026 EPAM Systems
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

import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import type { Plugin } from 'controllers/plugins';
import { createClassnames } from 'common/utils';
import styles from './integrationsListItem.scss';

const cx = createClassnames(styles);

export const messages = defineMessages({
  version: {
    id: 'InfoSection.version',
    defaultMessage: 'version',
  },
});

export interface IntegrationsListItemProps {
  integrationType: Plugin;
  onItemClick?: (plugin: Plugin) => void;
}

export const IntegrationsListItem = ({
  integrationType,
  onItemClick = () => {},
}: IntegrationsListItemProps) => {
  const { formatMessage } = useIntl();
  const { name, details } = integrationType;

  const displayName = details.name || name;

  const itemClickHandler = () => {
    onItemClick(integrationType);
  };

  return (
    <div
      className={cx('integrations-list-item')}
      onClick={itemClickHandler}
      data-automation-id="listItem"
    >
      <PluginIcon
        className={cx('integration-image')}
        pluginData={integrationType}
        alt={displayName}
      />
      <div className={cx('integration-info-block')}>
        <div className={cx('integration-data-block')}>
          <span className={cx('integration-name')}>{displayName}</span>
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
