/*
 * Copyright 2026 EPAM Systems
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

import { FC, useState, useMemo, useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Modal, SegmentedControl } from '@reportportal/ui-kit';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { withModal } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { useModalButtons } from 'hooks/useModalButtons';
import { createClassnames } from 'common/utils';
import {
  getDefaultIssueModalConfig,
  getDefaultOptionValueKey,
  createFieldsValidationConfig,
  getDataSectionConfig,
  validate,
} from 'pages/inside/stepPage/modals/postIssueModal/utils';
import { userIdSelector } from 'controllers/user';
import {
  normalizeFieldsWithOptions,
  mapFieldsToValues,
  removeNoneValues,
} from 'components/fields/dynamicFieldsSection/utils';
import {
  INCLUDE_ATTACHMENTS_KEY,
  INCLUDE_COMMENTS_KEY,
  INCLUDE_LOGS_KEY,
  LOG_QUANTITY,
} from 'pages/inside/stepPage/modals/postIssueModal/constants';
import { ISSUE_TYPE_FIELD_KEY } from 'components/integrations/elements/bts/constants';
import { namedAvailableBtsIntegrationsSelector } from 'controllers/plugins';

import { messages as commonMessages } from '../messages';
import { messages } from './messages';
import { BTS_ISSUES_MODAL } from '../constants';
import { LinkBTSIssueForm } from './LinkBTSIssueForm';
import { PostBTSIssueForm } from './PostBTSIssueForm/PostBTSIssueForm';
import { DynamicField, BTSIntegration } from './types';

import styles from './BTSIssuesModal.scss';

const cx = createClassnames(styles);

let validationConfig: Record<string, unknown> | null = null;

enum BTSIssueActionTypes {
  POST = 'post',
  LINK = 'link',
}

interface BTSIssuesModalOwnProps {
  data: {
    executionId: number;
  };
}

type BTSIssuesModalProps = BTSIssuesModalOwnProps &
  InjectedFormProps<Record<string, unknown>, BTSIssuesModalOwnProps>;

const BTSIssuesModalComponent: FC<BTSIssuesModalProps> = ({
  data,
  handleSubmit,
  initialize,
  invalid,
  dirty,
  reset,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const namedBtsIntegrations = useSelector(namedAvailableBtsIntegrationsSelector) as Record<
    string,
    BTSIntegration[]
  >;
  const userId = useSelector(userIdSelector);
  const projectKey = useSelector(projectKeySelector);

  const executionId = data?.executionId;
  const [isLoading, setIsLoading] = useState(false);

  const initIntegrationFields = useCallback(
    (defectFormFields: DynamicField[] = [], pluginName = '') => {
      const defaultOptionValueKey = getDefaultOptionValueKey(pluginName) as string;
      const normalizedFields = normalizeFieldsWithOptions(
        defectFormFields,
        defaultOptionValueKey,
      ) as DynamicField[];
      const fields = normalizedFields.map((item) =>
        item.fieldType === ISSUE_TYPE_FIELD_KEY ? { ...item, disabled: true } : item,
      );
      validationConfig = createFieldsValidationConfig(fields);
      return fields;
    },
    [],
  );

  const initialConfig = useMemo(() => {
    const { pluginName, integration } = getDefaultIssueModalConfig(
      namedBtsIntegrations,
      userId,
    ) as {
      pluginName: string;
      integration: {
        id?: number;
        integrationParameters?: { defectFormFields: DynamicField[] };
      };
    };

    const id = integration?.id;
    const defectFormFields = integration?.integrationParameters?.defectFormFields ?? [];

    const fields = initIntegrationFields(defectFormFields, pluginName);

    return {
      fields,
      pluginName,
      integrationId: id,
    };
  }, [userId, initIntegrationFields, namedBtsIntegrations]);

  const [fields, setFields] = useState<DynamicField[]>(initialConfig.fields);
  const [pluginName, setPluginName] = useState<string>(initialConfig.pluginName);
  const [integrationId, setIntegrationId] = useState(initialConfig.integrationId);

  // Initialize form with field values
  useEffect(() => {
    initialize({
      ...getDataSectionConfig(true),
      ...mapFieldsToValues(fields),
    });
  }, [fields, initialize]);

  const handlePluginChange = useCallback(
    (newPluginName: string) => {
      if (newPluginName === pluginName) {
        return;
      }

      const integration = namedBtsIntegrations[newPluginName]?.[0];
      if (!integration) {
        return;
      }

      const { id, integrationParameters } = integration;
      const defectFormFields = integrationParameters.defectFormFields;
      const newFields = initIntegrationFields(defectFormFields, newPluginName);

      setPluginName(newPluginName);
      setFields(newFields);
      setIntegrationId(id);
    },
    [pluginName, initIntegrationFields, namedBtsIntegrations],
  );

  const handleIntegrationChange = useCallback(
    (newIntegrationId: number) => {
      if (newIntegrationId === integrationId) {
        return;
      }

      const integration = namedBtsIntegrations[pluginName]?.find(
        (item: BTSIntegration) => item.id === newIntegrationId,
      );

      if (!integration) {
        return;
      }

      const defectFormFields = integration.integrationParameters.defectFormFields;
      const newFields = initIntegrationFields(defectFormFields, pluginName);

      setFields(newFields);
      setIntegrationId(newIntegrationId);
    },
    [integrationId, pluginName, initIntegrationFields, namedBtsIntegrations],
  );

  const prepareDataToSend = useCallback(
    (formData: Record<string, unknown>) => {
      const refinedData = removeNoneValues(formData) as Record<string, unknown>;
      const preparedFields = fields.map((field) => {
        const formFieldData = refinedData[field.id];

        // Value should always be an array of strings for all field types
        let value: string[];

        if (Array.isArray(formFieldData)) {
          value = formFieldData.map((item) => String(item));
        } else if (typeof formFieldData === 'string' || typeof formFieldData === 'number') {
          value = [String(formFieldData)];
        } else {
          value = [];
        }

        return {
          ...field,
          value,
        };
      });

      return {
        [INCLUDE_COMMENTS_KEY]: refinedData[INCLUDE_COMMENTS_KEY],
        [INCLUDE_ATTACHMENTS_KEY]: refinedData[INCLUDE_ATTACHMENTS_KEY],
        [INCLUDE_LOGS_KEY]: refinedData[INCLUDE_LOGS_KEY],
        logQuantity: LOG_QUANTITY,
        item: executionId,
        fields: preparedFields,
        backLinks: {
          [executionId]: window.location.href,
        },
      };
    },
    [fields, executionId],
  );

  const postIssue = useCallback(
    (issueData: Record<string, unknown>, onSuccess: () => void) => {
      const url = URLS.btsIntegrationPostTicket(projectKey, integrationId);

      setIsLoading(true);

      fetch(url, {
        method: 'POST',
        data: issueData,
      })
        .then(() => {
          setIsLoading(false);
          dispatch(
            showSuccessNotification({
              message: formatMessage(messages.postIssueSuccess),
            }),
          );
          onSuccess();
        })
        .catch((err: Error) => {
          setIsLoading(false);
          dispatch(
            showErrorNotification({
              message: `${formatMessage(messages.postIssueFailed)}. ${err.message}`,
            }),
          );
        });
    },
    [projectKey, integrationId, dispatch, formatMessage],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: 'OK',
    isLoading,
    isSubmitButtonDisabled: invalid,
    onSubmit: () => {
      handleSubmit((values: Record<string, unknown>) => {
        const issueData = prepareDataToSend(values);
        postIssue(issueData, hideModal);
      })();
    },
  });

  const [selectedControl, setSelectedControl] = useState(BTSIssueActionTypes.LINK);

  const handleControlChange = (value: BTSIssueActionTypes) => {
    setSelectedControl(value);
    reset();
  };

  if (!data) {
    return null;
  }

  return (
    <Modal
      title={formatMessage(commonMessages.postIssueToBts)}
      onClose={hideModal}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      scrollable
      className={cx('bts-issues-modal')}
    >
      <div className={cx('bts-controls')}>
        <span className={cx('label')}>{formatMessage(messages.selectAnActionForBTS)}</span>
        <SegmentedControl
          fullWidth
          onChange={handleControlChange}
          options={[
            {
              label: formatMessage(messages.postIssue),
              value: BTSIssueActionTypes.POST,
              selected: selectedControl === BTSIssueActionTypes.POST,
            },
            {
              label: formatMessage(messages.linkIssue),
              value: BTSIssueActionTypes.LINK,
              selected: selectedControl === BTSIssueActionTypes.LINK,
            },
          ]}
        />
      </div>

      {selectedControl === BTSIssueActionTypes.POST && (
        <PostBTSIssueForm
          namedBtsIntegrations={namedBtsIntegrations}
          pluginName={pluginName}
          integrationId={integrationId}
          fields={fields}
          onChangePlugin={handlePluginChange}
          onChangeIntegration={handleIntegrationChange}
        />
      )}

      {selectedControl === BTSIssueActionTypes.LINK && <LinkBTSIssueForm />}
    </Modal>
  );
};

export const BTSIssuesModal = withModal(BTS_ISSUES_MODAL)(
  reduxForm<Record<string, unknown>, BTSIssuesModalOwnProps>({
    form: 'btsIssuesModalForm',
    destroyOnUnmount: true,
    validate: (fields) => validate(fields, validationConfig),
  })(BTSIssuesModalComponent),
);
