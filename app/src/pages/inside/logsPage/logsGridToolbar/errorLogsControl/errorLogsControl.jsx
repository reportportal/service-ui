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

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classname from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
import { NEXT, PREVIOUS } from 'controllers/log';
import styles from './errorLogsControl.scss';

const cx = classname.bind(styles);

const messages = defineMessages({
  errorLogsInitial: {
    id: 'ErrorLogsBlock.errorLogsInitial',
    defaultMessage:
      '{count, plural, =0 {No Error Logs} one {{totalItems} Error Log} other {{totalItems} Error Logs}}',
  },
  errorLogs: {
    id: 'ErrorLogsBlock.errorLogs',
    defaultMessage:
      '{count, plural, one {{totalItems} Error Log} other {{currentItem} of {totalItems} Error Logs}}',
  },
  previousErrorLog: {
    id: 'ErrorLogsBlock.previousErrorLog',
    defaultMessage: 'Show previous Error Log',
  },
  nextErrorLog: {
    id: 'ErrorLogsBlock.nextErrorLog',
    defaultMessage: 'Show next Error Log',
  },
  showErrorLog: {
    id: 'ErrorLogsBlock.showErrorLog',
    defaultMessage: 'Show',
  },
});

const Counter = ({ counter }) => <span className={cx('error-counter')}>{counter}</span>;
Counter.propTypes = {
  counter: PropTypes.number.isRequired,
};

export const ErrorLogsControl = ({ errorLogs, highlightErrorLog, errorLogIndex }) => {
  const { formatMessage } = useIntl();
  const errorLogsLength = useMemo(() => errorLogs.length, [errorLogs]);
  const currentElementNumber = useMemo(() => errorLogIndex + 1, [errorLogIndex]);

  return (
    <div className={cx('error-logs-block')}>
      {errorLogsLength > 1 ? (
        <div className={cx('buttons-block')}>
          <div className={cx('left-arrow-button')}>
            <GhostButton
              icon={LeftArrowIcon}
              title={formatMessage(messages.previousErrorLog)}
              onClick={() => highlightErrorLog(PREVIOUS)}
              transparentBackground
            />
          </div>
          <GhostButton
            icon={RightArrowIcon}
            title={formatMessage(messages.nextErrorLog)}
            onClick={() => highlightErrorLog(NEXT)}
            transparentBackground
          />
        </div>
      ) : (
        <GhostButton onClick={highlightErrorLog} disabled={!errorLogsLength}>
          {formatMessage(messages.showErrorLog)}
        </GhostButton>
      )}
      <span className={cx('error-counter-text')}>
        {errorLogIndex === null
          ? formatMessage(messages.errorLogsInitial, {
              count: errorLogsLength,
              totalItems: <Counter counter={errorLogsLength} key={0} />,
            })
          : formatMessage(messages.errorLogs, {
              count: errorLogsLength,
              currentItem: <Counter counter={currentElementNumber} key={1} />,
              totalItems: <Counter counter={errorLogsLength} key={2} />,
            })}
      </span>
    </div>
  );
};
ErrorLogsControl.propTypes = {
  errorLogs: PropTypes.array.isRequired,
  highlightErrorLog: PropTypes.func.isRequired,
  errorLogIndex: PropTypes.number,
};
ErrorLogsControl.defaultProps = {
  errorLogIndex: null,
};
