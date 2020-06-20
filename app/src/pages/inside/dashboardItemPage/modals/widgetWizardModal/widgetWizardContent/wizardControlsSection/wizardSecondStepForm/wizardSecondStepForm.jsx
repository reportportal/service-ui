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
import { connect } from 'react-redux';
import { reduxForm, initialize, getFormValues } from 'redux-form';
import PropTypes from 'prop-types';
import { activeFilterSelector } from 'controllers/filter';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ filters }) => ({
    filters: (!filters || !filters.length) && 'error',
  }),
})
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
    activeLaunchFilter: activeFilterSelector(state),
  }),
  {
    initializeWizardSecondStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
export class WizardSecondStepForm extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDisableButtons: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
    activeLaunchFilter: PropTypes.object,
  };

  static defaultProps = {
    handleSubmit: () => {},
    eventsInfo: {},
    activeLaunchFilter: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      formAppearance: {
        mode: false,
        isMainControlsLocked: false,
        filter: {},
        predefinedFilter: this.props.activeLaunchFilter || null,
      },
    };
  }

  handleFormAppearanceChange = (mode, filter) => {
    const { onDisableButtons } = this.props;

    this.setState({
      formAppearance: { ...this.state.formAppearance, mode, filter, isMainControlsLocked: !!mode },
    });
    onDisableButtons(mode !== false);
  };

  render() {
    const {
      onSubmit,
      handleSubmit,
      widget,
      initializeWizardSecondStepForm,
      widgetSettings,
      eventsInfo,
    } = this.props;
    const { formAppearance } = this.state;
    const ControlsForm = widget.controls;

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <ControlsForm
          widgetType={widget.id}
          formAppearance={formAppearance}
          onFormAppearanceChange={this.handleFormAppearanceChange}
          initializeControlsForm={initializeWizardSecondStepForm}
          widgetSettings={widgetSettings}
          eventsInfo={eventsInfo}
        />
      </form>
    );
  }
}
