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
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import { defineMessages, useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'components/main/modal';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { SystemMessage } from 'componentLibrary/systemMessage';
import { INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP } from 'components/integrations/formFieldComponentsMap';
import { uiExtensionIntegrationFormFieldsSelector } from 'controllers/plugins';
import { ExtensionLoader } from 'components/extensionLoader';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import { useTracking } from 'react-tracking';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './addIntegrationModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  globalIntegrationsSystemMessageModalCaption: {
    id: 'IntegrationsDescription.GlobalIntegrationsSystemMessageModalCaption',
    defaultMessage: 'Global and Project Integrations can’t work at the same time.',
  },
  globalIntegrationsSystemMessageModalText: {
    id: 'IntegrationsDescription.GlobalIntegrationsSystemMessageModalText',
    defaultMessage:
      'Note that Global integrations will be unlinked if you create a Project Integration!',
  },
  createProjectTitle: {
    id: 'AddIntegrationModal.createProjectTitle',
    defaultMessage: 'Create Project Integration',
  },
  createGlobalTitle: {
    id: 'AddIntegrationModal.createGlobalTitle',
    defaultMessage: 'Create Global Integration',
  },
  editProjectIntegrationTitle: {
    id: 'AddIntegrationModal.editProjectIntegrationTitle',
    defaultMessage: 'Edit Project Integration',
  },
  editGlobalIntegrationTitle: {
    id: 'AddIntegrationModal.editGlobalIntegrationTitle',
    defaultMessage: 'Edit Global Integration',
  },
});

const AddIntegrationModal = ({ data, initialize, change, handleSubmit, dirty }) => {
  const [metaData, setMetaData] = useState({});
  const fieldsExtensions = useSelector(uiExtensionIntegrationFormFieldsSelector);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { onConfirm, customProps, isGlobal } = data;
  const integrationFieldsExtension = fieldsExtensions.find(
    (ext) => ext.pluginName === data.instanceType,
  );

  const updateMetaData = (newMetaData) => {
    setMetaData({ ...metaData, ...newMetaData });
  };

  const onSubmit = (newData) => {
    if (isGlobal && !customProps.editAuthMode) {
      trackEvent(PLUGINS_PAGE_EVENTS.clickCreateGlobalIntegration(data.instanceType));
    }

    onConfirm(newData, metaData);
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

  const createTitle = isGlobal ? messages.createGlobalTitle : messages.createProjectTitle;
  const editTitle = isGlobal
    ? messages.editGlobalIntegrationTitle
    : messages.editProjectIntegrationTitle;

  const FieldsComponent =
    INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP[data.instanceType] ||
    (integrationFieldsExtension && ExtensionLoader);

  return (
    <Modal
      title={formatMessage(customProps.editAuthMode ? editTitle : createTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
      scrollable
    >
      {data.hasWarningMessage && (
        <SystemMessage
          header={formatMessage(COMMON_LOCALE_KEYS.warning)}
          mode="warning"
          caption={formatMessage(messages.globalIntegrationsSystemMessageModalCaption)}
        >
          {formatMessage(messages.globalIntegrationsSystemMessageModalText)}
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
    </Modal>
  );
};
AddIntegrationModal.propTypes = {
  data: PropTypes.object,
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
};

export default withModal('addIntegrationModal')(
  reduxForm({ form: INTEGRATION_FORM })(AddIntegrationModal),
);
