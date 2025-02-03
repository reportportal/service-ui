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
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { validate, composeBoundValidators, bindMessageToValidator } from 'common/utils/validation';
import styles from './addEditModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  dashboardNamePlaceholder: {
    id: 'DashboardForm.dashboardNamePlaceholder',
    defaultMessage: 'Enter dashboard name',
  },
  dashboardNameLabel: {
    id: 'DashboardForm.dashboardNameLabel',
    defaultMessage: 'Name',
  },
  dashboardDescriptionPlaceholder: {
    id: 'DashboardForm.dashboardDescriptionPlaceholder',
    defaultMessage: 'Enter dashboard description',
  },
  dashboardDescriptionLabel: {
    id: 'DashboardForm.dashboardDescriptionLabel',
    defaultMessage: 'Description',
  },
  editModalTitle: {
    id: 'DashboardForm.editModalTitle',
    defaultMessage: 'Edit Dashboard',
  },
  editModalSubmitButtonText: {
    id: 'DashboardForm.editModalSubmitButtonText',
    defaultMessage: 'Update',
  },
  addModalTitle: {
    id: 'DashboardForm.addModalTitle',
    defaultMessage: 'Add New Dashboard',
  },
  addModalSubmitButtonText: {
    id: 'DashboardForm.addModalSubmitButtonText',
    defaultMessage: 'Add',
  },
  modalCancelButtonText: {
    id: 'DashboardForm.modalCancelButtonText',
    defaultMessage: 'Cancel',
  },
  duplicateModalTitle: {
    id: 'DashboardForm.duplicateModalTitle',
    defaultMessage: 'Duplicate Dashboard',
  },
  duplicateModalSubmitButtonText: {
    id: 'DashboardForm.duplicateModalSubmitButtonText',
    defaultMessage: 'Duplicate',
  },
});

const LABEL_WIDTH = 90;

const createDashboardNameValidator = (dashboardItems, dashboardItem) =>
  composeBoundValidators([
    bindMessageToValidator(validate.dashboardName, 'dashboardNameHint'),
    bindMessageToValidator(
      validate.createDashboardNameUniqueValidator(dashboardItems, dashboardItem),
      'dashboardNameExistsHint',
    ),
  ]);

const getModalTexts = (type, intl) => {
  switch (type) {
    case 'edit':
      return {
        title: intl.formatMessage(messages.editModalTitle),
        submitText: intl.formatMessage(messages.editModalSubmitButtonText),
      };
    case 'duplicate':
      return {
        title: intl.formatMessage(messages.duplicateModalTitle),
        submitText: intl.formatMessage(messages.duplicateModalSubmitButtonText),
      };
    default:
      return {
        title: intl.formatMessage(messages.addModalTitle),
        submitText: intl.formatMessage(messages.addModalSubmitButtonText),
      };
  }
};

@withModal('dashboardAddEditModal')
@injectIntl
@track()
@reduxForm({
  form: 'addEditDashboard',
  validate: ({ name }, { dashboardItems = [], data: { dashboardItem = {} } }) => ({
    name: createDashboardNameValidator(dashboardItems, dashboardItem)(name),
  }),
})
export class AddEditModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      dashboardItem: PropTypes.object,
      onSubmit: PropTypes.func,
      type: PropTypes.string,
    }),
    initialize: PropTypes.func,
    dirty: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      dashboardItem: {},
      onSubmit: () => {},
      type: '',
    },
    initialize: () => {},
    handleSubmit: () => {},
  };

  componentDidMount() {
    this.props.initialize(this.props.data.dashboardItem);
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  submitFormAndCloseModal = (closeModal) => (item) => {
    const {
      tracking: { trackEvent },
      data: { dashboardItem, type },
      dirty,
    } = this.props;

    if (type === 'duplicate' || dirty) {
      const dashboardId = dashboardItem?.id;
      const isChangedDescription = item.description !== this.props.data.dashboardItem?.description;
      let dashboardEvent;

      switch (type) {
        case 'edit':
          dashboardEvent = DASHBOARD_EVENTS.clickOnButtonUpdateInModalEditDashboard(
            dashboardId,
            isChangedDescription,
          );
          break;
        case 'duplicate':
          dashboardEvent = DASHBOARD_EVENTS.clickOnBtnInModalDuplicateDashboard(
            dashboardId,
            isChangedDescription,
          );
          break;
        default:
          dashboardEvent = DASHBOARD_EVENTS.clickOnButtonInModalAddNewDashboard(
            dashboardId,
            isChangedDescription,
          );
      }

      trackEvent(dashboardEvent);
      this.props.data.onSubmit(item);
    }

    closeModal();
  };

  render() {
    const {
      intl,
      handleSubmit,
      data: { type },
    } = this.props;

    const { title, submitText } = getModalTexts(type, intl);
    const cancelText = intl.formatMessage(messages.modalCancelButtonText);

    return (
      <ModalLayout
        title={title}
        okButton={{
          text: submitText,
          onClick: (closeModal) => {
            handleSubmit(this.submitFormAndCloseModal(closeModal))();
          },
        }}
        cancelButton={{
          text: cancelText,
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form className={cx('add-dashboard-form')}>
          <ModalField
            label={intl.formatMessage(messages.dashboardNameLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="name" type="text">
              <FieldErrorHint>
                <Input
                  maxLength={'128'}
                  placeholder={intl.formatMessage(messages.dashboardNamePlaceholder)}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.dashboardDescriptionLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider
              name="description"
              maxLength="1500"
              placeholder={intl.formatMessage(messages.dashboardDescriptionPlaceholder)}
            >
              <InputTextArea />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
