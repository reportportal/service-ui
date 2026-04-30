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

import classNames from 'classnames/bind';
import moment from 'moment';
import Parser from 'html-react-parser';
import { useIntl, defineMessages } from 'react-intl';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import Tick from 'common/img/newIcons/tick-inline.svg';
import ErrorIcon from 'common/img/newIcons/error-inline.svg';
import { separateFromIntoNameAndEmail } from 'common/utils';
import type { IntegrationData, IntegrationParameters } from '../types';
import {
  AUTH_ENABLED_KEY,
  PROTOCOL_KEY,
  SSL_KEY,
  TLS_KEY,
  HOST_KEY,
  PORT_KEY,
  USERNAME_KEY,
} from '../constants';
import styles from './emailDetailsCard.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  hostLabel: {
    id: 'EmailFormFields.hostLabel',
    defaultMessage: 'Host',
  },
  protocolLabel: {
    id: 'EmailFormFields.protocolLabel',
    defaultMessage: 'Protocol',
  },
  fromNameLabel: {
    id: 'EmailFormFields.fromNameLabel',
    defaultMessage: 'From name',
  },
  fromEmailLabel: {
    id: 'EmailFormFields.fromEmailLabel',
    defaultMessage: 'From Email',
  },
  portLabel: {
    id: 'EmailFormFields.portLabel',
    defaultMessage: 'Port',
  },
  usernameLabel: {
    id: 'EmailFormFields.usernameLabel',
    defaultMessage: 'Username',
  },
  passwordLabel: {
    id: 'EmailFormFields.passwordLabel',
    defaultMessage: 'Password',
  },
  encryptionLabel: {
    id: 'EmailDetailsCard.encryptionLabel',
    defaultMessage: 'Encryption',
  },
  encryptionNone: {
    id: 'EmailDetailsCard.encryptionNone',
    defaultMessage: 'None',
  },
  connectedMessage: {
    id: 'ConnectionSection.connectedMessage',
    defaultMessage: 'Connected',
  },
  connectionErrorMessage: {
    id: 'ConnectionSection.connectionErrorMessage',
    defaultMessage: 'Connection Error',
  },
});

const PASSWORD_MASK = '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';

interface EmailDetailsCardProps {
  data: IntegrationData;
  connected: boolean;
  isEditable: boolean;
}

function getEncryptionValue(
  params: IntegrationParameters,
  noneLabel: string,
): string {
  const parts: string[] = [];
  if (params[TLS_KEY]) parts.push('TLS');
  if (params[SSL_KEY]) parts.push('SSL');
  return parts.length > 0 ? parts.join(', ') : noneLabel;
}

export function EmailDetailsCard({
  data,
  connected,
  isEditable,
}: EmailDetailsCardProps) {
  const { formatMessage } = useIntl();
  const { name, creator, creationDate, integrationParameters } = data;
  const blocked = data.blocked ?? false;

  const separated = separateFromIntoNameAndEmail(integrationParameters) as Record<string, string>;
  const fromName = separated.fromName ?? '';
  const fromEmail = separated.fromEmail ?? '';

  const encryption = getEncryptionValue(
    integrationParameters,
    formatMessage(messages.encryptionNone),
  );

  const fields = [
    {
      label: formatMessage(messages.hostLabel),
      value: integrationParameters[HOST_KEY] ?? '',
    },
    {
      label: formatMessage(messages.protocolLabel),
      value: (integrationParameters[PROTOCOL_KEY] ?? '').toUpperCase(),
    },
    {
      label: formatMessage(messages.fromNameLabel),
      value: fromName,
    },
    {
      label: formatMessage(messages.fromEmailLabel),
      value: fromEmail,
    },
    {
      label: formatMessage(messages.portLabel),
      value: String(integrationParameters[PORT_KEY] ?? ''),
    },
    {
      label: formatMessage(messages.encryptionLabel),
      value: encryption,
    },
  ];

  const authEnabled = integrationParameters[AUTH_ENABLED_KEY];
  if (authEnabled) {
    fields.push(
      {
        label: formatMessage(messages.usernameLabel),
        value: integrationParameters[USERNAME_KEY] ?? '',
      },
      {
        label: formatMessage(messages.passwordLabel),
        value: PASSWORD_MASK,
      },
    );
  }

  return (
    <div className={cx('email-details-card')}>
      <div className={cx('card-header')}>
        <div className={cx('title-row')}>
          <h1 className={cx('title')} title={name}>
            {name}
          </h1>
          <div
            className={cx('connection-badge', {
              'connection-badge-error': !connected,
            })}
          >
            <span className={cx('connection-badge-icon')}>
              {Parser(connected ? Tick : ErrorIcon)}
            </span>
            <span className={cx('connection-badge-text')}>
              {formatMessage(
                connected ? messages.connectedMessage : messages.connectionErrorMessage,
              )}
            </span>
          </div>
          {isEditable && !blocked && (
            // TODO: onClick handler will be added when edit form is implemented
            <button
              type="button"
              className={cx('edit-button')}
              data-automation-id="editIntegrationIcon"
            >
              <span className={cx('edit-button-icon')}>{Parser(PencilIcon)}</span>
            </button>
          )}
        </div>
        <p className={cx('subtitle')}>
          {creator} on {moment(creationDate).format('ll')}
        </p>
      </div>
      <div className={cx('parameters-grid')}>
        {fields.map((field) => (
          <div key={field.label} className={cx('parameter-item')}>
            <span className={cx('parameter-label')}>{field.label}</span>
            <span className={cx('parameter-value')}>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
