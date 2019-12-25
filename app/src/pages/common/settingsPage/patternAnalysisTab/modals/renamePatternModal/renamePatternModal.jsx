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
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { injectIntl, defineMessages } from 'react-intl';
import track from 'react-tracking';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ModalLayout, ModalField, withModal } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { patternsSelector } from 'controllers/project';

const LABEL_WIDTH = 110;

const messages = defineMessages({
  patternName: {
    id: 'PatternAnalysis.patternName',
    defaultMessage: 'Pattern Name',
  },
  renamePatternMessage: {
    id: 'PatternAnalysis.renamePatternMessage',
    defaultMessage: 'Rename pattern rule',
  },
});

@withModal('renamePatternModal')
@connect((state) => ({
  patterns: patternsSelector(state),
}))
@reduxForm({
  form: 'renamePatternForm',
  validate: ({ name }, { patterns, data }) => ({
    name: commonValidators.createPatternNameValidator(
      patterns,
      data.pattern && data.pattern.id,
    )(name),
  }),
})
@injectIntl
@track()
export class RenamePatternModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      pattern: PropTypes.object,
      onSave: PropTypes.func,
    }),
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {},
  };

  componentDidMount() {
    this.props.initialize(this.props.data.pattern);
  }

  saveAndClose = (closeModal) => (pattern) => {
    const {
      data: { onSave },
      tracking,
    } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.SAVE_BTN_RENAME_PATTERN_MODAL);
    onSave(pattern);
    closeModal();
  };

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
    } = this.props;

    return (
      <ModalLayout
        title={formatMessage(messages.renamePatternMessage)}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: (closeModal) => handleSubmit(this.saveAndClose(closeModal))(),
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: SETTINGS_PAGE_EVENTS.CANCEL_BTN_RENAME_PATTERN_MODAL,
        }}
        closeIconEventInfo={SETTINGS_PAGE_EVENTS.CLOSE_ICON_RENAME_PATTERN_MODAL}
      >
        <ModalField label={formatMessage(messages.patternName)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name="name" type="text">
            <FieldErrorHint>
              <Input maxLength={'55'} />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
      </ModalLayout>
    );
  }
}
