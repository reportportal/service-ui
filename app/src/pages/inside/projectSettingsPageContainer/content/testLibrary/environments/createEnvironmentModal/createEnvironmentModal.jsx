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

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';

import { Modal, FieldText, FieldTextFlex } from '@reportportal/ui-kit';
import { ExternalLink } from 'pages/inside/common/externalLink';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import { FieldProvider, FieldErrorHint } from 'components/fields';
import {
  FieldElement,
  InfoBlockWithControl,
} from 'pages/inside/projectSettingsPageContainer/content/elements';
import { messages } from './messages';

import styles from './createEnvironmentModal.scss';

const cx = classNames.bind(styles);

const nameMaxLengthDisplay = 60;
const testDataMaxLengthDisplay = 1000;

const CreateEnvironmentModal = ({ data = {}, handleSubmit, dirty = false }) => {
  const { onSave } = data;

  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: () => handleSubmit(onSave)(),
    'data-automation-id': 'submitButton',
  };
  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={data.modalTitle || formatMessage(messages.header)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('content')}>
        <FieldProvider name="name" dataAutomationId="environmentNameField">
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(COMMON_LOCALE_KEYS.NAME)}
              placeholder={formatMessage(messages.nameFieldPlaceholder)}
              defaultWidth={false}
              maxLengthDisplay={nameMaxLengthDisplay}
            />
          </FieldErrorHint>
        </FieldProvider>
        <FieldElement
          className={cx('test-data-field')}
          label={formatMessage(messages.testDataFieldLabel)}
          name="testData"
          dataAutomationId="testDataField"
        >
          <FieldErrorHint provideHint={false}>
            <FieldTextFlex
              placeholder={formatMessage(messages.testDataFieldPlaceholder)}
              maxLengthDisplay={testDataMaxLengthDisplay}
            />
          </FieldErrorHint>
        </FieldElement>
        <div className={cx('test-data-source')}>
          <strong>{formatMessage(messages.testDataSourceTitle)}</strong>
          <p>{formatMessage(messages.testDataSourceDescription)}</p>
          <InfoBlockWithControl
            className={cx('info-block')}
            label={formatMessage(messages.noAvailableDataset)}
            control={
              <ExternalLink className={cx('external-link')} href="#">
                {formatMessage(messages.createNewDataset)}
              </ExternalLink>
            }
          />
        </div>
      </div>
    </Modal>
  );
};

CreateEnvironmentModal.propTypes = {
  data: PropTypes.shape({
    modalTitle: PropTypes.string,
    onSave: PropTypes.func,
  }),
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
};

export default withModal('createEnvironmentModal')(
  reduxForm({
    form: 'createEnvironmentForm',
  })(CreateEnvironmentModal),
);
