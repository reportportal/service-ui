/*
 * Copyright 2019 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ProjectActivity } from 'components/widgets/singleLevelWidgets/tables/projectActivity';
import styles from './activityPanel.scss';

const cx = classNames.bind(styles);

export const ActivityPanel = ({ data: { result } }) => {
  const widget = {
    content: { result: result.slice(0, 150) },
  };

  return (
    <div className={cx('activity-panel')}>
      <ProjectActivity widget={widget} />
    </div>
  );
};

ActivityPanel.propTypes = {
  data: PropTypes.object.isRequired,
};
