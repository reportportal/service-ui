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

import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import { UPDATE_ITEM } from 'common/constants/actionTypes';
import { ENTITY_STATUS } from 'components/filterEntities/constants';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  autoAnalyzer: {
    id: 'UpdateItem.autoAnalyzer',
    defaultMessage: 'Auto-Analyzer',
  },
  typeChanged: {
    id: 'UpdateItem.typeChanged',
    defaultMessage: 'defect type changed from',
  },
  statusChanged: {
    id: 'UpdateItem.statusChanged',
    defaultMessage: 'status changed from',
  },
  updateItem: {
    id: 'UpdateItem.updateItem',
    defaultMessage: 'updated item',
  },
  to: {
    id: 'UpdateItem.to',
    defaultMessage: 'to',
  },
});

export const UpdateItem = ({ activity }) => {
  const { formatMessage } = useIntl();
  const {
    actionType,
    details: {
      history: [{ newValue, oldValue, field }],
    },
    objectName,
  } = activity;

  return (
    <>
      {actionType === UPDATE_ITEM ? (
        <span className={cx('user-name')}>{activity.user} </span>
      ) : (
        <span className={cx('user-name')}>{formatMessage(messages.autoAnalyzer)} </span>
      )}
      <span>{formatMessage(messages.updateItem)}</span>
      <span className={cx('activity-name')}> {objectName}: </span>
      {field === ENTITY_STATUS ? (
        <span>{formatMessage(messages.statusChanged)}</span>
      ) : (
        <span>{formatMessage(messages.typeChanged)}</span>
      )}
      <span className={cx('activity-name')}> {oldValue} </span>
      <span>{formatMessage(messages.to)}</span>
      <span className={cx('activity-name')}> {newValue}</span>
    </>
  );
};

UpdateItem.propTypes = activityItemPropTypes;
UpdateItem.defaultProps = activityItemDefaultProps;
