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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { submit } from 'redux-form';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showDefaultErrorNotification } from 'controllers/notification';
import { activeProjectSelector } from 'controllers/user';
import { fetchDashboardsAction } from 'controllers/dashboard';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { WIDGET_WIZARD_FORM } from '../../common/constants';
import { prepareWidgetDataForSubmit, getDefaultWidgetConfig } from '../../common/utils';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    submitWidgetWizardForm: () => submit(WIDGET_WIZARD_FORM),
    showScreenLockAction,
    fetchDashboards: fetchDashboardsAction,
    hideScreenLockAction,
    showDefaultErrorNotification,
  },
)
@track()
export class WidgetWizardContent extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    formValues: PropTypes.object,
    submitWidgetWizardForm: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    showConfirmation: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    fetchDashboards: PropTypes.func,
  };
  static defaultProps = {
    formValues: {
      widgetType: '',
    },
    eventsInfo: {},
    onConfirm: () => {},
    fetchDashboards: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
    };
    const { fetchDashboards } = this.props;
    fetchDashboards();
    this.widgets = getWidgets(props.intl.formatMessage);
  }

  onClickNextStep = () => {
    this.props.tracking.trackEvent(this.props.eventsInfo.nextStep);
    this.props.submitWidgetWizardForm();
  };

  onClickPrevStep = () => {
    this.setState({ step: this.state.step - 1 });
    this.props.tracking.trackEvent(this.props.eventsInfo.prevStep);
  };

  onAddWidget = (formData) => {
    const {
      tracking: { trackEvent },
      eventsInfo: { addWidget },
      projectId,
      onConfirm,
    } = this.props;
    const { selectedDashboard, ...rest } = formData;

    const data = prepareWidgetDataForSubmit(this.preprocessOutputData(rest));

    trackEvent(addWidget);
    this.props.showScreenLockAction();
    fetch(URLS.widget(projectId), {
      method: 'post',
      data,
    })
      .then(({ id }) => {
        const newWidget = {
          widgetId: id,
          widgetName: data.name,
          widgetType: data.widgetType,
          ...getDefaultWidgetConfig(data.widgetType),
        };
        onConfirm(newWidget, this.props.closeModal, selectedDashboard);
      })
      .catch((err) => {
        this.props.hideScreenLockAction();
        this.props.showDefaultErrorNotification(err);
      });
  };

  preprocessOutputData = (data) => {
    const widgetInfo = this.widgets.find((widget) => widget.id === data.widgetType);
    if (widgetInfo && widgetInfo.convertOutput) {
      return widgetInfo.convertOutput(data);
    }
    return data;
  };

  nextStep = () => {
    this.setState({ step: this.state.step + 1 });
  };

  render() {
    const {
      formValues: { widgetType },
      showConfirmation,
    } = this.props;

    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection
          activeWidget={this.widgets.find((widget) => widgetType === widget.id)}
          projectId={this.props.projectId}
          widgetSettings={prepareWidgetDataForSubmit(
            this.preprocessOutputData(this.props.formValues),
          )}
          step={this.state.step}
          showConfirmation={showConfirmation}
        />
        <WizardControlsSection
          eventsInfo={this.props.eventsInfo}
          widgets={this.widgets}
          activeWidgetId={widgetType}
          step={this.state.step}
          onClickNextStep={this.onClickNextStep}
          onClickPrevStep={this.onClickPrevStep}
          nextStep={this.nextStep}
          onAddWidget={this.onAddWidget}
          submitWidgetWizardForm={this.props.submitWidgetWizardForm}
        />
      </div>
    );
  }
}
