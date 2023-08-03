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

import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

export const CreateProject = ({ activity }) => (
  <>
    <span className={cx('user-name')}>{activity.objectName}</span>
    <FormattedMessage id="CreateProject" defaultMessage="is created" />
  </>
);
CreateProject.propTypes = activityItemPropTypes;
CreateProject.defaultProps = activityItemDefaultProps;
