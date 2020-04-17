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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { InputRadio } from 'components/inputs/inputRadio';
import { OwnerBlock } from 'pages/inside/common/itemInfo/ownerBlock';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import styles from './widgetListItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  alreadyAddedWidgetTitle: {
    id: 'WidgetListItem.alreadyAddedWidgetTitle',
    defaultMessage: 'Widget is already added to selected dashboard',
  },
});

@injectIntl
export class WidgetListItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    activeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    activeId: '',
  };

  render() {
    const {
      intl: { formatMessage },
      activeId,
      widget,
      onChange,
    } = this.props;

    return (
      <div
        className={cx('widget-list-item', { 'already-added': widget.alreadyAdded })}
        title={widget.alreadyAdded ? formatMessage(messages.alreadyAddedWidgetTitle) : ''}
      >
        <InputRadio
          value={String(activeId)}
          ownValue={String(widget.id)}
          name="widgetId"
          disabled={widget.alreadyAdded}
          onChange={() => onChange(widget)}
          circleAtTop
        >
          <span className={cx('widget-name')}>{widget.name}</span>
          <span className={cx('widget-type')}>
            {widget.widgetType && formatMessage(widgetTypesMessages[widget.widgetType])}
          </span>
          <OwnerBlock owner={widget.owner} disabled />
        </InputRadio>
      </div>
    );
  }
}
