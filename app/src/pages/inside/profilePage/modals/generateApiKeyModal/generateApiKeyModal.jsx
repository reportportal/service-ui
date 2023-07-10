/*
 * Copyright 2023 EPAM Systems
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { LoaderBlock } from 'pages/inside/profilePage/modals/loaderBlock';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import {
  bindMessageToValidator,
  commonValidators,
  composeBoundValidators,
  validate,
} from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { addApiKeyAction, apiKeysSelector } from 'controllers/user';
import styles from './generateApiKeyModal.scss';

const LABEL_WIDTH = 85;
const MAX_NAME_LENGTH = 40;
const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'GenerateApiKeyModal.header',
    defaultMessage: 'Generate API key',
  },
  description: {
    id: 'GenerateApiKeyModal.description',
    defaultMessage:
      'A new API Key will be generated. Keep this Key safe. We do not recommend making this Key publicly available.',
  },
  nameLabel: {
    id: 'GenerateApiKeyModal.nameLabel',
    defaultMessage: 'API Key Name',
  },
  counterText: {
    id: 'GenerateApiKeyModal.counterText',
    defaultMessage: 'Number of characters remaining: ',
  },
  exceededCounterText: {
    id: 'GenerateApiKeyModal.exceededCounterText',
    defaultMessage: 'You used {used} of {allowed} symbols',
  },
  loaderText: {
    id: 'GenerateApiKeyModal.loaderText',
    defaultMessage: 'GENERATING',
  },
  successNotification: {
    id: 'GenerateApiKeyModal.successNotification',
    defaultMessage: 'API Key has been generated successfully',
  },
  notificationFail: {
    id: 'GenerateApiKeyModal.notificationFail',
    defaultMessage: 'API Key generate failed',
  },
});

const formSelector = formValueSelector('generateApiKeyForm');

const lengthAndUniqueNameValidator = (existNames) =>
  composeBoundValidators([
    commonValidators.requiredField,
    bindMessageToValidator(validate.apiKeyName, 'apiKeyNameWrongSizeHint'),
    bindMessageToValidator(validate.uniqueApiKeyName(existNames), 'apiKeyNameUniqueHint'),
  ]);

const GenerateApiKey = ({ invalid, handleSubmit, apiKeyName }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onSuccessfulGeneration = (apiKey) => {
    setLoading(false);
    dispatch(showModalAction({ id: 'apiKeyGeneratedModal', data: { apiKey } }));
  };

  const generate = () => {
    dispatch(
      addApiKeyAction(
        apiKeyName,
        formatMessage(messages.successNotification),
        formatMessage(messages.notificationFail),
        onSuccessfulGeneration,
      ),
    );
  };

  const okButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.GENERATE),
    onClick: () => {
      setLoading(true);
      handleSubmit(generate)();
    },
    disabled: invalid,
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  const symbolsLeft = MAX_NAME_LENGTH - apiKeyName.length;

  return (
    <ModalLayout
      title={formatMessage(messages.header)}
      okButton={loading ? null : okButton}
      cancelButton={loading ? null : cancelButton}
    >
      {loading ? (
        <LoaderBlock text={formatMessage(messages.loaderText)} className={cx('loader-block')} />
      ) : (
        <>
          <div className={cx('description')}>{formatMessage(messages.description)}</div>
          <form className={cx('form')}>
            <ModalField label={formatMessage(messages.nameLabel)} labelWidth={LABEL_WIDTH}>
              <FieldProvider name="apiKeyName">
                <FieldErrorHint>
                  <Input />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>
          </form>
          <div className={cx('counter')}>
            {symbolsLeft < 0 ? (
              formatMessage(messages.exceededCounterText, {
                used: apiKeyName.length,
                allowed: MAX_NAME_LENGTH,
              })
            ) : (
              <>
                {formatMessage(messages.counterText)}
                {symbolsLeft}
              </>
            )}
          </div>
        </>
      )}
    </ModalLayout>
  );
};
GenerateApiKey.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  apiKeyName: PropTypes.string,
  apiKeys: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    }),
  ),
};
GenerateApiKey.defaultProps = {
  apiKeyName: '',
  apiKeys: [],
};

export const GenerateApiKeyModal = withModal('generateApiKeyModal')(
  connect(
    (state) => ({
      apiKeyName: formSelector(state, 'apiKeyName'),
      apiKeys: apiKeysSelector(state),
    }),
    {
      addApiKeyAction,
    },
  )(
    reduxForm({
      form: 'generateApiKeyForm',
      validate: (values, ownProps) => {
        const { apiKeyName } = values;
        const { apiKeys } = ownProps;
        const names = apiKeys.map((key) => key.name);
        return {
          apiKeyName: lengthAndUniqueNameValidator(names)(apiKeyName),
        };
      },
    })(GenerateApiKey),
  ),
);
