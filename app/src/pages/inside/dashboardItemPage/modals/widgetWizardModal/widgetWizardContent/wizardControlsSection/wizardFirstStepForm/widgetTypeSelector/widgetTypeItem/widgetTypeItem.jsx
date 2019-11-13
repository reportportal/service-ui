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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { InputRadio } from 'components/inputs/inputRadio';
import styles from './widgetTypeItem.scss';

const cx = classNames.bind(styles);

export const WidgetTypeItem = ({ widget, activeWidgetId, onChange }) => (
  <div className={cx('widget-type-item')}>
    <InputRadio
      value={activeWidgetId}
      ownValue={widget.id}
      name={'widget-type'}
      onChange={onChange}
      circleAtTop
    >
      <div className={cx('widget-type-item-name', { active: widget.id === activeWidgetId })}>
        {widget.title}
      </div>
    </InputRadio>
  </div>
);
WidgetTypeItem.propTypes = {
  widget: PropTypes.object,
  activeWidgetId: PropTypes.string,
  onChange: PropTypes.func,
};
WidgetTypeItem.defaultProps = {
  widget: {},
  activeWidgetId: '',
  onChange: () => {},
};
