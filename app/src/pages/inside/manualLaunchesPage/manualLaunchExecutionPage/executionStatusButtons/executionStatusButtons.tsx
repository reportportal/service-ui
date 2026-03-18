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

import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { useManualLaunchId } from 'hooks/useTypedSelector';
import { updateManualLaunchExecutionStatusAction } from 'controllers/manualLaunch';
import { projectKeySelector } from 'controllers/project';

import { STATUS_BUTTONS } from '../constants';
import type { ExecutionStatusButtonsProps } from '../types';

import styles from './executionStatusButtons.scss';

const cx = createClassnames(styles);

export const ExecutionStatusButtons = ({ executionId }: ExecutionStatusButtonsProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const launchId = useManualLaunchId();

  const handleStatusClick = (status: string) => {
    dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey,
        launchId,
        executionId,
        status: status.toUpperCase(),
      }),
    );
  };

  return (
    <div className={cx('execution-status-buttons')}>
      {STATUS_BUTTONS.map(({ status, message }) => (
        <button
          key={status}
          type="button"
          className={cx('status-button', `status-button--${status}`)}
          onClick={() => handleStatusClick(status)}
        >
          {formatMessage(message)}
        </button>
      ))}
    </div>
  );
};
