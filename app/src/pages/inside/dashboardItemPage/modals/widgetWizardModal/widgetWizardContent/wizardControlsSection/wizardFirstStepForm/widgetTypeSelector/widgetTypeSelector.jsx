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
import track from 'react-tracking';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { initialize, touch } from 'redux-form';
import { injectIntl, defineMessages } from 'react-intl';
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

@injectIntl
@connect(null, {
  initializeWizardForm: (data) => initialize(WIDGET_WIZARD_FORM, data),
  touchField: () => touch(WIDGET_WIZARD_FORM, 'widgetType'),
})
@track()
export class WidgetTypeSelector extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.string,
    widgets: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    initializeWizardForm: PropTypes.func.isRequired,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
    touchField: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    value: '',
    error: '',
    widgets: [],
    eventsInfo: {},
  };

  handleWidgetSelect = (e) => {
    this.props.tracking.trackEvent(this.props.eventsInfo.chooseWidgetType);
    this.props.initializeWizardForm({ widgetType: e.target.value });
    this.props.touchField();
  };

  render() {
    const { intl, widgets, error, touched, value } = this.props;

    return (
      <div className={cx('widget-type-selector')}>
        <div className={cx('widget-type-selector-heading', { 'has-errors': error && touched })}>
          {Parser(intl.formatMessage(messages.heading))}
        </div>

        {widgets.map((widget) => (
          <WidgetTypeItem
            key={widget.id}
            activeWidgetId={value}
            widget={widget}
            onChange={this.handleWidgetSelect}
          />
        ))}
      </div>
    );
  }
}
