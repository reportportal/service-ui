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
import { analyticsEnabledSelector } from 'controllers/appInfo';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { provideEcGA } from 'components/main/analytics';
import { activeDashboardIdSelector, pageSelector } from 'controllers/pages';
import { getWidgetModeValuesString } from 'components/main/analytics/events/common/widgetPages/utils';
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
    activeDashboardId: activeDashboardIdSelector(state),
    currentPage: pageSelector(state),
    isAnalyticsEnabled: analyticsEnabledSelector(state),
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
    isAnalyticsEnabled: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    fetchDashboards: PropTypes.func,
    activeDashboardId: PropTypes.number,
    currentPage: PropTypes.string,
  };
  static defaultProps = {
    formValues: {
      widgetType: '',
    },
    eventsInfo: {},
    onConfirm: () => {},
    fetchDashboards: () => {},
    activeDashboardId: undefined,
    currentPage: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
    };
    const {
      fetchDashboards,
      intl: { formatMessage },
    } = this.props;
    fetchDashboards();
    this.widgets = getWidgets(formatMessage);
  }

  onClickNextStep = () => {
    const {
      tracking,
      eventsInfo,
      formValues,
      submitWidgetWizardForm,
      isAnalyticsEnabled,
    } = this.props;
    tracking.trackEvent(eventsInfo.nextStep);
    if (this.state.step === 1 && formValues.contentParameters.contentFields) {
      tracking.trackEvent(eventsInfo.selectCriteria(formValues.contentParameters.contentFields));
    }

    const widgetMode =
      formValues.contentParameters &&
      getWidgetModeValuesString(formValues.contentParameters.widgetOptions);
    if (this.state.step === 1 && widgetMode) {
      tracking.trackEvent(eventsInfo.selectToggleButtons(widgetMode));
    }

    submitWidgetWizardForm();
    if (isAnalyticsEnabled && this.state.step === 0) {
      provideEcGA({
        name: 'addProduct',
        data: {
          name: formValues.widgetType,
          variant: this.props.currentPage,
          category: 'diagram/unassigned',
        },
        action: 'detail',
        additionalData: { list: this.props.activeDashboardId || 'noID' },
      });
    }
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
      isAnalyticsEnabled,
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
        if (isAnalyticsEnabled) {
          provideEcGA({
            name: 'addProduct',
            data: {
              id,
              name: data.widgetType,
              category: `diagram/${data.contentParameters.widgetOptions.viewMode ||
                'unclassified'}`,
              variant: this.props.currentPage,
            },
            action: 'add',
            additionalData: { list: selectedDashboard.id },
          });
        }
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
      formValues,
      showConfirmation,
      projectId,
      eventsInfo,
      submitWidgetWizardForm,
    } = this.props;

    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection
          activeWidget={this.widgets.find((widget) => widgetType === widget.id)}
          projectId={projectId}
          widgetSettings={prepareWidgetDataForSubmit(this.preprocessOutputData(formValues))}
          step={this.state.step}
          showConfirmation={showConfirmation}
        />
        <WizardControlsSection
          eventsInfo={eventsInfo}
          widgets={this.widgets}
          activeWidgetId={widgetType}
          step={this.state.step}
          onClickNextStep={this.onClickNextStep}
          onClickPrevStep={this.onClickPrevStep}
          nextStep={this.nextStep}
          onAddWidget={this.onAddWidget}
          submitWidgetWizardForm={submitWidgetWizardForm}
        />
      </div>
    );
  }
}
