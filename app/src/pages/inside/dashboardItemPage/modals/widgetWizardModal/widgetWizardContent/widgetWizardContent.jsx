/*
 * Copyright 2025 EPAM Systems
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
import { getFormInitialValues, submit } from 'redux-form';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showDefaultErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { fetchDashboardsAction } from 'controllers/dashboard';
import { analyticsEnabledSelector, baseEventParametersSelector } from 'controllers/appInfo';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { provideEcGA, baseEventParametersShape } from 'components/main/analytics';
import { activeDashboardIdSelector, pageSelector } from 'controllers/pages';
import {
  getWidgetModeValuesString,
  getEcWidget,
} from 'components/main/analytics/events/common/widgetPages/utils';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/messages';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import { WIDGET_WIZARD_FORM } from '../../common/constants';
import {
  getCreatedWidgetLevelsCount,
  getModifiedFieldsLabels,
  prepareWidgetDataForSubmit,
  getDefaultWidgetConfig,
  getIsExcludeSkipped,
} from '../../common/utils';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    projectKey: projectKeySelector(state),
    activeDashboardId: activeDashboardIdSelector(state),
    currentPage: pageSelector(state),
    isAnalyticsEnabled: analyticsEnabledSelector(state),
    baseEventParameters: baseEventParametersSelector(state),
    initialFormValues: getFormInitialValues(WIDGET_WIZARD_FORM)(state),
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
    projectKey: PropTypes.string.isRequired,
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
    baseEventParameters: baseEventParametersShape,
    initialFormValues: PropTypes.object,
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
      intl: { formatMessage },
    } = this.props;
    this.widgets = getWidgets(formatMessage);
  }

  componentDidMount() {
    if (!this.props.activeDashboardId) {
      this.props.fetchDashboards();
    }
  }

  getOffsetStep = () => {
    const activeWidget = this.widgets.find(
      (widget) => widget.id === this.props.formValues.widgetType,
    );
    const skipSecondStep = !activeWidget?.controls;
    return skipSecondStep ? 2 : 1;
  };

  onClickNextStep = () => {
    const {
      tracking,
      eventsInfo,
      formValues,
      submitWidgetWizardForm,
      isAnalyticsEnabled,
      activeDashboardId,
      baseEventParameters,
    } = this.props;

    if (isAnalyticsEnabled) {
      provideEcGA({
        eventName: 'view_item',
        baseEventParameters,
        additionalParameters: {
          item_list_name: activeDashboardId || 'noID',
          items: [
            getEcWidget({
              itemName: widgetTypesMessages[formValues.widgetType].defaultMessage,
              itemVariant: this.props.currentPage,
              itemListName: activeDashboardId || 'noID',
            }),
          ],
        },
      });
    }

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
  };

  onClickPrevStep = () => {
    const offsetStep = this.getOffsetStep();
    this.setState({ step: this.state.step - offsetStep });
    this.props.tracking.trackEvent(this.props.eventsInfo.prevStep);
  };

  onAddWidget = (formData) => {
    const {
      tracking: { trackEvent },
      projectKey,
      onConfirm,
      initialFormValues,
      activeDashboardId,
      isAnalyticsEnabled,
      baseEventParameters,
    } = this.props;

    const { selectedDashboard, ...rest } = formData;
    const data = prepareWidgetDataForSubmit(this.preprocessOutputData(rest));
    const { widgetType, name } = data;

    this.props.showScreenLockAction();
    fetch(URLS.widget(projectKey), {
      method: 'post',
      data,
    })
      .then(({ id }) => {
        const newWidget = {
          widgetId: id,
          widgetName: name,
          widgetType,
          ...getDefaultWidgetConfig(widgetType),
        };
        onConfirm(newWidget, this.props.closeModal, selectedDashboard);

        trackEvent(
          WIDGETS_EVENTS.clickOnSaveWidget({
            type: widgetType,
            dashboardId: activeDashboardId,
            modifiedFields: getModifiedFieldsLabels(
              initialFormValues?.contentParameters,
              data?.contentParameters,
            ),
            isWidgetNameChanged: name !== initialFormValues?.name,
            isWidgetDescriptionChanged: data?.description !== initialFormValues?.description,
            levelsCount: getCreatedWidgetLevelsCount(widgetType, data),
            isExcludeSkippedTests: getIsExcludeSkipped(widgetType, data),
          }),
        );

        if (isAnalyticsEnabled) {
          provideEcGA({
            eventName: 'add_to_cart',
            baseEventParameters,
            additionalParameters: {
              item_list_name: selectedDashboard.id,
              items: [
                getEcWidget({
                  itemId: id,
                  itemName: widgetTypesMessages[widgetType].defaultMessage,
                  itemVariant: this.props.currentPage,
                  itemListName: selectedDashboard.id,
                }),
              ],
            },
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
    if (widgetInfo?.convertOutput) {
      return widgetInfo.convertOutput(data);
    }
    return data;
  };

  nextStep = () => {
    const offsetStep = this.getOffsetStep();
    this.setState({ step: this.state.step + offsetStep });
  };

  render() {
    const {
      formValues: { widgetType },
      formValues,
      showConfirmation,
      projectKey,
      eventsInfo,
      submitWidgetWizardForm,
    } = this.props;

    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection
          activeWidget={this.widgets.find((widget) => widgetType === widget.id)}
          projectKey={projectKey}
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
