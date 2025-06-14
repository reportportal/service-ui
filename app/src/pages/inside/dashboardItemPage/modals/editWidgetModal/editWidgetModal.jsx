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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { destroy, getFormInitialValues, getFormValues, isDirty, isValid } from 'redux-form';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { getWidgetModeValuesString } from 'components/main/analytics/events/common/widgetPages/utils';
import { projectKeySelector } from 'controllers/project';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import { activeDashboardIdSelector } from 'controllers/pages';
import { EditWidgetControlsSectionForm } from './editWidgetControlsSectionForm';
import { EditWidgetInfoSection } from './editWidgetInfoSection';
import { WIDGET_WIZARD_FORM } from '../common/constants';
import {
  getCreatedWidgetLevelsCount,
  getIsExcludeSkipped,
  getModifiedFieldsLabels,
  prepareWidgetDataForSubmit,
} from '../common/utils';
import { FORM_APPEARANCE_MODE_LOCKED } from '../common/widgetControls/controls/filtersControl/common/constants';
import styles from './editWidgetModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  headerText: {
    id: 'EditWidgetModal.headerText',
    defaultMessage: 'Edit widget',
  },
  editWidgetSuccess: {
    id: 'EditWidgetModal.editWidgetSuccess',
    defaultMessage: 'Widget has been updated successfully',
  },
});

