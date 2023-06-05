/*
 * Copyright 2023 EPAM Systems
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
import classNames from 'classnames/bind';
import { ASSIGN_USER } from 'common/constants/actionTypes';
import styles from './common.scss';
import { activityItemPropDefaultProps, activityItemPropTypes } from './propTypes';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [ASSIGN_USER]: {
    id: 'AssignUser.by',
    defaultMessage: 'was assigned to the project by',
  },
  [`${ASSIGN_USER}Auto`]: {
    id: 'AssignUser.auto',
    defaultMessage: 'was assigned to the project',
  },
});

export const AssignUser = ({
  activity: {
    user,
    details: { objectName },
  },
}) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <span className={cx('user-name')}>{objectName}</span>
      {user ? (
        <>
          <span>{formatMessage(messages[ASSIGN_USER])}</span>
          <span className={cx('user-name')}> {user}.</span>
        </>
      ) : (
        <span>{formatMessage(messages[`${ASSIGN_USER}Auto`])}.</span>
      )}
    </>
  );
};
AssignUser.propTypes = {
  ...activityItemPropTypes,
};
AssignUser.defaultProps = {
  ...activityItemPropDefaultProps,
};
