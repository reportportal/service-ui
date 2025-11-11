/*
 * Copyright 2025 EPAM Systems
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

import React, { Fragment } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { DELETE_LOG_TYPE, UPDATE_LOG_TYPE, CREATE_LOG_TYPE } from 'common/constants/actionTypes';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

const NAME = 'name';
const LEVEL = 'level';
const LABEL_COLOR = 'labelColor';
const BACKGROUND_COLOR = 'backgroundColor';
const TEXT_COLOR = 'textColor';
const TEXT_STYLE = 'textStyle';
const SHOW_IN_FILTER = 'isFilterable';

const messages = defineMessages({
  [DELETE_LOG_TYPE]: {
    id: 'LogTypeChanges.delete',
    defaultMessage: 'deleted log type',
  },
  [UPDATE_LOG_TYPE]: {
    id: 'LogTypeChanges.update',
    defaultMessage: 'updated log type',
  },
  [CREATE_LOG_TYPE]: {
    id: 'LogTypeChanges.create',
    defaultMessage: 'created log type',
  },
  [`${NAME}Changed`]: {
    id: 'LogTypeChanges.nameChanged',
    defaultMessage: 'name changed from <span>{oldValue}</span> to <span>{newValue}</span>',
  },
  [`${LEVEL}Changed`]: {
    id: 'LogTypeChanges.levelChanged',
    defaultMessage: 'level changed from <span>{oldValue}</span> to <span>{newValue}</span>',
  },
  [`${LABEL_COLOR}Changed`]: {
    id: 'LogTypeChanges.labelColorChanged',
    defaultMessage: 'label color changed from <span>{oldValue}</span> to <span>{newValue}</span>',
  },
  [`${BACKGROUND_COLOR}Changed`]: {
    id: 'LogTypeChanges.backgroundColorChanged',
    defaultMessage:
      'background color changed from <span>{oldValue}</span> to <span>{newValue}</span>',
  },
  [`${TEXT_COLOR}Changed`]: {
    id: 'LogTypeChanges.textColorChanged',
    defaultMessage: 'text color changed from <span>{oldValue}</span> to <span>{newValue}</span>',
  },
  [`${TEXT_STYLE}Changed`]: {
    id: 'LogTypeChanges.textStyleChanged',
    defaultMessage: 'text changed from <span>{oldValue}</span> to <span>{newValue}</span>',
  },
  [`${SHOW_IN_FILTER}Changed`]: {
    id: 'LogTypeChanges.showInFilterChanged',
    defaultMessage:
      'show in filter changed from <span>{oldValue}</span> to <span>{newValue}</span>',
  },
  on: {
    id: 'LogTypeChanges.on',
    defaultMessage: 'ON',
  },
  off: {
    id: 'LogTypeChanges.off',
    defaultMessage: 'OFF',
  },
});

export const LogType = ({ activity }) => {
  const { formatMessage } = useIntl();

  const valueReplacer = (value, field) =>
    field === SHOW_IN_FILTER
      ? formatMessage(value.toString() === 'true' ? messages.on : messages.off)
      : value;

  const getActivityHistory = () => {
    const historyItems = [];
    const { history = [] } = activity.details || {};

    history.forEach((item) => {
      const { field, oldValue, newValue } = item;
      if (messages[`${field}Changed`]) {
        const formattedOldValue = valueReplacer(oldValue, field);
        const formattedNewValue = valueReplacer(newValue, field);

        historyItems.push({
          key: `${field}-${oldValue}-${newValue}`,
          content: formatMessage(messages[`${field}Changed`], {
            oldValue: formattedOldValue,
            newValue: formattedNewValue,
            span: (content) => <span className={cx('activity-name')}>{content}</span>,
          }),
        });
      }
    });

    if (historyItems.length === 0) return null;

    return (
      <>
        :{' '}
        {historyItems.map((historyItem, index) => (
          <Fragment key={historyItem.key}>
            {historyItem.content}
            {index < historyItems.length - 1 && ', '}
          </Fragment>
        ))}
      </>
    );
  };

  return (
    <>
      <span className={cx('user-name')}>{activity.user}</span>
      {messages[activity.actionType] && <>{formatMessage(messages[activity.actionType])} </>}
      <span className={cx('activity-name')}>{activity.objectName}</span>
      {getActivityHistory()}
    </>
  );
};

LogType.propTypes = activityItemPropTypes;
LogType.defaultProps = activityItemDefaultProps;
