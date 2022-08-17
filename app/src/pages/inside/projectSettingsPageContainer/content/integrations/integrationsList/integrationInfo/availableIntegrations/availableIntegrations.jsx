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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { SystemMessage } from 'componentLibrary/systemMessage';
import { defineMessages, useIntl } from 'react-intl';
import { InstancesListInfo } from '../instancesListInfo';
import styles from './availableIntegrations.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  GlobalIntegrationsSystemMessage: {
    id: 'IntegrationsDescription.GlobalIntegrationsSystemMessage',
    defaultMessage: 'Warning',
  },
  GlobalIntegrationsSystemMessageText: {
    id: 'IntegrationsDescription.GlobalIntegrationsSystemMessageText',
    defaultMessage: 'Global Integrations are inactive as you have configured Project Integration',
  },
});

export const AvailableIntegrations = ({
  header,
  text,
  typeOfIntegration,
  isGlobal,
  onArrowClick,
}) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('global-integrations-section')}>
      <h1 className={cx('global-integrations-header')}>{header}</h1>
      <p className={cx('global-integrations-text')}>{text}</p>
      {isGlobal && (
        <div className={cx('message-container')}>
          <SystemMessage
            header={formatMessage(messages.GlobalIntegrationsSystemMessage)}
            mode={'warning'}
          >
            {formatMessage(messages.GlobalIntegrationsSystemMessageText)}
          </SystemMessage>
        </div>
      )}
      <InstancesListInfo
        items={typeOfIntegration}
        disabled={isGlobal}
        onArrowClick={onArrowClick}
      />
    </div>
  );
};

AvailableIntegrations.propTypes = {
  header: PropTypes.string,
  text: PropTypes.string,
  typeOfIntegration: PropTypes.array.isRequired,
  isGlobal: PropTypes.bool,
  onArrowClick: PropTypes.func,
};

AvailableIntegrations.defaultProps = {
  header: '',
  text: '',
  typeOfIntegration: [],
  isGlobal: false,
};
