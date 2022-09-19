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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { reduxForm, SubmissionError } from 'redux-form';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { getAddEditFilterModalEvents } from 'components/main/analytics/events';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor } from 'components/main/markdown';
import { commonValidators, validateAsync } from 'common/utils/validation';
import { projectKeySelector } from 'controllers/project';

const messages = defineMessages({
  name: {
    id: 'Filter.name',
    defaultMessage: 'Name',
  },
  namePlaceholder: {
    id: 'Filter.namePlaceholder',
    defaultMessage: 'Enter filter name',
  },
  descriptionPlaceholder: {
    id: 'Filter.descriptionPlaceholder',
    defaultMessage: 'Enter filter description',
  },
  edit: {
    id: 'Filter.edit',
    defaultMessage: 'Edit filter',
  },
  add: {
    id: 'Filter.add',
    defaultMessage: 'Add filter',
  },
});

const validateFilterNameUniqueness = (projectKey, id, name) =>
  validateAsync.filterNameUnique(projectKey, id >= 0 ? id : undefined, name);

@withModal('filterEditModal')
@injectIntl
@connect((state) => ({
  projectKey: projectKeySelector(state),
}))
@reduxForm({
  form: 'filterEditForm',
  validate: ({ name }) => ({ name: commonValidators.filterName(name) }),
  asyncValidate: ({ id, name }, dispatch, { projectKey }) =>
    validateFilterNameUniqueness(projectKey, id, name),
  asyncChangeFields: ['name'],
  asyncBlurFields: ['name'],
})
@track()
export class FilterEditModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      filter: PropTypes.object,
      onEdit: PropTypes.func,
      creationMode: PropTypes.bool,
    }).isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    projectKey: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.events = getAddEditFilterModalEvents(!props.data.creationMode);
  }

  componentDidMount() {
    this.props.initialize(this.props.data.filter);
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getOkButtonTitle = () => {
    const {
      data: { creationMode },
      intl,
    } = this.props;
    const message = creationMode ? COMMON_LOCALE_KEYS.ADD : COMMON_LOCALE_KEYS.UPDATE;
    return intl.formatMessage(message);
  };

  getTitle = () => {
    const {
      data: { creationMode },
      intl,
    } = this.props;
    const message = creationMode ? messages.add : messages.edit;
    return intl.formatMessage(message);
  };

  saveFilterAndCloseModal = (closeModal) => (values) =>
    validateFilterNameUniqueness(this.props.projectKey, values.id, values.name)
      .then(() => {
        this.props.data.onEdit(values);
        closeModal();
      })
      .catch((error) => {
        throw new SubmissionError(error);
      });

  render() {
    const { intl, handleSubmit, tracking } = this.props;
    const okButton = {
      text: this.getOkButtonTitle(),
      onClick: (closeModal) => {
        tracking.trackEvent(this.events.clickOkBtn);
        handleSubmit(this.saveFilterAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: this.events.clickCancelBtn,
    };
    return (
      <ModalLayout
        title={this.getTitle()}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={this.events.clickCloseIcon}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form>
          <ModalField label={intl.formatMessage(messages.name)}>
            <FieldProvider name="name">
              <FieldErrorHint>
                <Input maxLength="128" placeholder={intl.formatMessage(messages.namePlaceholder)} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField>
            <FieldProvider name="description">
              <MarkdownEditor
                eventsInfo={{ onChange: this.events.editDescription }}
                placeholder={intl.formatMessage(messages.descriptionPlaceholder)}
              />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
