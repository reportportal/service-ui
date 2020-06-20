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
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { destroy, getFormValues, isDirty, isValid } from 'redux-form';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { activeProjectSelector } from 'controllers/user';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { EditWidgetControlsSectionForm } from './editWidgetControlsSectionForm';
import { EditWidgetInfoSection } from './editWidgetInfoSection';
import { WIDGET_WIZARD_FORM } from '../common/constants';
import { prepareWidgetDataForSubmit } from '../common/utils';
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
    defaultMessage: 'Widget has been updated',
  },
});

@withModal('editWidgetModal')
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
    dirty: isDirty(WIDGET_WIZARD_FORM)(state),
    valid: isValid(WIDGET_WIZARD_FORM)(state),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    destroyWizardForm: () => destroy(WIDGET_WIZARD_FORM),
  },
)
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
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      widget: PropTypes.object,
      eventsInfo: PropTypes.object,
    }),
    projectId: PropTypes.string,
  };

  static defaultProps = {
    data: {
      onConfirm: () => {},
      widget: {},
    },
    widgetSettings: {},
    projectId: '',
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
      filters: widget.appliedFilters.map(({ id, name }) => ({ value: id.toString(), name })),
    };
    this.initialValues = this.preprocessInputData(this.initialValues);
    delete this.initialValues.appliedFilters;
    delete this.initialValues.content;
    delete this.initialValues.id;

    this.state = {
      formAppearance: {
        mode: FORM_APPEARANCE_MODE_LOCKED,
        isMainControlsLocked: false,
        filter: {},
        predefinedFilter: widget.appliedFilters[0] || null,
      },
      previousFilter: this.initialValues.filters,
    };
  }

  componentWillUnmount() {
    this.props.destroyWizardForm();
  }

  onSave = (closeModal) => {
    const {
      data: { onConfirm, widget },
      intl: { formatMessage },
      widgetSettings,
      projectId,
    } = this.props;

    const data = prepareWidgetDataForSubmit(this.preprocessOutputData(widgetSettings));

    this.props.showScreenLockAction();
    fetch(URLS.widget(projectId, widget.id), {
      method: 'put',
      data,
    })
      .then(() => {
        this.props.hideScreenLockAction();
        closeModal();
        onConfirm();
        this.props.showNotification({
          message: formatMessage(messages.editWidgetSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((err) => {
        this.props.hideScreenLockAction();
        this.props.showNotification({ message: err.message, type: NOTIFICATION_TYPES.ERROR });
      });
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
    if (this.widgetInfo && this.widgetInfo.convertInput) {
      return this.widgetInfo.convertInput(data);
    }
    return data;
  };

  preprocessOutputData = (data) => {
    if (this.widgetInfo && this.widgetInfo.convertOutput) {
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
      projectId,
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
            projectId={projectId}
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