@withModal('editWidgetModal')
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
    initiallyFilledWidgetSettings: getFormInitialValues(WIDGET_WIZARD_FORM)(state),
    activeDashboardId: activeDashboardIdSelector(state),
    dirty: isDirty(WIDGET_WIZARD_FORM)(state),
    valid: isValid(WIDGET_WIZARD_FORM)(state),
    projectKey: projectKeySelector(state),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    destroyWizardForm: () => destroy(WIDGET_WIZARD_FORM),
  },
)
@track()
@injectIntl
export class EditWidgetModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    destroyWizardForm: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    valid: PropTypes.bool.isRequired,
    widgetSettings: PropTypes.object,
    activeDashboardId: PropTypes.number,
    initiallyFilledWidgetSettings: PropTypes.object,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      widget: PropTypes.object,
      eventsInfo: PropTypes.object,
    }),
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    projectKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    data: {
      onConfirm: () => {},
      widget: {},
    },
    widgetSettings: {},
    eventsInfo: {},
  };

  constructor(props) {
    super(props);
    const {
      data: { widget },
      intl: { formatMessage },
    } = props;

    this.widgetInfo = getWidgets(formatMessage).find((item) => item.id === widget.widgetType);
    this.initialValues = {
      ...widget,
      ...(widget.appliedFilters && {
        filters: widget.appliedFilters.map(({ id, name }) => ({ value: id.toString(), name })),
      }),
    };
    this.initialValues = this.preprocessInputData(this.initialValues);
    delete this.initialValues?.appliedFilters;
    delete this.initialValues.content;
    delete this.initialValues.id;

    this.state = {
      formAppearance: {
        mode: FORM_APPEARANCE_MODE_LOCKED,
        isMainControlsLocked: false,
        filter: {},
        predefinedFilter: widget.appliedFilters?.[0] || null,
      },
      previousFilter: this.initialValues?.filters,
    };
  }

  componentWillUnmount() {
    this.props.destroyWizardForm();
  }

  onSave = (closeModal) => {
    const {
      tracking: { trackEvent },
      data: { onConfirm, widget },
      intl: { formatMessage },
      widgetSettings,
      projectKey,
      initiallyFilledWidgetSettings,
      activeDashboardId,
    } = this.props;

    const data = prepareWidgetDataForSubmit(this.preprocessOutputData(widgetSettings));
    const { widgetType, contentParameters, filterIds } = data;

    const isForceUpdateNeeded =
      !isEqual(widget.contentParameters, contentParameters) ||
      !isEqual(
        widget.appliedFilters?.map((filter) => filter.id.toString()),
        filterIds,
      );

    this.props.showScreenLockAction();
    fetch(URLS.widget(projectKey, widget.id), {
      method: 'put',
      data,
    })
      .then(() => {
        const { name } = data;
        trackEvent(
          WIDGETS_EVENTS.clickOnSaveWidget({
            type: widgetType,
            dashboardId: activeDashboardId,
            modifiedFields: getModifiedFieldsLabels(
              initiallyFilledWidgetSettings?.contentParameters,
              data?.contentParameters,
            ),
            isWidgetNameChanged: name !== initiallyFilledWidgetSettings?.name,
            isWidgetDescriptionChanged:
              data?.description !== initiallyFilledWidgetSettings?.description,
            levelsCount: getCreatedWidgetLevelsCount(widgetType, data),
            isExcludeSkippedTests: getIsExcludeSkipped(widgetType, data),
            isEditModal: true,
          }),
        );

        this.props.hideScreenLockAction();
        closeModal();
        onConfirm(isForceUpdateNeeded);
        this.props.showNotification({
          message: formatMessage(messages.editWidgetSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((err) => {
        this.props.hideScreenLockAction();
        this.props.showNotification({ message: err.message, type: NOTIFICATION_TYPES.ERROR });
      });

    if (widgetSettings.contentParameters) {
      this.props.tracking.trackEvent(
        this.props.data.eventsInfo.selectCriteria(widgetSettings.contentParameters.contentFields),
      );
    }

    const widgetMode =
      widgetSettings.contentParameters?.widgetOptions &&
      getWidgetModeValuesString(widgetSettings.contentParameters.widgetOptions);
    if (widgetMode) {
      this.props.tracking.trackEvent(this.props.data.eventsInfo.selectToggleButtons(widgetMode));
    }
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
      confirmationWarningClassName: cx('confirmation-warning-wrapper'),
    };
  };

  preprocessInputData = (data) => {
    if (this.widgetInfo?.convertInput) {
      return this.widgetInfo.convertInput(data);
    }
    return data;
  };

  preprocessOutputData = (data) => {
    if (this.widgetInfo?.convertOutput) {
      return this.widgetInfo.convertOutput(data);
    }
    return data;
  };

  handleFormAppearanceChange = (mode, filter) =>
    this.setState({
      formAppearance: {
        ...this.state.formAppearance,
        mode,
        filter,
        isMainControlsLocked: mode !== FORM_APPEARANCE_MODE_LOCKED,
      },
      previousFilter: !mode ? this.props.widgetSettings.filters : this.state.previousFilter,
    });

  render() {
    const {
      intl: { formatMessage },
      data: { widget, eventsInfo },
      projectKey,
      widgetSettings,
      valid,
    } = this.props;

    const buttonsMessages = {
      cancel: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      submit: formatMessage(COMMON_LOCALE_KEYS.SUBMIT),
    };
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: this.onSave,
      disabled: this.state.formAppearance.isMainControlsLocked || !valid,
      eventInfo: eventsInfo.okBtn,
    };
    const cancelButton = {
      text: buttonsMessages.cancel,
      disabled: this.state.formAppearance.isMainControlsLocked,
      eventInfo: eventsInfo.cancelBtn,
    };

    return (
      <ModalLayout
        title={formatMessage(messages.headerText)}
        okButton={okButton}
        cancelButton={cancelButton}
        className={cx('edit-widget-modal')}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <div className={cx('edit-widget-modal-content')}>
          <EditWidgetInfoSection
            projectKey={projectKey}
            widgetSettings={prepareWidgetDataForSubmit(this.preprocessOutputData(widgetSettings))}
            activeWidget={this.widgetInfo}
          />
          <EditWidgetControlsSectionForm
            initialValues={this.initialValues}
            previousFilter={this.state.previousFilter}
            widget={this.widgetInfo}
            widgetId={widget.id}
            widgetSettings={widgetSettings}
            formAppearance={this.state.formAppearance}
            handleFormAppearanceChange={this.handleFormAppearanceChange}
            buttonsMessages={buttonsMessages}
            eventsInfo={eventsInfo}
          />
        </div>
      </ModalLayout>
    );
  }
}
