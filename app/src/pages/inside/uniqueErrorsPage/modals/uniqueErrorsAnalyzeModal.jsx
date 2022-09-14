/*
 * Copyright 2021 EPAM Systems
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
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { track } from 'react-tracking';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { withModal } from 'controllers/modal';
import {
  showDefaultErrorNotification,
  showNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { ModalField, ModalLayout } from 'components/main/modal';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldProvider } from 'components/fields/fieldProvider';
import classNames from 'classnames/bind';
import { messages } from 'pages/inside/uniqueErrorsPage';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { projectKeySelector } from 'controllers/project/selectors';
import styles from './uniqueErrorsAnalyzeModal.scss';

const cx = classNames.bind(styles);

@withModal('uniqueErrorsAnalyzeModal')
@reduxForm({
  form: 'uniqueErrorsAnalyzeModal',
  initialValues: { removeNumbers: false },
})
@track()
@injectIntl
@connect(
  (state) => ({
    projectKey: projectKeySelector(state),
  }),
  {
    showNotification,
    showDefaultErrorNotification,
  },
)
export class UniqueErrorsAnalyzeModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    data: PropTypes.shape({
      launch: PropTypes.object.isRequired,
      updateLaunchLocally: PropTypes.func,
      events: PropTypes.object,
    }).isRequired,
    projectKey: PropTypes.string.isRequired,
    showNotification: PropTypes.func,
    showDefaultErrorNotification: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    handleSubmit: () => {},
    showNotification: () => {},
    showDefaultErrorNotification: () => {},
    events: {},
  };

  onSubmit = ({ removeNumbers }) => {
    const { projectKey, data } = this.props;
    const { launch, updateLaunchLocally } = data;
    fetch(URLS.runUniqueErrorAnalysis(projectKey), {
      method: 'POST',
      data: {
        launchId: launch.id,
        removeNumbers,
      },
    })
      .then(({ message }) => {
        this.props.showNotification({
          message,
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        const analysing = launch.analysing;
        const item = {
          ...launch,
          analysing: [...analysing, ANALYZER_TYPES.CLUSTER_ANALYSER],
        };
        updateLaunchLocally(item);
        const { events } = data;
        events.clickAnalyzeEvent &&
          this.props.tracking.trackEvent(events.clickAnalyzeEvent(removeNumbers));
      })
      .catch(this.props.showDefaultErrorNotification);
  };

  render() {
    const {
      handleSubmit,
      intl: { formatMessage },
    } = this.props;

    const okButton = {
      text: formatMessage(messages.uniqueErrAnalyzeModalOkBtn),
      onClick: (closeModal) => {
        handleSubmit((values) => {
          this.onSubmit(values);
          closeModal();
        })();
      },
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    const options = [
      { label: formatMessage(messages.uniqueErrAnalyzeModalIncludeNumbers), value: false },
      { label: formatMessage(messages.uniqueErrAnalyzeModalExcludeNumbers), value: true },
    ];

    return (
      <ModalLayout
        title={formatMessage(messages.uniqueErrAnalyzeModalTitle)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <form className={cx('unique-errors-modal')}>
          <p className={cx('unique-errors-modal-text')}>
            {formatMessage(messages.uniqueErrAnalyzeModalText)}
          </p>
          <ModalField label={formatMessage(messages.uniqueErrAnalyzeModalFieldName)}>
            <FieldProvider name="removeNumbers">
              <InputDropdown options={options} />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
