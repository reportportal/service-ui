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
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { WidgetTypeSelector } from './widgetTypeSelector';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';
import styles from './wizardFirstStepForm.scss';

const cx = classNames.bind(styles);

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ widgetType }) => ({
    widgetType: !widgetType && 'error',
  }),
})
export class WizardFirstStepForm extends Component {
  static propTypes = {
    widgets: PropTypes.array,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    widgets: [],
    eventsInfo: {},
  };

  render() {
    const { handleSubmit, widgets, onSubmit, eventsInfo } = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={cx('wizard-first-step-form')}>
        <FieldProvider name="widgetType">
          <WidgetTypeSelector widgets={widgets} eventsInfo={eventsInfo} />
        </FieldProvider>
      </form>
    );
  }
}
