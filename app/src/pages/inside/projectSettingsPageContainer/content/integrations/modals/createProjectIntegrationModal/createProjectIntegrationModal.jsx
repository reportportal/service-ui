/*
 * Copyright 2022 EPAM Systems
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
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import { defineMessages, useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'components/main/modal';
import { ModalLayout } from 'componentLibrary/modal';
import { hideModalAction } from 'controllers/modal';
import { SystemMessage } from 'componentLibrary/systemMessage';
import { INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP } from 'components/integrations/formFieldComponentsMap';
import { uiExtensionIntegrationFormFieldsSelector } from 'controllers/plugins';
import { ExtensionLoader } from 'components/extensionLoader';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import styles from './createProjectIntegrationModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  GlobalIntegrationsSystemMessage: {
    id: 'IntegrationsDescription.GlobalIntegrationsSystemMessage',
    defaultMessage: 'Warning',
  },
  GlobalIntegrationsSystemMessageModalCaption: {
    id: 'IntegrationsDescription.GlobalIntegrationsSystemMessageModalCaption',
    defaultMessage: 'Global and Project Integrations can’t work at the same time.',
  },
  GlobalIntegrationsSystemMessageModalText: {
    id: 'IntegrationsDescription.GlobalIntegrationsSystemMessageModalText',
    defaultMessage:
      'Note that Global integrations will be unlinked if you create a Project Integration!',
  },
});

const CreateProjectIntegrationModal = ({ data, initialize, change, handleSubmit }) => {
  const [metaData, setMetaData] = useState({});
  const fieldsExtensions = useSelector(uiExtensionIntegrationFormFieldsSelector);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { onConfirm, customProps } = data;

  const updateMetaData = (metadata) => {
    setMetaData({ ...metaData, ...metadata });
  };

  const onSubmit = (newData, metadata) => {
    onConfirm(newData, metadata);
  };

  const okButton = {
    text: customProps.editAuthMode
      ? formatMessage(COMMON_LOCALE_KEYS.SAVE)
      : formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: () => handleSubmit(onSubmit)(),
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };
  const integrationFieldsExtension = fieldsExtensions.find(
    (ext) => ext.pluginName === data.instanceType,
  );
  const FieldsComponent =
    INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP[data.instanceType] ||
    (integrationFieldsExtension && ExtensionLoader);

  return (
    <ModalLayout
      title={data.modalTitle}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {data.hasWarningMessage && (
        <SystemMessage
          header={formatMessage(messages.GlobalIntegrationsSystemMessage)}
          mode={'warning'}
          caption={formatMessage(messages.GlobalIntegrationsSystemMessageModalCaption)}
        >
          {formatMessage(messages.GlobalIntegrationsSystemMessageModalText)}
        </SystemMessage>
      )}

      <div className={cx('content')}>
        <FieldsComponent
          initialize={initialize}
          change={change}
          updateMetaData={updateMetaData}
          extension={integrationFieldsExtension}
          {...customProps}
        />
      </div>
    </ModalLayout>
  );
};
CreateProjectIntegrationModal.propTypes = {
  data: PropTypes.object,
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};
CreateProjectIntegrationModal.defaultProps = {
  data: {},
};

export default withModal('createProjectIntegrationModal')(
  reduxForm({ form: INTEGRATION_FORM })(CreateProjectIntegrationModal),
);
