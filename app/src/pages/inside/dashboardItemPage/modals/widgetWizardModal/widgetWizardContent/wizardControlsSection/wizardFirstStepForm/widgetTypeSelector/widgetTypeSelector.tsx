/*
 * Copyright 2026 EPAM Systems
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
import { Widget } from '../../../../types';
import { useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { initialize, touch } from 'redux-form';
import { FieldLabel } from '@reportportal/ui-kit';
import { WidgetTypeItem } from './widgetTypeItem';
import { WIDGET_WIZARD_FORM } from '../../../../../common/constants';
import styles from './widgetTypeSelector.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  heading: {
    id: 'WidgetTypeSelector.heading',
    defaultMessage: 'Choose widget type from the list below',
  },
});

interface WidgetTypeSelectorProps {
  value?: string;
  widgets?: Widget[];
  eventsInfo?: {
    chooseWidgetType?: object;
  };
}

export const WidgetTypeSelector = ({
  value = '',
  widgets = [],
  eventsInfo = {},
}: WidgetTypeSelectorProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const handleWidgetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (eventsInfo.chooseWidgetType) {
      trackEvent(eventsInfo.chooseWidgetType);
    }
    dispatch(initialize(WIDGET_WIZARD_FORM, { widgetType: e.target.value }));
    dispatch(touch(WIDGET_WIZARD_FORM, 'widgetType'));
  };

  return (
    <div className={cx('widget-type-selector')}>
      <FieldLabel className={cx('widget-type-selector-label')}>
        {formatMessage(messages.heading)}
      </FieldLabel>
      <div className={cx('widget-type-list')}>
        {widgets.map((widget: Widget) => (
          <WidgetTypeItem
            key={widget.id}
            activeWidgetId={value}
            widget={widget}
            onChange={handleWidgetSelect}
          />
        ))}
      </div>
    </div>
  );
};
