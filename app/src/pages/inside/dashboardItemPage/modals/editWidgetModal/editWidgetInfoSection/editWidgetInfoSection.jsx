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
import { WidgetInfoBlock } from '../../common/widgetInfoBlock';
import styles from './editWidgetInfoSection.scss';

const cx = classNames.bind(styles);

export const EditWidgetInfoSection = ({ projectId, widgetSettings, activeWidget }) => (
  <div className={cx('edit-widget-info-section')}>
    <WidgetInfoBlock
      projectId={projectId}
      activeWidget={activeWidget}
      widgetSettings={widgetSettings}
    />
  </div>
);

EditWidgetInfoSection.propTypes = {
  projectId: PropTypes.string.isRequired,
  widgetSettings: PropTypes.object,
  activeWidget: PropTypes.object,
};

EditWidgetInfoSection.defaultProps = {
  widgetSettings: {},
  activeWidget: {},
};
