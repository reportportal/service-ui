/*
 * Copyright 2021 EPAM Systems
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

import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { useSelector } from 'react-redux';
import commentIcon from 'common/img/comment-inline.svg';
import asteriskIcon from 'common/img/asterisk-inline.svg';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import { uniqueId } from 'common/utils';
import { useIntl } from 'react-intl';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { logTypesSelector } from 'controllers/project';
import { getLogLevelStyles } from 'controllers/log/storageUtils';
import { DEFAULT_TEST_ITEM_DETAILS, ERROR_LOGS_SIZE } from '../../constants';
import { ItemHeader } from './itemHeader';
import { messages } from '../../messages';
import styles from './testItemDetails.scss';

const cx = classNames.bind(styles);

export const TestItemDetails = ({
  item,
  mode,
  selectItem,
  logs,
  eventsInfo,
  highlightedLogId,
  highlightedMessage,
  hideLabels,
  isSelected,
  showErrorLogs,
  loading,
  onToggleCallback,
}) => {
  const { formatMessage } = useIntl();
  const [showDetails, setShowDetails] = useState(showErrorLogs);
  const logLevels = useSelector(logTypesSelector);

  useEffect(() => {
    setShowDetails(showErrorLogs);
  }, [showErrorLogs]);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
    onToggleCallback(item.id);
  };

  return (
    <div className={cx('test-item-details')}>
      <ItemHeader
        item={item}
        mode={mode}
        selectItem={selectItem}
        isSelected={isSelected}
        hideLabels={hideLabels}
        onClickLinkEvent={eventsInfo.onClickExternalLinkEvent}
        toggleDetails={toggleDetails}
      />
      {showDetails && loading ? (
        <SpinningPreloader />
      ) : (
        showDetails && (
          <div className={cx('test-item-details-content')}>
            {item.issue?.comment && (
              <div className={cx('defect-comment')}>
                <div>{Parser(commentIcon)}</div>
                <div className={cx('defect-comment-content')}>
                  <p className={cx('defect-comment-title')}>{formatMessage(messages.comment)}</p>
                  <p className={cx('defect-comment-text')}>{item.issue.comment}</p>
                </div>
              </div>
            )}
            {showDetails &&
              logs.slice(0, ERROR_LOGS_SIZE).map((log) => {
                const { labelColor } = getLogLevelStyles(log.level, logLevels);
                return (
                  <div key={uniqueId()} className={cx('error-log')}>
                    <StackTraceMessageBlock
                      level={log.level}
                      designMode="dark"
                      maxHeight={90}
                      eventsInfo={eventsInfo}
                      rowWrapperStyles={{ labelColor }}
                    >
                      <div className={cx('highlighted-log')}>
                        {highlightedLogId === log.id && (
                          <p className={cx('highlighted-log-title')}>
                            {Parser(asteriskIcon)} {highlightedMessage}
                          </p>
                        )}
                        {log.message}
                      </div>
                    </StackTraceMessageBlock>
                  </div>
                );
              })}
            {showDetails && !logs.length && (
              <div className={cx('no-logs')}>
                <p className={cx('no-logs-text')}>{formatMessage(messages.noLogs)}</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

TestItemDetails.propTypes = {
  item: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  selectItem: PropTypes.func,
  hideLabels: PropTypes.bool,
  logs: PropTypes.array,
  eventsInfo: PropTypes.object,
  highlightedLogId: PropTypes.number,
  highlightedMessage: PropTypes.string,
  mode: PropTypes.string,
  showErrorLogs: PropTypes.bool,
  loading: PropTypes.bool,
  onToggleCallback: PropTypes.func,
};

TestItemDetails.defaultProps = {
  isSelected: false,
  selectItem: () => {},
  hideLabels: false,
  logs: [],
  eventsInfo: {},
  highlightedLogId: null,
  highlightedMessage: '',
  mode: DEFAULT_TEST_ITEM_DETAILS,
  showErrorLogs: false,
  loading: false,
  onToggleCallback: () => {},
};
