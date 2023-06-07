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

import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './common.scss';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';

const cx = classNames.bind(styles);

export const UnassignUser = ({
  activity: {
    user,
    details: { objectName },
  },
}) => (
  <>
    <span className={cx('user-name')}>{objectName}</span>
    <FormattedMessage id="UnassignUser.by" defaultMessage="was unassigned from the project by" />
    <span className={cx('user-name')}> {user}</span>
  </>
);
UnassignUser.propTypes = activityItemPropTypes;
UnassignUser.defaultProps = activityItemDefaultProps;
