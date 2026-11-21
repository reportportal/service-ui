/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import type { PipelineCiConnectionState } from 'controllers/aiFactory/pipelines';

import { messages } from './messages';
import styles from './pipelineCiConnectionSettings.scss';

const cx = classNames.bind(styles);

const statusMessages = {
  CONNECTED: messages.ciConnected,
  NOT_CONNECTED: messages.ciNotConnected,
  CONNECTION_FAILED: messages.ciConnectionFailed,
};

interface PipelineCiConnectionStatusProps {
  state?: PipelineCiConnectionState;
  emphasis?: boolean;
}

export const PipelineCiConnectionStatus = ({
  state,
  emphasis = false,
}: PipelineCiConnectionStatusProps) => {
  const { formatMessage } = useIntl();
  return (
    <span
      className={cx('ci-status', {
        'ci-status--connected': state === 'CONNECTED',
        'ci-status--disconnected': Boolean(state && state !== 'CONNECTED'),
        'ci-status--emphasis': emphasis,
      })}
      data-automation-id="pipelineCiConnectionStatus"
    >
      {formatMessage(state ? statusMessages[state] : messages.ciStatusUnavailable)}
    </span>
  );
};
